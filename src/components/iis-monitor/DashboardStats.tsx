import React from 'react';
import type { IISSite, MonitoringControlResponse } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi, WifiOff } from 'lucide-react';
import { SITE_STATES } from '@/utils/constant';

interface DashboardStatsProps {
  sites: IISSite[];
  monitoringStatus: MonitoringControlResponse | null;
  isConnected: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ sites, monitoringStatus, isConnected }) => {
  const totalSites = sites.length;
  const runningSites = sites.filter(site => site.State === SITE_STATES.STARTED).length;
  const stoppedSites = sites.filter(site => site.State === SITE_STATES.STOPPED).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sitios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSites}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ejecutándose</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{runningSites}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Detenidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stoppedSites}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monitoreo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${
            monitoringStatus?.is_running ? 'text-green-600' : 'text-red-600'
          }`}>
            {monitoringStatus?.is_running ? 'ACTIVO' : 'INACTIVO'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conexión</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="w-5 h-5 text-green-600" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-600" />
            )}
            <span className={`text-2xl font-bold ${
              isConnected ? 'text-green-600' : 'text-red-600'
            }`}>
              {isConnected ? 'LIVE' : 'OFF'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;