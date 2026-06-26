import { emitAlert } from './SocketService.js';

export interface WorkflowRule {
  id: string;
  name: string;
  condition: {
    metric: string;
    operator: '>' | '<' | '==';
    value: number | string;
  };
  actions: {
    type: 'socket' | 'webhook' | 'email';
    target?: string;
    message: string;
  }[];
}

export class WorkflowEngine {
  private static rules: WorkflowRule[] = [
    {
      id: 'rule-high-aqi',
      name: 'Critical Air Quality Alert',
      condition: { metric: 'aqi', operator: '>', value: 150 },
      actions: [
        { type: 'socket', message: 'Critical Air Quality (AQI > 150) detected in your area.' }
      ]
    },
    {
      id: 'rule-flood-risk',
      name: 'High Flood Risk Warning',
      condition: { metric: 'flood_score', operator: '>', value: 70 },
      actions: [
        { type: 'socket', message: 'Extreme Flood Risk Warning: Seek higher ground.' }
      ]
    }
  ];

  static async process(metrics: Record<string, any>) {
    for (const rule of this.rules) {
      const { metric, operator, value } = rule.condition;
      const actualValue = metrics[metric];

      let triggered = false;
      if (operator === '>' && actualValue > value) triggered = true;
      if (operator === '<' && actualValue < value) triggered = true;
      if (operator === '==' && actualValue == value) triggered = true;

      if (triggered) {
        for (const action of rule.actions) {
          if (action.type === 'socket') {
            emitAlert({
              type: 'WORKFLOW_TRIGGER',
              ruleName: rule.name,
              message: action.message,
              timestamp: new Date().toISOString()
            });
          }
          // In real implementation, handle webhook/email here
          console.log(`Workflow Triggered: ${rule.name} -> ${action.type}`);
        }
      }
    }
  }
}
