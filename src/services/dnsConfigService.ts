import { apiClient } from './apiClient';
import type {
  DNSConfigResponse,
} from '@/types';

export const dnsConfigService = {
  async updateDomain(domainId: string, domainData: any): Promise<DNSConfigResponse> {
    return apiClient.put<DNSConfigResponse>(`/domain/update/${domainId}`, domainData);
  },
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

