import React from 'react';
import type { MonitoringControlResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Power, CheckCircle2, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { monitoringService } from '@/services';

interface MonitoringControlProps {
  monitoringStatus: MonitoringControlResponse | null;
  isConnected: boolean;
  onControlMonitoring: (action: 'start' | 'stop') => void;
  onReconnect: () => void;
  activeSitesCount: number;
}

const MonitoringControl: React.FC<MonitoringControlProps> = ({
  monitoringStatus,
  isConnected,
  onControlMonitoring,
  onReconnect,
  activeSitesCount
}) => {
  const handleControlMonitoring = async (action: 'start' | 'stop') => {
    // Primero llamamos a la API para cambiar el estado
    const result = await monitoringService.controlMonitoring(action);
    
    if (result.success) {
      // Luego notificamos al componente padre
      onControlMonitoring(action);
    }
  };

  return (
    <div className="space-y-6">
      {/* Estado de conexión */}
      <Card className={isConnected ? 'border-green-200' : 'border-red-200'}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isConnected ? (
                <Wifi className="w-5 h-5 text-green-600" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-600" />
              )}
              <div>
                <span className="font-medium">
                  Conexión en tiempo real: {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
                {!isConnected && (
                  <p className="text-sm text-gray-500">
                    No se pueden recibir actualizaciones automáticas
                  </p>
                )}
              </div>
            </div>
            {!isConnected && (
              <Button
                onClick={onReconnect}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reconectar</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Control del monitoreo */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full ${
            monitoringStatus?.is_running ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sitios Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total activos:</span>
                <span className="font-semibold">{activeSitesCount}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Listos para monitoreo</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Configuración</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Estado:</span>
                <span className={`font-semibold ${
                  monitoringStatus?.is_running ? 'text-green-600' : 'text-red-600'
                }`}>
                  {monitoringStatus?.is_running ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Conexión:</span>
                <span className={`font-semibold ${
                  isConnected ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isConnected ? 'LIVE' : 'OFFLINE'}
                </span>
              </div>
              {monitoringStatus?.interval && (
                <div className="flex justify-between">
                  <span>Intervalo:</span>
                  <span className="font-semibold">{monitoringStatus.interval}s</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonitoringControl;