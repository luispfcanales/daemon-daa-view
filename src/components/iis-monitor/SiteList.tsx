import React from 'react';
import type { IISSite } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square, RefreshCw } from 'lucide-react';
import { getSiteStateLabel, getSiteStateVariant } from '@/utils/helpers';
import { SITE_STATES } from '@/utils/constant';

interface SiteListProps {
  sites: IISSite[];
  onSiteControl: (siteName: string, action: 'start' | 'stop' | 'restart') => void;
}

const SiteList: React.FC<SiteListProps> = ({ sites, onSiteControl }) => {
  return (
    <div className="space-y-4">
      {sites.map((site) => {
        const stateLabel = getSiteStateLabel(site.State);
        const stateVariant = getSiteStateVariant(site.State);
        
        return (
          <div key={site.Id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold">{site.Name}</h3>
                  <Badge variant={stateVariant}>
                    {stateLabel}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">ID: {site.Id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => onSiteControl(site.Name, site.State === SITE_STATES.STOPPED ? 'start' : 'stop')}
                variant={site.State === SITE_STATES.STOPPED ? "default" : "destructive"}
                size="sm"
                className="flex items-center space-x-1"
              >
                {site.State === SITE_STATES.STOPPED ? (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Iniciar</span>
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4" />
                    <span>Detener</span>
                  </>
                )}
              </Button>
              <Button
                onClick={() => onSiteControl(site.Name, 'restart')}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reiniciar</span>
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SiteList;