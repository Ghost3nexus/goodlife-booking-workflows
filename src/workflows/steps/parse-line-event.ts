export async function parseLineEvent(context: any): Promise<any> {
  const { body } = context.request;
  const data = JSON.parse(body);
  
  if (!data.events || data.events.length === 0) {
    throw new Error('No events in LINE webhook');
  }

  const event = data.events[0];
  
  return {
    type: event.type,
    userId: event.source.userId,
    message: event.message,
    postback: event.postback,
    timestamp: event.timestamp
  };
}
