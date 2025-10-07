import { apiClient } from './apiClient';
import type { MonitoringControlResponse, MonitoringControlRequest } from '@/types';

export const monitoringService = {
  async controlMonitoring(action: 'start' | 'stop' | 'status'): Promise<MonitoringControlResponse> {
    const request: MonitoringControlRequest = { action };
    return apiClient.post<MonitoringControlResponse>('/monitoring/control', request);
  },

  async getMonitoringStatus(): Promise<MonitoringControlResponse> {
    return this.controlMonitoring('status');
  },
};