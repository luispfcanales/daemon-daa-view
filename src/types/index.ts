export interface IISSite {
  Id: number;
  Name: string;
  State: number;
  URL: string;
}

export interface IISResponse {
  count: number;
  sites: IISSite[];
  success: boolean;
}

export interface IISControlRequest {
  site_name: string;
  action: 'start' | 'stop' | 'restart';
}

export interface IISControlResponse {
  iis_action: string;
  iis_duration: string;
  iis_output: string;
  iis_site: string;
  iss_success: boolean;
  iis_timestamp: string;
}

export interface IPMonitoringCheck {
  domain: string;
  expected_ip: string;
  actual_ips: string[];
  is_valid: boolean;
  error: string;
  timestamp: string;
  duration_ms: number;
  request_time: number;
}

export interface DNSStats {
  dns: string;
  average_uptime: number;
  avg_response_time: number;
  checks_with_timing: number;
  last_check: string;
  max_response_time: number;
  min_response_time: number;
  p95_response_time: number;
  success_count: number;
  success_rate: number;
  total_checks: number;
}


export interface MonitoringControlRequest {
  action: 'start' | 'stop' | 'status';
}

export interface MonitoringControlResponse {
  interval: number;
  is_running: boolean;
  message: string;
  success: boolean;
}

//dns types service
export interface DNSConfigResponse {
  id: string;
  dns: string;
  expected_ip: string;
  status: boolean;
}

export interface PingLog {
  id: string;
  siteName: string;
  timestamp: Date;
  responseTime: number;
  status: 'success' | 'error';
  errorMessage?: string;
}

// Eventos específicos
export interface IPMonitoringEvent {
  type: 'monitoring_ip';
  data: {
    check: IPMonitoringCheck;
  };
  timestamp: string;
}

export interface DNSStatsCachedEvent {
  type: 'monitoring_domain_stats_cached';
  data: {
    stats: Array<DNSStats>;
  };
  timestamp: string;
}

//manager email
// Email Configuration Types
export interface EmailConfig {
  email: string;
  gmail_app_password: string;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationEmail {
  email: string;
  created_at?: string;
}
// Respuestas para el servicio de email
export interface EmailConfigResponse {
  success: boolean;
  message?: string;
}

export interface NotificationEmailsResponse {
  success: boolean;
  emails: NotificationEmail[];
}
