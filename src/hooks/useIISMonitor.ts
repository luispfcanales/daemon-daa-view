import { useEffect } from 'react';
import { iisService } from '@/services';
import { useMonitoringEvents } from './useMonitoringEvents';

export const useIISMonitor = () => {

  // Usar el hook de eventos para todo
  const {
    monitoringStatus,
    isConnected,
    error: eventsError,
    sites,
    ipChecks,
    loading,
    reconnect,
  } = useMonitoringEvents();

  const controlIISSite = async (siteName: string, action: 'start' | 'stop' | 'restart') => {
    try {
      const result = await iisService.controlSite(siteName, action);
      if (result.iss_success) {
        // Refrescar la lista de sitios después de una acción exitosa
        // await fetchSites();
      }
      return result;
    } catch (error) {
      console.error(`Error ${action} site ${siteName}:`, error);
      return null;
    }
  };

  // Opcional: Si quieres actualizar automáticamente cuando cambia el estado de monitoreo
  useEffect(() => {
    if (monitoringStatus?.is_running) {
      // Cuando el monitoreo está activo, podrías refrescar los sitios periódicamente
      // o confiar en los eventos SSE para actualizaciones
      console.log('Monitoreo activo - los sitios se actualizarán via eventos');
    }
  }, [monitoringStatus?.is_running]);

  return {
    sites,
    ipChecks,
    monitoringStatus,
    loading,
    error: eventsError,
    isConnected,
    controlIISSite,
    reconnect,
  };
};
