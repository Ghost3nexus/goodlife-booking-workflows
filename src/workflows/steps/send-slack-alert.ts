import { SlackService } from '../../services/slack';

export async function sendSlackAlert(context: any): Promise<any> {
  const slack = new SlackService();
  const error = context.error || 'Unknown workflow error';
  
  await slack.sendAlert(`Workflow error: ${error}`, 'error');
  
  return { alert_sent: true };
}
