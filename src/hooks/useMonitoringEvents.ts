import { useState, useEffect, useCallback, useRef } from 'react';
import type { MonitoringControlResponse,IISSite } from '@/types';

interface MonitoringEvent {
  type: 'initial_status' | 'monitoring_started' | 'monitoring_stopped' | 'websites_list' | 'connected';

  data: {
    //para eventos de monitoring
    is_running?: boolean;
    interval?: number;
    started_at?: string;
    message?: string;
    //para eventos de websites
    sites?: IISSite[];

  };
  timestamp: string;
}

interface UseMonitoringEventsReturn {
  monitoringStatus: MonitoringControlResponse | null;
  isConnected: boolean;
  error: string | null;
  sites: IISSite[];
  loading: boolean;
  reconnect: () => void;
}

export const useMonitoringEvents = (): UseMonitoringEventsReturn => {
  //para monitoreo de eventos de monitoring
  const [monitoringStatus, setMonitoringStatus] = useState<MonitoringControlResponse | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  //para monitoreo de eventos de websites
  const [sites, setSites] = useState<IISSite[]>([]);
  const [loading, setLoading] = useState(true);

  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

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
    // No crear nueva conexión si ya existe una activa
    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      console.log('⚠️ Ya existe una conexión activa');
      return;
    }

    // No crear nueva conexión si el componente está desmontado
    if (!isMountedRef.current) {
      return;
    }

    // Cerrar conexión existente
    closeConnection();

    // Verificar límite de reintentos
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error('❌ Máximo de reintentos alcanzado');
      setError('No se pudo establecer conexión después de varios intentos');
      return;
    }

    try {
      console.log(`🔄 Conectando... (intento ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
      const es = new EventSource('http://localhost:8080/monitoring/events');
      eventSourceRef.current = es;
      setError(null);

      es.onopen = () => {
        console.log('✅ Conectado al servidor de eventos');
        setIsConnected(true);
        setError(null);
        setSites([]);
        reconnectAttemptsRef.current = 0; // Reset contador en conexión exitosa
      };

      es.onmessage = (event) => {
        try {
          // Ignorar heartbeats
          if (event.data === ': heartbeat' || event.data.trim() === '') {
            return;
          }

          const eventData: MonitoringEvent = JSON.parse(event.data);
          console.log('📨 Evento recibido:', eventData);

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

            case 'websites_list':
              setSites(eventData.data.sites || []);
              setLoading(false);
              break;
            default:
              console.warn('Tipo de evento no manejado:', eventData.type);
          }
        } catch (parseError) {
          console.error('Error parsing event data:', parseError);
        }
      };

      es.onerror = (errorEvent) => {
        console.error('❌ Error en la conexión SSE:', errorEvent);
        
        const readyState = eventSourceRef.current?.readyState;
        console.log('ReadyState:', readyState);
        
        // Determinar tipo de error
        let errorMessage = 'Error de conexión con el servidor';
        if (readyState === EventSource.CLOSED) {
          errorMessage = 'Conexión cerrada por el servidor';
        } else if (readyState === EventSource.CONNECTING) {
          errorMessage = 'Reconectando al servidor...';
        }
        
        setIsConnected(false);
        setError(errorMessage);

        // IMPORTANTE: No cerrar explícitamente aquí, EventSource maneja su propio ciclo
        // Solo limpiar la referencia si está definitivamente cerrado
        if (readyState === EventSource.CLOSED) {
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }
          
          // Solo reintentar si el componente está montado y no alcanzamos el límite
          if (isMountedRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current += 1;
            const delay = Math.min(3000 * reconnectAttemptsRef.current, 15000);
            
            console.log(`🔄 Reconectando en ${delay / 1000}s...`);
            
            reconnectTimeoutRef.current = window.setTimeout(() => {
              if (isMountedRef.current) {
                createEventSource();
              }
            }, delay);
          }
        }
      };

    } catch (err) {
      console.error('Error al crear EventSource:', err);
      setError('No se pudo conectar al servidor de eventos');
      reconnectAttemptsRef.current += 1;
      
      // Intentar reconectar después de 5 segundos en caso de error inicial
      if (isMountedRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectTimeoutRef.current = window.setTimeout(() => {
          if (isMountedRef.current) {
            createEventSource();
          }
        }, 5000);
      }
    }
  }, []); // Sin dependencias para evitar recreaciones

  const reconnect = useCallback(() => {
    console.log('🔄 Reconexión manual solicitada');
    reconnectAttemptsRef.current = 0; // Reset contador en reconexión manual
    setError(null);
    createEventSource();
  }, [createEventSource]);

  useEffect(() => {
    isMountedRef.current = true;
    
    // Crear conexión inicial
    createEventSource();

    // Cleanup al desmontar el componente
    return () => {
      console.log('🔌 Cerrando conexión SSE (unmount)');
      isMountedRef.current = false;
      closeConnection();
    };
  }, []); // Array vacío para ejecutar solo una vez

  return {
    monitoringStatus,
    isConnected,
    error,
    sites,
    loading,
    reconnect
  };
};