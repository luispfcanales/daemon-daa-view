import { useState, useCallback, useMemo } from 'react';
import type { DNSStats } from '@/types';

interface UseDNSStatsReturn {
  dnsStats: Record<string, DNSStats>;
  dnsStatsArray: DNSStats[];
  updateDNSStats: (stats: Record<string, DNSStats>) => void;
  updateSingleDNSStat: (domain: string, stats: DNSStats) => void;
  getDNSStat: (domain: string) => DNSStats | null;
  clearDNSStats: () => void;
  hasStats: boolean;
  domains: string[];
}

export const useDNSStats = (): UseDNSStatsReturn => {
  const [dnsStats, setDnsStats] = useState<Record<string, DNSStats>>({});

  const updateDNSStats = useCallback((stats: Record<string, DNSStats>) => {
    //console.log('🔄 updateDNSStats called with:', Object.keys(stats).length, 'domains');

    setDnsStats(prev => {
      // Crear un nuevo objeto completamente nuevo
      const newStats: Record<string, DNSStats> = {};

      // Copiar los stats anteriores
      Object.keys(prev).forEach(domain => {
        newStats[domain] = { ...prev[domain] };
      });

      // Agregar/actualizar con los nuevos stats
      Object.entries(stats).forEach(([domain, stat]) => {
        //console.log(`  📝 Actualizando ${domain}:`, {
        //  success_rate: stat.success_rate,
        //  total_checks: stat.total_checks,
        //  avg_response_time: stat.avg_response_time
        //});

        newStats[domain] = {
          dns: stat.dns,
          average_uptime: stat.average_uptime ?? 0,
          avg_response_time: stat.avg_response_time ?? 0,
          checks_with_timing: stat.checks_with_timing ?? 0,
          last_check: stat.last_check ?? '',
          max_response_time: stat.max_response_time ?? 0,
          min_response_time: stat.min_response_time ?? 0,
          p95_response_time: stat.p95_response_time ?? 0,
          success_count: stat.success_count ?? 0,
          success_rate: stat.success_rate ?? 0,
          total_checks: stat.total_checks ?? 0,
        };
      });

      //console.log('✅ New dnsStats object created:', Object.keys(newStats));
      return newStats;
    });
  }, []);

  const updateSingleDNSStat = useCallback((domain: string, stats: DNSStats) => {
    console.log('🔄 updateSingleDNSStat called for:', domain);

    setDnsStats(prev => ({
      ...prev,
      [domain]: {
        dns: stats.dns,
        average_uptime: stats.average_uptime ?? prev[domain]?.average_uptime ?? 0,
        avg_response_time: stats.avg_response_time ?? prev[domain]?.avg_response_time ?? 0,
        checks_with_timing: stats.checks_with_timing ?? prev[domain]?.checks_with_timing ?? 0,
        last_check: stats.last_check ?? prev[domain]?.last_check ?? '',
        max_response_time: stats.max_response_time ?? prev[domain]?.max_response_time ?? 0,
        min_response_time: stats.min_response_time ?? prev[domain]?.min_response_time ?? 0,
        p95_response_time: stats.p95_response_time ?? prev[domain]?.p95_response_time ?? 0,
        success_count: stats.success_count ?? prev[domain]?.success_count ?? 0,
        success_rate: stats.success_rate ?? prev[domain]?.success_rate ?? 0,
        total_checks: stats.total_checks ?? prev[domain]?.total_checks ?? 0,
      }
    }));
  }, []);

  const getDNSStat = useCallback((domain: string) => {
    return dnsStats[domain] || null;
  }, [dnsStats]);

  const clearDNSStats = useCallback(() => {
    console.log('🗑️ Clearing all DNS stats');
    setDnsStats({});
  }, []);

  // Valores computados con logging
  const dnsStatsArray = useMemo(() => {
    const array = Object.values(dnsStats);
    //console.log('📊 dnsStatsArray computed:', array.length, 'items');
    return array;
  }, [dnsStats]);

  const hasStats = useMemo(() => {
    const has = Object.keys(dnsStats).length > 0;
    //console.log('❓ hasStats computed:', has);
    return has;
  }, [dnsStats]);

  const domains = useMemo(() => {
    const domainList = Object.keys(dnsStats);
    //console.log('🌐 domains computed:', domainList);
    return domainList;
  }, [dnsStats]);

  return {
    dnsStats,
    dnsStatsArray,
    updateDNSStats,
    updateSingleDNSStat,
    getDNSStat,
    clearDNSStats,
    hasStats,
    domains
  };
};
