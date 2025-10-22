import React from 'react';
import type { MonitoringControlResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Power } from 'lucide-react';
import DNSMonitorManager from './DNSMonitorManager'
import { monitoringService } from '@/services';

interface MonitoringControlProps {
  monitoringStatus: MonitoringControlResponse | null;
  isConnected: boolean;
  onControlMonitoring: (action: 'start' | 'stop') => void;
  onReconnect: () => void;
}

const MonitoringControl: React.FC<MonitoringControlProps> = ({
  monitoringStatus,
  isConnected,
  onControlMonitoring,
  // onReconnect,
}) => {
  const handleControlMonitoring = async (action: 'start' | 'stop') => {
    const result = await monitoringService.controlMonitoring(action);

    if (result.success) {
      // Luego notificamos al componente padre
      onControlMonitoring(action);
    }
  };

  return (
    <div className="space-y-6">
      <DNSMonitorManager
        controlDNS={monitoringStatus}
      />

      {/* Control del monitoreo */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full ${monitoringStatus?.is_running ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
            <Power className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold">Sistema de Monitoreo</h3>
            <p className="text-sm text-gray-500">
              {monitoringStatus?.message || 'Estado del monitoreo de ping'}
            </p>
            {monitoringStatus && monitoringStatus.interval > 0 && (
              <p className="text-sm text-gray-600">
                Intervalo: {monitoringStatus.interval} segundos
              </p>
            )}
          </div>
        </div>
        <Button
          onClick={() => handleControlMonitoring(monitoringStatus?.is_running ? 'stop' : 'start')}
          variant={monitoringStatus?.is_running ? "destructive" : "default"}
          size="lg"
          className="flex items-center space-x-2"
          disabled={!isConnected}
        >
          <Power className="w-4 h-4" />
          <span>{monitoringStatus?.is_running ? 'Detener' : 'Iniciar'} Monitoreo</span>
        </Button>
      </div>
    </div>
  );
};

export default MonitoringControl;
