export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  POLLING_INTERVAL: 10000, // 10 segundos
};

export const SITE_STATES = {
  STOPPED: 3,
  STARTING: 2,
  STARTED: 1,
} as const;