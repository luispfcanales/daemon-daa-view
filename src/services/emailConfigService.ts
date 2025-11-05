import { apiClient } from './apiClient';
import type {
  EmailConfig,
  NotificationEmail,
  EmailConfigResponse,
  NotificationEmailsResponse
} from '@/types';

const API_EMAIL: string = "/api/email";
export const emailConfigService = {
  // Configuración del correo remitente
  async getSenderConfig(): Promise<EmailConfig | null> {
    try {
      const response = await apiClient.get<EmailConfig>(`${API_EMAIL}/sender-config`);
      return response || null;
    } catch (error) {
      console.error('Error fetching sender config:', error);
      return null;
    }
  },

  async updateSenderConfig(config: Partial<EmailConfig>): Promise<EmailConfigResponse> {
    return apiClient.post<EmailConfigResponse>(`${API_EMAIL}/sender-config`, config);
  },

  // Correos para notificaciones
  async getNotificationEmails(): Promise<NotificationEmail[]> {
    try {
      const response = await apiClient.get<NotificationEmailsResponse>(`${API_EMAIL}/notification-emails`);
      return response.emails || [];
    } catch (error) {
      console.error('Error fetching notification emails:', error);
      return [];
    }
  },

  async addNotificationEmail(email: string): Promise<EmailConfigResponse> {
    return apiClient.post<EmailConfigResponse>(`${API_EMAIL}/notification-emails`, { email });
  },

  async removeNotificationEmail(email: string): Promise<EmailConfigResponse> {
    return apiClient.delete<EmailConfigResponse>(`${API_EMAIL}/notification-emails?email=${encodeURIComponent(email)}`);
  },

};
