import { apiClient } from './apiClient';
import type {
  DNSConfigResponse,
} from '@/types';

export const dnsConfigService = {
  async getDNSConfigStatus(): Promise<Array<DNSConfigResponse>> {
    return apiClient.get<Array<DNSConfigResponse>>('/domain/list');
  },
};

