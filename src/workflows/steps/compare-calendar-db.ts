export async function compareCalendarDb(context: any): Promise<any> {
  const { events } = context.steps['fetch-calendar-events'].output;
  const { reservationsByEvent } = context.steps['fetch-db-reservations'].output;
  
  const inconsistencies: any[] = [];
  
  for (const event of events) {
    const reservations = reservationsByEvent[event.id] || [];
    const dbCount = reservations.length;
    const calendarCurrent = parseInt(event.extendedProperties?.private?.current || '0');
    
    if (dbCount !== calendarCurrent) {
      inconsistencies.push({
        eventId: event.id,
        dbCount,
        calendarCurrent,
        difference: Math.abs(dbCount - calendarCurrent)
      });
    }
  }
  
  return {
    hasInconsistencies: inconsistencies.length > 0,
    inconsistencies,
    totalChecked: events.length
  };
}
