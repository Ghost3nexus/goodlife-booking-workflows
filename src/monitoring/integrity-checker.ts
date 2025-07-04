import { SupabaseService } from '../services/supabase';
import { GoogleCalendarService } from '../services/calendar';
import { SlackService } from '../services/slack';

interface IntegrityIssue {
  type: 'capacity_mismatch' | 'missing_reservation' | 'orphaned_reservation';
  eventId: string;
  description: string;
  calendarData?: any;
  dbData?: any;
}

export class IntegrityChecker {
  private supabase: SupabaseService;
  private calendar: GoogleCalendarService;
  private slack: SlackService;

  constructor() {
    this.supabase = new SupabaseService();
    this.calendar = new GoogleCalendarService();
    this.slack = new SlackService();
  }

  async performConsistencyCheck(): Promise<IntegrityIssue[]> {
    const issues: IntegrityIssue[] = [];

    try {
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ahead

      const calendarEvents = await this.calendar.getAvailableSlots(startDate, endDate);
      
      for (const event of calendarEvents) {
        const eventIssues = await this.checkEventConsistency(event);
        issues.push(...eventIssues);
      }

      if (issues.length > 0) {
        await this.reportIssues(issues);
      }

      return issues;

    } catch (error) {
      await this.slack.sendAlert(`Integrity check failed: ${error}`, 'error');
      throw error;
    }
  }

  private async checkEventConsistency(event: any): Promise<IntegrityIssue[]> {
    const issues: IntegrityIssue[] = [];

    try {
      const reservations = await this.supabase.getReservationsByEventId(event.id);
      const dbCount = reservations.length;
      const calendarCurrent = parseInt(event.extendedProperties?.private?.current || '0');
      const calendarCapacity = parseInt(event.extendedProperties?.private?.capacity || '1');

      if (dbCount !== calendarCurrent) {
        issues.push({
          type: 'capacity_mismatch',
          eventId: event.id,
          description: `Calendar shows ${calendarCurrent} reservations, DB has ${dbCount}`,
          calendarData: { current: calendarCurrent, capacity: calendarCapacity },
          dbData: { count: dbCount, reservations: reservations.map(r => r.id) }
        });
      }

      if (dbCount > calendarCapacity) {
        issues.push({
          type: 'capacity_mismatch',
          eventId: event.id,
          description: `Overbooking detected: ${dbCount} reservations for capacity ${calendarCapacity}`,
          calendarData: { capacity: calendarCapacity },
          dbData: { count: dbCount }
        });
      }

    } catch (error) {
      console.error(`Error checking event ${event.id}:`, error);
    }

    return issues;
  }

  async fixCapacityMismatch(eventId: string): Promise<void> {
    try {
      const reservations = await this.supabase.getReservationsByEventId(eventId);
      const actualCount = reservations.length;
      
      await this.calendar.updateEventCapacity(eventId, actualCount);
      
      await this.slack.sendIntegrityAlert(
        `Fixed capacity mismatch for event ${eventId}: updated to ${actualCount} reservations`
      );

    } catch (error) {
      await this.slack.sendAlert(`Failed to fix capacity mismatch for ${eventId}: ${error}`, 'error');
      throw error;
    }
  }

  private async reportIssues(issues: IntegrityIssue[]): Promise<void> {
    const summary = issues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const message = `Integrity check found ${issues.length} issues:\n` +
      Object.entries(summary).map(([type, count]) => `- ${type}: ${count}`).join('\n') +
      '\n\nFirst 5 issues:\n' +
      issues.slice(0, 5).map(issue => `• ${issue.eventId}: ${issue.description}`).join('\n');

    await this.slack.sendIntegrityAlert(message);
  }

  async getIntegrityReport(): Promise<{
    totalEvents: number;
    totalReservations: number;
    issues: IntegrityIssue[];
    lastChecked: string;
  }> {
    const issues = await this.performConsistencyCheck();
    
    const startDate = new Date().toISOString();
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const events = await this.calendar.getAvailableSlots(startDate, endDate);
    
    let totalReservations = 0;
    for (const event of events) {
      const reservations = await this.supabase.getReservationsByEventId(event.id);
      totalReservations += reservations.length;
    }

    return {
      totalEvents: events.length,
      totalReservations,
      issues,
      lastChecked: new Date().toISOString()
    };
  }
}
