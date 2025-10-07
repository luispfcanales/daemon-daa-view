import { apiClient } from './apiClient';
import type { IISResponse, IISControlResponse, IISControlRequest } from '@/types';

export const iisService = {
  async getSites(): Promise<IISResponse> {
    return apiClient.get<IISResponse>('/iis/sites');
  },

  async controlSite(siteName: string, action: 'start' | 'stop' | 'restart'): Promise<IISControlResponse> {
    const request: IISControlRequest = { site_name: siteName, action };
    return apiClient.post<IISControlResponse>('/iis/control', request);
  },
};