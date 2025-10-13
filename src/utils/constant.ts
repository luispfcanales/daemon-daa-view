export const API_CONFIG = {
  //BASE_URL: 'http://192.168.254.38:3001',
  BASE_URL: 'http://localhost:3001',
  POLLING_INTERVAL: 10000, // 10 segundos
};

export const SITE_STATES = {
  STOPPED: 3,
  STOPPING: 2,
  STARTING: 0,
  STARTED: 1,
} as const;
