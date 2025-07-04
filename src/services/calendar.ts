import { google } from 'googleapis';
import { CONFIG } from '../config';
import { CalendarEvent } from '../types';

export class GoogleCalendarService {
  private calendar;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(CONFIG.GOOGLE_SERVICE_ACCOUNT_KEY),
      scopes: ['https://www.googleapis.com/auth/calendar']
    });

    this.calendar = google.calendar({ version: 'v3', auth });
  }

  async getAvailableSlots(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    const response = await this.calendar.events.list({
      calendarId: CONFIG.GOOGLE_CALENDAR_ID,
      timeMin: startDate,
      timeMax: endDate,
      singleEvents: true,
      orderBy: 'startTime',
      q: 'GLJ_'
    });

    return response.data.items?.map(event => ({
      id: event.id!,
      summary: event.summary!,
      start: {
        dateTime: event.start?.dateTime || event.start?.date || '',
        timeZone: event.start?.timeZone || undefined
      },
      end: {
        dateTime: event.end?.dateTime || event.end?.date || '',
        timeZone: event.end?.timeZone || undefined
      },
      extendedProperties: event.extendedProperties
    })) || [];
  }

  async updateEventCapacity(eventId: string, current: number): Promise<void> {
    const event = await this.calendar.events.get({
      calendarId: CONFIG.GOOGLE_CALENDAR_ID,
      eventId
    });

    const capacity = parseInt(event.data.extendedProperties?.private?.capacity || '1');
    
    await this.calendar.events.update({
      calendarId: CONFIG.GOOGLE_CALENDAR_ID,
      eventId,
      requestBody: {
        ...event.data,
        extendedProperties: {
          private: {
            ...event.data.extendedProperties?.private,
            current: current.toString(),
            capacity: capacity.toString()
          }
        }
      }
    });
  }

  async getEventById(eventId: string): Promise<CalendarEvent> {
    const response = await this.calendar.events.get({
      calendarId: CONFIG.GOOGLE_CALENDAR_ID,
      eventId
    });

    return {
      id: response.data.id!,
      summary: response.data.summary!,
      start: {
        dateTime: response.data.start?.dateTime || response.data.start?.date || '',
        timeZone: response.data.start?.timeZone || undefined
      },
      end: {
        dateTime: response.data.end?.dateTime || response.data.end?.date || '',
        timeZone: response.data.end?.timeZone || undefined
      },
      extendedProperties: response.data.extendedProperties
    };
  }

  isSlotAvailable(event: CalendarEvent): boolean {
    const capacity = parseInt(event.extendedProperties?.private?.capacity || '1');
    const current = parseInt(event.extendedProperties?.private?.current || '0');
    return current < capacity;
  }
}
