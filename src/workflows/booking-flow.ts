import { SupabaseService } from '../services/supabase';
import { GoogleCalendarService } from '../services/calendar';
import { LineService } from '../services/line';
import { SlackService } from '../services/slack';
import { BookingRequest, WorkflowContext, ReservationStatus } from '../types';

export class BookingFlow {
  private supabase: SupabaseService;
  private calendar: GoogleCalendarService;
  private line: LineService;
  private slack: SlackService;

  constructor() {
    this.supabase = new SupabaseService();
    this.calendar = new GoogleCalendarService();
    this.line = new LineService();
    this.slack = new SlackService();
  }

  async processBookingRequest(request: BookingRequest): Promise<WorkflowContext> {
    const context: WorkflowContext = {};

    try {
      let user = await this.supabase.getUserByLineUid(request.line_uid);
      
      if (!user) {
        user = await this.supabase.createUser({
          line_uid: request.line_uid,
          name: request.user_name,
          email: request.user_email,
          phone: request.user_phone
        });
      }
      context.user = user;

      const calendarEvent = await this.calendar.getEventById(request.event_id);
      context.calendar_event = calendarEvent;

      if (!this.calendar.isSlotAvailable(calendarEvent)) {
        throw new Error('Selected time slot is no longer available');
      }

      const reservation = await this.supabase.createReservationWithLock({
        user_id: user.id,
        event_id: request.event_id,
        status: ReservationStatus.CONFIRMED,
        paid: false
      });
      context.reservation = reservation;

      const currentCount = await this.getCurrentReservationCount(request.event_id);
      await this.calendar.updateEventCapacity(request.event_id, currentCount + 1);

      const eventDetails = this.formatEventDetails(calendarEvent);
      await this.line.sendBookingConfirmation(request.line_uid, eventDetails);

      await this.slack.sendBookingAlert('created', `${user.name} - ${eventDetails}`);

      return context;

    } catch (error) {
      context.error = error instanceof Error ? error.message : 'Unknown error';
      await this.slack.sendAlert(`Booking failed: ${context.error}`, 'error');
      throw error;
    }
  }

  async getAvailableSlots(startDate: string, endDate: string, lineUid: string) {
    try {
      const events = await this.calendar.getAvailableSlots(startDate, endDate);
      const availableSlots = events
        .filter(event => this.calendar.isSlotAvailable(event))
        .slice(0, 5)
        .map(event => ({
          id: event.id,
          time: this.formatTimeSlot(event)
        }));

      const quickReplyItems = this.line.createTimeSlotQuickReply(availableSlots);
      
      await this.line.sendQuickReplyMessage(
        lineUid,
        '利用可能な時間帯を選択してください：',
        quickReplyItems
      );

      return availableSlots;

    } catch (error) {
      await this.slack.sendAlert(`Failed to fetch available slots: ${error}`, 'error');
      throw error;
    }
  }

  async cancelReservation(reservationId: string, lineUid: string): Promise<void> {
    try {
      const reservation = await this.supabase.updateReservationStatus(reservationId, ReservationStatus.CANCELLED);
      
      const calendarEvent = await this.calendar.getEventById(reservation.event_id);
      const currentCount = await this.getCurrentReservationCount(reservation.event_id);
      await this.calendar.updateEventCapacity(reservation.event_id, Math.max(0, currentCount - 1));

      const eventDetails = this.formatEventDetails(calendarEvent);
      await this.line.sendBookingCancellation(lineUid, eventDetails);

      await this.slack.sendBookingAlert('cancelled', eventDetails);

    } catch (error) {
      await this.slack.sendAlert(`Cancellation failed: ${error}`, 'error');
      throw error;
    }
  }

  private async getCurrentReservationCount(eventId: string): Promise<number> {
    const reservations = await this.supabase.getReservationsByEventId(eventId);
    return reservations.length;
  }

  private formatEventDetails(event: any): string {
    const startTime = new Date(event.start.dateTime).toLocaleString('ja-JP');
    const endTime = new Date(event.end.dateTime).toLocaleString('ja-JP');
    return `${event.summary}\n${startTime} - ${endTime}`;
  }

  private formatTimeSlot(event: any): string {
    const startTime = new Date(event.start.dateTime);
    const month = startTime.getMonth() + 1;
    const day = startTime.getDate();
    const hour = startTime.getHours();
    const minute = startTime.getMinutes();
    return `${month}/${day} ${hour}:${minute.toString().padStart(2, '0')}`;
  }
}
