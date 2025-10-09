import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, RefreshCw } from 'lucide-react';

import { useIISMonitor } from '@/hooks/useIISMonitor';
import DashboardStats from './DashboardStats';
import SiteList from './SiteList';
import MonitoringControl from './MonitoringControl';
import { SITE_STATES } from '@/utils/constant';

const IISMonitor: React.FC = () => {
  const { 
    sites, 
    monitoringStatus, 
    loading, 
    error,
    isConnected,
    controlIISSite,
    reconnect,
    // refresh 
  } = useIISMonitor();

  const activeSitesCount = sites.filter(site => site.State === SITE_STATES.STARTED).length;

  const handleControlMonitoring = async (action: 'start' | 'stop') => {
    // Esta función se mantiene para compatibilidad, pero el estado real
    // ahora viene de los eventos del servidor
    console.log(`Solicitando ${action} del monitoreo...`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin mr-2" />
        <span>Cargando sitios IIS...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-600">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Monitor IIS</h1>
          <p className="text-gray-600">
            Gestión y monitoreo de sitios web IIS {isConnected && '• ✅ Conectado en tiempo real'}
          </p>
        </div>
        {/* <Button
          onClick={refresh}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Actualizar</span>
        </Button> */}
      </div>

      {/* Estadísticas */}
      <DashboardStats 
        sites={sites} 
        monitoringStatus={monitoringStatus} 
        isConnected={isConnected}
      />

      <Tabs defaultValue="sites" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sites">Sitios IIS</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoreo</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="sites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Sitios IIS</CardTitle>
              <CardDescription>
                Gestiona el estado de tus sitios web en IIS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SiteList 
                sites={sites} 
                onSiteControl={controlIISSite} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle>Control de Monitoreo</CardTitle>
              <CardDescription>
                Configuración y estado del sistema de monitoreo de ping
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MonitoringControl
                monitoringStatus={monitoringStatus}
                isConnected={isConnected}
                onControlMonitoring={handleControlMonitoring}
                onReconnect={reconnect}
                activeSitesCount={activeSitesCount}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs del Sistema</CardTitle>
              <CardDescription>
                Registro de actividades y eventos del sistema en tiempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Los logs se mostrarán aquí cuando el monitoreo esté activo</p>
                <p className="text-sm">
                  {isConnected 
                    ? '✅ Conectado al servidor de eventos' 
                    : '❌ No conectado - Los logs no se actualizarán'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IISMonitor;