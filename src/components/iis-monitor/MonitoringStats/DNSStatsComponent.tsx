import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { DNSStats } from '@/types';

interface DNSStatsComponentProps {
  dnsStats: Record<string, DNSStats>;
}

const DNSStatsComponent: React.FC<DNSStatsComponentProps> = ({ dnsStats }) => {
  // Log cada vez que el componente se renderiza
  useEffect(() => {
    console.log('🔄 DNSStatsComponent renderizado con:', {
      domains: Object.keys(dnsStats),
      count: Object.keys(dnsStats).length,
      stats: dnsStats
    });
  }, [dnsStats]);

  const domains = Object.keys(dnsStats);
  const hasData = domains.length > 0;

  if (!hasData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            <p>No hay estadísticas DNS disponibles</p>
            <p className="text-sm mt-2">Las estadísticas aparecerán cuando haya datos de monitoreo</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {domains.map((domain) => {
        const stat = dnsStats[domain];
        //console.log(`   📈 Renderizando stat para ${domain}:`, stat);

        return (
          <Card key={domain}>
            <CardHeader>
              <CardTitle className="text-lg">{stat.dns}</CardTitle>
              <CardDescription>
                Última verificación: {new Date(stat.last_check).toLocaleString('es-ES')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Tasa de Éxito</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stat.success_rate.toFixed(2)}%
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Checks Totales</p>
                  <p className="text-2xl font-bold">{stat.total_checks}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Checks Exitosos</p>
                  <p className="text-2xl font-bold text-green-600">{stat.success_count}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Uptime Promedio</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stat.average_uptime.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Tiempos de Respuesta (ms)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Promedio</p>
                    <p className="text-lg font-semibold">
                      {stat.avg_response_time.toFixed(2)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Mínimo</p>
                    <p className="text-lg font-semibold text-green-600">
                      {stat.min_response_time.toFixed(2)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Máximo</p>
                    <p className="text-lg font-semibold text-red-600">
                      {stat.max_response_time.toFixed(2)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">P95</p>
                    <p className="text-lg font-semibold text-orange-600">
                      {stat.p95_response_time.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DNSStatsComponent;
