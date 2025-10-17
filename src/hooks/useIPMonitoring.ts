import { useState, useCallback } from 'react';
import type { IPMonitoringCheck } from '@/types';

interface UseIPMonitoringReturn {
  ipChecks: IPMonitoringCheck[];
  addIPCheck: (check: IPMonitoringCheck) => void;
  clearIPChecks: () => void;
  getChecksByDomain: (domain: string) => IPMonitoringCheck[];
}

export const useIPMonitoring = (): UseIPMonitoringReturn => {
  const [ipChecks, setIpChecks] = useState<IPMonitoringCheck[]>([]);

  const addIPCheck = useCallback((check: IPMonitoringCheck) => {
    setIpChecks(prev => {
      const newChecks = [...prev, check];
      return newChecks.slice(-100);
    });
  }, []);

  const clearIPChecks = useCallback(() => {
    setIpChecks([]);
  }, []);

  const getChecksByDomain = useCallback((domain: string) => {
    return ipChecks.filter(check => check.domain === domain);
  }, [ipChecks]);

  return {
    ipChecks,
    addIPCheck,
    clearIPChecks,
    getChecksByDomain
  };
};
