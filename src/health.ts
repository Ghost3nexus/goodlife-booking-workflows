export async function healthCheck(): Promise<{ status: string; timestamp: string }> {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString()
  };
}
