import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { api } from '../api/client';

const PENDING_REPORTS_KEY = '@herp/pending_reports';

export interface PendingReport {
  id: string;
  data: any;
  timestamp: number;
}

export class OfflineSyncService {
  static async saveReportOffline(reportData: any) {
    const pendingJson = await AsyncStorage.getItem(PENDING_REPORTS_KEY);
    const pending: PendingReport[] = pendingJson ? JSON.parse(pendingJson) : [];

    pending.push({
      id: Math.random().toString(36).substr(2, 9),
      data: reportData,
      timestamp: Date.now()
    });

    await AsyncStorage.setItem(PENDING_REPORTS_KEY, JSON.stringify(pending));
    console.log('Report saved offline');
  }

  static async syncReports() {
    const state = await NetInfo.fetch();
    if (!state.isConnected) return;

    const pendingJson = await AsyncStorage.getItem(PENDING_REPORTS_KEY);
    if (!pendingJson) return;

    const pending: PendingReport[] = JSON.parse(pendingJson);
    if (pending.length === 0) return;

    console.log(`Syncing ${pending.length} pending reports...`);

    const remaining: PendingReport[] = [];
    for (const report of pending) {
      try {
        await api.post('/reports', report.data);
      } catch (error) {
        console.error('Failed to sync report, keeping it offline:', error);
        remaining.push(report);
      }
    }

    await AsyncStorage.setItem(PENDING_REPORTS_KEY, JSON.stringify(remaining));
  }
}
