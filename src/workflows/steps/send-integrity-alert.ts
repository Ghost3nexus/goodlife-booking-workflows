import { SlackService } from '../../services/slack';

export async function sendIntegrityAlert(context: any): Promise<any> {
  const slack = new SlackService();
  const { inconsistencies, totalChecked } = context.steps['compare-data'].output;
  const { fixedEvents } = context.steps['handle-inconsistencies'].output;
  
  const message = `整合性チェック結果:
- チェック対象: ${totalChecked}イベント
- 不整合発見: ${inconsistencies.length}件
- 自動修正: ${fixedEvents.length}件

修正されたイベント: ${fixedEvents.join(', ')}`;

  await slack.sendIntegrityAlert(message);
  
  return { alert_sent: true };
}
