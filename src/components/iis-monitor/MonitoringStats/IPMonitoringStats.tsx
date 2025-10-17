import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { IPMonitoringCheck } from '@/types';

interface IPMonitoringStatsProps {
  ipChecks: IPMonitoringCheck[];
}

// Colores para cada dominio
const DOMAIN_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
];

const IPMonitoringStats: React.FC<IPMonitoringStatsProps> = ({ ipChecks }) => {
  const chartData = useMemo(() => {
    const byDomain = ipChecks.reduce((acc, check) => {
      if (!acc[check.domain]) {
        acc[check.domain] = [];
      }
      acc[check.domain].push(check);
      return acc;
    }, {} as Record<string, IPMonitoringCheck[]>);

    // Usar todos los datos disponibles (máximo 100 por el hook)
    const recentChecks = [...ipChecks];

    // Crear estructura optimizada para gráfico de líneas múltiples
    // Agrupar por intervalos de tiempo inteligentes basados en la densidad de datos
    const timeSlots: any[] = [];
    const domains = Array.from(new Set(recentChecks.map(c => c.domain.replace('.unamad.edu.pe', ''))));

    // Determinar intervalo óptimo basado en la cantidad de datos
    const totalChecks = recentChecks.length;
    const optimalInterval = totalChecks > 50 ? 5000 : 5000; // 10s si hay muchos datos, 5s si hay pocos

    recentChecks.forEach(check => {
      const timestamp = new Date(check.timestamp).getTime();
      const intervalKey = Math.floor(timestamp / optimalInterval) * optimalInterval;
      const shortDomain = check.domain.replace('.unamad.edu.pe', '');

      let slot = timeSlots.find(s => s.rawTimestamp === intervalKey);
      if (!slot) {
        slot = {
          rawTimestamp: intervalKey,
          timestamp: new Date(intervalKey).toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          domainCount: 0
        };
        // Inicializar todos los dominios como null
        domains.forEach(domain => {
          slot[domain] = null;
        });
        timeSlots.push(slot);
      }

      // Usar el último valor para este dominio en el intervalo
      slot[shortDomain] = check.request_time;
      slot.domainCount++;
    });

    // Ordenar por tiempo y limitar a 25 puntos para mejor legibilidad
    const responseTimeData = timeSlots
      .sort((a, b) => a.rawTimestamp - b.rawTimestamp)
      .slice(-25);

    // Estadísticas por dominio
    const domainStats = Object.entries(byDomain).map(([domain, domainChecks]) => {
      const validChecks = domainChecks.filter(c => c.is_valid).length;
      const avgDuration = domainChecks.length > 0
        ? domainChecks.reduce((sum, c) => sum + c.request_time, 0) / domainChecks.length
        : 0;
      const lastCheck = domainChecks[domainChecks.length - 1];

      return {
        domain: domain.replace('.unamad.edu.pe', ''),
        fullDomain: domain,
        avgDuration: Math.round(avgDuration * 100) / 100,
        successRate: domainChecks.length > 0 ? Math.round((validChecks / domainChecks.length) * 100) : 0,
        totalChecks: domainChecks.length,
        isValid: lastCheck?.is_valid || false,
        lastDuration: lastCheck?.request_time || 0,
        expectedIP: lastCheck?.expected_ip || '',
        actualIPs: lastCheck?.actual_ips || []
      };
    });

    const statusData = [
      {
        name: 'Activos',
        value: domainStats.filter(d => d.isValid).length,
        color: '#10b981'
      },
      {
        name: 'Inactivos',
        value: domainStats.filter(d => !d.isValid).length,
        color: '#ef4444'
      }
    ];

    return {
      responseTimeData,
      domains,
      domainStats,
      statusData,
      totalDomains: Object.keys(byDomain).length,
      totalChecks: recentChecks.length
    };
  }, [ipChecks]);

  const latestCheck = useMemo(() => {
    return ipChecks.length > 0 ? ipChecks[ipChecks.length - 1] : null;
  }, [ipChecks]);

  const hasIPChecks = ipChecks.length > 0;

  if (!hasIPChecks) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay checks de IP en tiempo real</p>
            <p className="text-sm mt-2">Los datos aparecerán cuando el monitoreo esté activo</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Dominios</p>
                <p className="text-2xl font-bold">{chartData.totalDomains}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-green-600">
                  {chartData.statusData[0].value}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactivos</p>
                <p className="text-2xl font-bold text-red-600">
                  {chartData.statusData[1].value}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Última Verificación</p>
                <p className="text-sm font-bold">
                  {latestCheck ? new Date(latestCheck.timestamp).toLocaleTimeString('es-PE') : 'N/A'}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principales - SOLO GRÁFICO DE LÍNEAS OPTIMIZADO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tiempos de Respuesta en Tiempo Real</CardTitle>
            <CardDescription>
              Evolución temporal por dominio ({chartData.totalChecks} verificaciones)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData.responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  label={{ value: 'ms', angle: -90, position: 'insideLeft' }}
                  domain={[0, 'dataMax + 5']}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 border rounded shadow-lg">
                          <p className="font-semibold mb-2">Hora: {label}</p>
                          {payload
                            .filter((entry: any) => entry.value != null)
                            .map((entry: any, index: number) => (
                              <p key={index} className="text-sm" style={{ color: entry.color }}>
                                {entry.name}: {entry.value?.toFixed(2)}ms
                              </p>
                            ))}
                          {payload.filter((entry: any) => entry.value != null).length === 0 && (
                            <p className="text-sm text-gray-500">Sin datos en este intervalo</p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                {chartData.domains.map((domain, index) => (
                  <Line
                    key={domain}
                    type="monotone"
                    dataKey={domain}
                    stroke={DOMAIN_COLORS[index % DOMAIN_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name={domain}
                    connectNulls={true}
                    isAnimationActive={false} // Mejor rendimiento con datos en tiempo real
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de los Dominios</CardTitle>
            <CardDescription>Distribución actual</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={chartData.statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, }: any) =>
                    `${name}: ${value}`
                  }
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} dominios`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {chartData.statusData.map((status,) => (
                <div key={status.name} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="text-sm">
                    {status.name}: {status.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de detalles optimizada */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle por Dominio</CardTitle>
          <CardDescription>
            Resumen de métricas para cada dominio monitoreado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3">Dominio</th>
                  <th className="text-left p-3">Estado</th>
                  <th className="text-right p-3">IP</th>
                  <th className="text-right p-3">Último (ms)</th>
                  <th className="text-right p-3">Promedio (ms)</th>
                  <th className="text-right p-3">Éxito</th>
                  <th className="text-left p-3">IP Esperada</th>
                </tr>
              </thead>
              <tbody>
                {chartData.domainStats.map((stat, index) => (
                  <tr key={stat.domain} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">
                      <span className="inline-flex items-center">
                        <span
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: DOMAIN_COLORS[index % DOMAIN_COLORS.length] }}
                        />
                        {stat.fullDomain}
                      </span>
                    </td>
                    <td className="p-3">
                      {stat.isValid ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          <XCircle className="w-3 h-3 mr-1" />
                          Caído
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right font-mono">{stat.actualIPs}</td>
                    <td className="p-3 text-right font-mono">{stat.lastDuration.toFixed(1)}</td>
                    <td className="p-3 text-right font-mono">{stat.avgDuration.toFixed(1)}</td>
                    <td className="p-3 text-right">
                      <span className={`font-semibold ${stat.successRate >= 95 ? 'text-green-600' :
                        stat.successRate >= 80 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                        {stat.successRate}%
                      </span>
                    </td>
                    <td className="p-3 text-xs text-gray-600 font-mono">{stat.expectedIP}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IPMonitoringStats;
