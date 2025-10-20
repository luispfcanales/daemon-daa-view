import { apiClient } from './apiClient';
import type {
  DNSConfigResponse,
} from '@/types';

export const dnsConfigService = {
  async getDNSConfigStatus(): Promise<Array<DNSConfigResponse>> {
    return apiClient.get<Array<DNSConfigResponse>>('/domain/list');
  },
  async createDNSConfig(data: DNSConfigResponse): Promise<DNSConfigResponse> {
    return apiClient.post<DNSConfigResponse>('/domain/add', data);
  },
  async deleteDNSConfig(domain: string): Promise<void> {
    return apiClient.delete<any>(`/domain/delete/${domain}`);
  },
};

