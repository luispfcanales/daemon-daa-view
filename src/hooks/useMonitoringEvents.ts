import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  MonitoringControlResponse,
  IISSite,
  IPMonitoringCheck,
  DNSStats,
  IPMonitoringEvent,
  DNSStatsCachedEvent
} from '@/types';
import { useIPMonitoring } from './useIPMonitoring';
import { useDNSStats } from './useDNSStats';
import { API_CONFIG } from '@/utils/constant';

interface UseMonitoringEventsReturn {
  monitoringStatus: MonitoringControlResponse | null;
  isConnected: boolean;
  error: string | null;
  sites: IISSite[];
  loading: boolean;
  reconnect: () => void;
  ipChecks: IPMonitoringCheck[];
  addIPCheck: (check: IPMonitoringCheck) => void;
  clearIPChecks: () => void;
  getChecksByDomain: (domain: string) => IPMonitoringCheck[];
  dnsStats: Record<string, DNSStats>;
  updateDNSStats: (stats: Record<string, DNSStats>) => void;
  getDNSStat: (domain: string) => DNSStats | null;
  clearDNSStats: () => void;
}

export const useMonitoringEvents = (): UseMonitoringEventsReturn => {
  // Estados principales
  const [monitoringStatus, setMonitoringStatus] = useState<MonitoringControlResponse | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sites, setSites] = useState<IISSite[]>([]);
  const [loading, setLoading] = useState(true);

  // Hooks especializados - SIEMPRE en el mismo orden
  const { ipChecks, addIPCheck, clearIPChecks, getChecksByDomain } = useIPMonitoring();
  const { dnsStats, updateDNSStats, getDNSStat, clearDNSStats } = useDNSStats();

  // Referencias
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Usar refs para evitar dependencias circulares
  const addIPCheckRef = useRef(addIPCheck);
  const updateDNSStatsRef = useRef(updateDNSStats);

  // Actualizar las refs cuando cambien las funciones
  useEffect(() => {
    addIPCheckRef.current = addIPCheck;
  }, [addIPCheck]);

  useEffect(() => {
    updateDNSStatsRef.current = updateDNSStats;
  }, [updateDNSStats]);

  const updateSiteState = useCallback((sites: IISSite[], siteName: string, newState: number): IISSite[] => {
    return sites.map(site =>
      site.Name === siteName ? { ...site, State: newState } : site
    );
  }, []);

  const closeConnection = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const createEventSource = useCallback(() => {
    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      console.log('⚠️ Ya existe una conexión activa');
      return;
    }

    if (!isMountedRef.current) return;

    closeConnection();

    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error('❌ Máximo de reintentos alcanzado');
      setError('No se pudo establecer conexión después de varios intentos');
      return;
    }

    try {
      console.log(`🔄 Conectando... (intento ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
      const es = new EventSource(`${API_CONFIG.BASE_URL}/monitoring/events`);
      eventSourceRef.current = es;
      setError(null);

      es.onopen = () => {
        console.log('✅ Conectado al servidor de eventos');
        setIsConnected(true);
        setError(null);
        setSites([]);
        reconnectAttemptsRef.current = 0;
      };

      es.onmessage = (event) => {
        try {
          if (event.data === ': heartbeat' || event.data.trim() === '') return;

          const eventData = JSON.parse(event.data);
          //console.log('📨 Evento recibido:', eventData.type);

          switch (eventData.type) {
            case 'connected':
              console.log('🔄 Conexión SSE establecida');
              break;

            case 'initial_status':
              setMonitoringStatus({
                interval: eventData.data.interval || 0,
                is_running: eventData.data.is_running || false,
                message: `Monitoreo ${eventData.data.is_running ? 'ACTIVO' : 'INACTIVO'}`,
                success: true
              });
              break;

            case 'monitoring_started':
              setMonitoringStatus({
                interval: eventData.data.interval || 0,
                is_running: true,
                message: eventData.data.message || 'Monitoreo iniciado',
                success: true
              });
              break;

            case 'monitoring_stopped':
              setMonitoringStatus({
                interval: 0,
                is_running: false,
                message: eventData.data.message || 'Monitoreo detenido',
                success: true
              });
              break;

            case 'monitoring_ip': {
              const checkData = (eventData as IPMonitoringEvent).data.check;
              console.log(eventData)
              if (checkData) {
                addIPCheckRef.current(checkData);
                //console.log('✅ IP Check agregado');
              }
              break;
            }

            case 'monitoring_domain_stats_cached': {
              const statsArray = (eventData as DNSStatsCachedEvent).data.stats;

              console.log(eventData)

              if (statsArray && Array.isArray(statsArray)) {
                //console.log('💾 DNS Stats Cached:', statsArray.length, 'dominios');
                const statsRecord: Record<string, DNSStats> = {};
                statsArray.forEach(stat => {
                  statsRecord[stat.dns] = stat;
                  //console.log(`   💾 ${stat.dns}: ${stat.success_rate}% - ${stat.total_checks} checks`);
                });
                updateDNSStatsRef.current(statsRecord);
                //console.log('✅ DNS Stats Cached procesados');
              }
              break;
            }

            case 'monitoring_domain_stats': {
              const singleStat = (eventData as any).data.stats;
              if (singleStat && singleStat.dns) {

                const statsRecord: Record<string, DNSStats> = {
                  [singleStat.dns]: singleStat
                };

                updateDNSStatsRef.current(statsRecord);
              }
              break;
            }

            case 'websites_list':
              setSites(eventData.data.sites || []);
              setLoading(false);
              break;

            case 'control_iis_site': {
              const iisData = eventData.data.iis_control;
              if (!iisData?.iis_site) {
                console.warn('❌ Evento control_iis_site sin datos válidos');
                break;
              }

              const action = (iisData.iis_action || '').toLowerCase();
              let newState = -1;
              if (action.includes('starting') || action === 'start') newState = 0;
              else if (action.includes('stopping') || action === 'stop') newState = 2;
              else if (action.includes('started') || action === 'running') newState = 1;
              else if (action.includes('stopped')) newState = 3;

              if (newState !== -1) {
                setSites(prevSites => updateSiteState(prevSites, iisData.iis_site, newState));
              }
              break;
            }

            default:
              console.log('⚠️ Tipo de evento no manejado:', eventData.type);
          }
        } catch (parseError) {
          console.error('❌ Error parsing event:', parseError);
        }
      };

      es.onerror = (errorEvent) => {
        console.error('❌ Error SSE:', errorEvent);
        const readyState = eventSourceRef.current?.readyState;

        let errorMessage = 'Error de conexión';
        if (readyState === EventSource.CLOSED) errorMessage = 'Conexión cerrada';
        else if (readyState === EventSource.CONNECTING) errorMessage = 'Reconectando...';

        setIsConnected(false);
        setError(errorMessage);

        if (readyState === EventSource.CLOSED) {
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }

          if (isMountedRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current += 1;
            const delay = Math.min(3000 * reconnectAttemptsRef.current, 15000);
            reconnectTimeoutRef.current = window.setTimeout(() => {
              if (isMountedRef.current) createEventSource();
            }, delay);
          }
        }
      };
    } catch (err) {
      console.error('❌ Error al crear EventSource:', err);
      setError('No se pudo conectar');
      reconnectAttemptsRef.current += 1;

      if (isMountedRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectTimeoutRef.current = window.setTimeout(() => {
          if (isMountedRef.current) createEventSource();
        }, 5000);
      }
    }
  }, [closeConnection, updateSiteState]);

  const reconnect = useCallback(() => {
    console.log('🔄 Reconexión manual');
    reconnectAttemptsRef.current = 0;
    setError(null);
    createEventSource();
  }, [createEventSource]);

  useEffect(() => {
    isMountedRef.current = true;
    console.log('🚀 Iniciando conexión SSE');
    createEventSource();

    return () => {
      console.log('🔌 Cerrando SSE');
      isMountedRef.current = false;
      closeConnection();
    };
  }, [createEventSource, closeConnection]);

  return {
    monitoringStatus,
    isConnected,
    error,
    sites,
    loading,
    reconnect,
    ipChecks,
    addIPCheck,
    clearIPChecks,
    getChecksByDomain,
    dnsStats,
    updateDNSStats,
    getDNSStat,
    clearDNSStats
  };
};
