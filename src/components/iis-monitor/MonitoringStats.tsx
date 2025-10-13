import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { IPMonitoringCheck } from '@/types';

interface MonitoringStatsProps {
  checks: IPMonitoringCheck[];
}

const MonitoringStats: React.FC<MonitoringStatsProps> = ({ checks }) => {
  // Preparar datos para gráficos
  const chartData = useMemo(() => {
    // Últimos 20 checks por dominio
    const byDomain = checks.reduce((acc, check) => {
      if (!acc[check.domain]) {
        acc[check.domain] = [];
      }
      acc[check.domain].push(check);
      return acc;
    }, {} as Record<string, IPMonitoringCheck[]>);

    // Datos para el gráfico de tiempo de respuesta
    const responseTimeData = checks.slice(-20).map((check, index) => ({
      index: index + 1,
      time: new Date(check.timestamp).toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      [check.domain]: check.request_time,
      domain: check.domain,
      isValid: check.is_valid
    }));

    // Datos agregados por dominio (promedio y estado)
    const domainStats = Object.entries(byDomain).map(([domain, domainChecks]) => {
      const validChecks = domainChecks.filter(c => c.is_valid).length;
      const avgDuration = domainChecks.reduce((sum, c) => sum + c.request_time, 0) / domainChecks.length;
      const lastCheck = domainChecks[domainChecks.length - 1];

      return {
        domain: domain.replace('.unamad.edu.pe', ''),
        avgDuration: Math.round(avgDuration),
        successRate: Math.round((validChecks / domainChecks.length) * 100),
        totalChecks: domainChecks.length,
        isValid: lastCheck.is_valid,
        lastDuration: lastCheck.request_time,
        expectedIP: lastCheck.expected_ip,
        actualIPs: lastCheck.actual_ips
      };
    });

    // Datos para gráfico de torta (estado actual)
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
      domainStats,
      statusData,
      totalDomains: Object.keys(byDomain).length
    };
  }, [checks]);

  if (checks.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay datos de monitoreo disponibles</p>
            <p className="text-sm mt-2">Los datos aparecerán cuando el monitoreo esté activo</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const latestCheck = checks[checks.length - 1];

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
                  {new Date(latestCheck.timestamp).toLocaleTimeString('es-PE')}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de línea - Tiempo de respuesta */}
        <Card>
          <CardHeader>
            <CardTitle>Tiempo de Respuesta (ms)</CardTitle>
            <CardDescription>Últimos 20 checks por dominio</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded shadow-lg">
                          <p className="font-semibold">{data.domain}</p>
                          <p className="text-sm">Tiempo: {data[data.domain]}ms</p>
                          <p className="text-sm">Hora: {data.time}</p>
                          <p className={`text-sm font-semibold ${data.isValid ? 'text-green-600' : 'text-red-600'}`}>
                            {data.isValid ? '✓ Válido' : '✗ Error'}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                {chartData.domainStats.map((stat, index) => (
                  <Line
                    key={stat.domain}
                    type="monotone"
                    dataKey={`${stat.domain}.unamad.edu.pe`}
                    stroke={`hsl(${(index * 360) / chartData.domainStats.length}, 70%, 50%)`}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de torta - Estado actual */}
        <Card>
          <CardHeader>
            <CardTitle>Estado Actual de Dominios</CardTitle>
            <CardDescription>Distribución de dominios activos e inactivos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }: any) =>
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de barras - Promedio de tiempo por dominio */}
      <Card>
        <CardHeader>
          <CardTitle>Tiempo Promedio de Respuesta por Dominio</CardTitle>
          <CardDescription>Comparación de rendimiento entre dominios</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData.domainStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="domain"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-4 border rounded shadow-lg">
                        <p className="font-semibold text-lg">{data.domain}</p>
                        <div className="space-y-1 mt-2">
                          <p className="text-sm">
                            <span className="font-medium">Promedio:</span> {data.avgDuration}ms
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Último:</span> {data.lastDuration}ms
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Tasa éxito:</span> {data.successRate}%
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Total checks:</span> {data.totalChecks}
                          </p>
                          <p className={`text-sm font-semibold ${data.isValid ? 'text-green-600' : 'text-red-600'}`}>
                            {data.isValid ? '✓ Operacional' : '✗ Caído'}
                          </p>
                          <p className="text-xs text-gray-600 mt-2">
                            IP: {data.expectedIP}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar
                dataKey="avgDuration"
                fill="#3b82f6"
                name="Tiempo Promedio (ms)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabla de detalles */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle por Dominio</CardTitle>
          <CardDescription>Estado actual y métricas de cada dominio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Dominio</th>
                  <th className="text-left p-2">Estado</th>
                  <th className="text-right p-2">Último (ms)</th>
                  <th className="text-right p-2">Promedio (ms)</th>
                  <th className="text-right p-2">Éxito</th>
                  <th className="text-left p-2">IP Esperada</th>
                  <th className="text-left p-2">IPs Actuales</th>
                </tr>
              </thead>
              <tbody>
                {chartData.domainStats.map((stat) => (
                  <tr key={stat.domain} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{stat.domain}</td>
                    <td className="p-2">
                      {stat.isValid ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          Caído
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-right">{stat.lastDuration}</td>
                    <td className="p-2 text-right">{stat.avgDuration}</td>
                    <td className="p-2 text-right">
                      <span className={stat.successRate >= 80 ? 'text-green-600 font-semibold' : 'text-orange-600 font-semibold'}>
                        {stat.successRate}%
                      </span>
                    </td>
                    <td className="p-2 text-xs text-gray-600">{stat.expectedIP}</td>
                    <td className="p-2 text-xs text-gray-600">
                      {stat.actualIPs.join(', ') || 'N/A'}
                    </td>
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

export default MonitoringStats;
