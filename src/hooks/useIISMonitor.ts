import { useState, useEffect, useCallback } from 'react';
// import type { IISSite } from '@/types';
import { iisService } from '@/services';
import { useMonitoringEvents } from './useMonitoringEvents';

export const useIISMonitor = () => {
  // const [sites, setSites] = useState<IISSite[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  
  // Usar el hook de eventos para todo
  const { monitoringStatus, isConnected, error: eventsError, sites, loading, reconnect } = useMonitoringEvents();


  // const fetchSites = useCallback(async () => {
  //   try {
  //     setLoading(true);
  //     const response = await iisService.getSites();
  //     if (response.success) {
  //       setSites(response.sites);
  //       setError(null);
  //     } else {
  //       setError('Error al cargar sitios IIS');
  //     }
  //   } catch (error) {
  //     setError('Error al cargar sitios IIS');
  //     console.error('Error fetching sites:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  const controlIISSite = async (siteName: string, action: 'start' | 'stop' | 'restart') => {
    try {
      const result = await iisService.controlSite(siteName, action);
      if (result.success) {
        // Refrescar la lista de sitios después de una acción exitosa
        // await fetchSites();
      }
      return result;
    } catch (error) {
      console.error(`Error ${action} site ${siteName}:`, error);
      return null;
    }
  };

  // useEffect(() => {
  //   // Cargar sitios inicialmente
  //   fetchSites();
  // }, [fetchSites]);

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
    monitoringStatus,
    loading,
    // error: error || eventsError,
    error: eventsError,
    isConnected,
    controlIISSite,
    reconnect,
    // refresh: fetchSites
  };
};