import { apiClient } from './apiClient';
import type {
  EmailConfig,
  NotificationEmail,
  EmailConfigResponse,
  NotificationEmailsResponse
} from '@/types';

export const emailConfigService = {
  // Configuración del correo remitente
  async getSenderConfig(): Promise<EmailConfig | null> {
    try {
      const response = await apiClient.get<EmailConfigResponse>('/email/sender-config');
      return response.config || null;
    } catch (error) {
      console.error('Error fetching sender config:', error);
      return null;
    }
  },

  async updateSenderConfig(config: Partial<EmailConfig>): Promise<EmailConfigResponse> {
    return apiClient.post<EmailConfigResponse>('/email/sender-config', config);
  },

  // Correos para notificaciones
  async getNotificationEmails(): Promise<NotificationEmail[]> {
    try {
      const response = await apiClient.get<NotificationEmailsResponse>('/email/notification-emails');
      return response.emails || [];
    } catch (error) {
      console.error('Error fetching notification emails:', error);
      return [];
    }
  },

  async addNotificationEmail(email: string): Promise<EmailConfigResponse> {
    return apiClient.post<EmailConfigResponse>('/email/notification-emails', { email });
  },

  async removeNotificationEmail(email: string): Promise<EmailConfigResponse> {
    return apiClient.delete<EmailConfigResponse>(`/email/notification-emails?email=${encodeURIComponent(email)}`);
  },

};
