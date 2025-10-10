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

export interface MonitoringControlRequest {
  action: 'start' | 'stop' | 'status';
}

export interface MonitoringControlResponse {
  interval: number;
  is_running: boolean;
  message: string;
  success: boolean;
}

export interface PingLog {
  id: string;
  siteName: string;
  timestamp: Date;
  responseTime: number;
  status: 'success' | 'error';
  errorMessage?: string;
}