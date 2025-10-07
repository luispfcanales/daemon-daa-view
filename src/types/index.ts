export interface IISSite {
  Id: number;
  Name: string;
  State: number;
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
  action: string;
  duration: string;
  output: string;
  site: string;
  success: boolean;
  timestamp: string;
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