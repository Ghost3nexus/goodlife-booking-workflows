import { IntegrityChecker } from '../../monitoring/integrity-checker';

export async function handleInconsistencies(context: any): Promise<any> {
  const { inconsistencies } = context.steps['compare-data'].output;
  const checker = new IntegrityChecker();
  
  const fixedEvents: string[] = [];
  
  for (const inconsistency of inconsistencies.slice(0, 5)) {
    try {
      await checker.fixCapacityMismatch(inconsistency.eventId);
      fixedEvents.push(inconsistency.eventId);
    } catch (error) {
      console.error(`Failed to fix ${inconsistency.eventId}:`, error);
    }
  }
  
  return {
    fixedEvents,
    totalFixed: fixedEvents.length,
    totalInconsistencies: inconsistencies.length
  };
}
