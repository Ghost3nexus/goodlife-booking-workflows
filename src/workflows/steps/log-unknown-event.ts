export async function logUnknownEvent(context: any): Promise<any> {
  const event = context.steps['parse-event'].output;
  
  console.log('Unknown LINE event type:', event.type);
  
  return { logged: true, eventType: event.type };
}
