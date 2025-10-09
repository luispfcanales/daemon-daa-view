import React, { useState } from 'react';
import type { IISSite } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Play, 
  Square, 
  RefreshCw, 
  Link, 
  Search, 
  Filter,
  Grid,
  List,
  Server
} from 'lucide-react';
import { getSiteStateLabel, getSiteStateVariant } from '@/utils/helpers';
import { SITE_STATES } from '@/utils/constant';

interface SiteListProps {
  sites: IISSite[];
  onSiteControl: (siteName: string, action: 'start' | 'stop' | 'restart') => void;
}

const SiteList: React.FC<SiteListProps> = ({ sites, onSiteControl }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'running' | 'stopped'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  // Filtrar sitios basado en búsqueda y estado
  const filteredSites = sites.filter(site => {
    const matchesSearch = site.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         site.URL.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'running' && site.State !== SITE_STATES.STOPPED) ||
                         (statusFilter === 'stopped' && site.State === SITE_STATES.STOPPED);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">

      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
        {/* Búsqueda */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar sitios por nombre o URL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>

        {/* Filtros y vistas */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Filtro por estado */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-sm border rounded-md px-3 py-1.5 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            >
              <option value="all">Todos los estados</option>
              <option value="running">En ejecución</option>
              <option value="stopped">Detenidos</option>
            </select>
          </div>

          {/* Modo de vista */}
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-9 px-3 rounded-none"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-9 px-3 rounded-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Resultados de búsqueda */}
      {searchTerm && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredSites.length} de {sites.length} sitios coinciden con "{searchTerm}"
        </div>
      )}

      {/* Lista de sitios */}
      {filteredSites.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50 dark:bg-gray-800">
          <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No se encontraron sitios IIS
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            {searchTerm || statusFilter !== 'all' 
              ? 'Intenta ajustar los filtros de búsqueda' 
              : 'No hay sitios configurados para mostrar'}
          </p>
        </div>
      ) : viewMode === 'list' ? (
        /* Vista de lista */
        <div className="space-y-3">
          {filteredSites.map((site) => {
            const stateLabel = getSiteStateLabel(site.State);
            const stateVariant = getSiteStateVariant(site.State);
            const isStopped = site.State === SITE_STATES.STOPPED;

            return (
              <div 
                key={site.Id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all bg-white dark:bg-gray-800 group"
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    isStopped ? 'bg-red-500' : 'bg-green-500'
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {site.Name}
                      </h3>
                      <Badge variant={stateVariant} className="text-xs font-medium uppercase flex-shrink-0">
                        {stateLabel}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Link className="w-4 h-4 flex-shrink-0 text-blue-500" />
                      <a 
                        href={site.URL} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:text-blue-600 dark:hover:text-blue-400 truncate font-mono text-xs"
                        title={`Abrir ${site.URL}`}
                      >
                        {site.URL}
                      </a>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">ID: {site.Id}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                  <Button
                    onClick={() => onSiteControl(site.Name, isStopped ? 'start' : 'stop')}
                    variant={isStopped ? "default" : "destructive"}
                    size="sm"
                    className="flex items-center space-x-2 transition-colors"
                    disabled={site.State === SITE_STATES.STARTING}
                  >
                    {isStopped ? (
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
                    className="flex items-center space-x-2"
                    disabled={site.State === SITE_STATES.STARTING}
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reiniciar</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Vista de cuadrícula */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSites.map((site) => {
            const stateLabel = getSiteStateLabel(site.State);
            const stateVariant = getSiteStateVariant(site.State);
            const isStopped = site.State === SITE_STATES.STOPPED;

            return (
              <div 
                key={site.Id} 
                className="border rounded-lg p-4 hover:shadow-md transition-all bg-white dark:bg-gray-800"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      isStopped ? 'bg-red-500' : 'bg-green-500'
                    }`} />
                    <Badge variant={stateVariant} className="text-xs font-medium uppercase">
                      {stateLabel}
                    </Badge>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate">
                  {site.Name}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Link className="w-4 h-4 flex-shrink-0 text-blue-500" />
                    <a 
                      href={site.URL} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:text-blue-600 dark:hover:text-blue-400 truncate text-xs font-mono"
                      title={`Abrir ${site.URL}`}
                    >
                      {site.URL}
                    </a>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">ID: {site.Id}</p>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => onSiteControl(site.Name, isStopped ? 'start' : 'stop')}
                    variant={isStopped ? "default" : "destructive"}
                    size="sm"
                    className="flex-1 flex items-center justify-center space-x-1"
                    disabled={site.State === SITE_STATES.STARTING}
                  >
                    {isStopped ? <Play className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    <span>{isStopped ? 'Iniciar' : 'Detener'}</span>
                  </Button>
                  
                  <Button
                    onClick={() => onSiteControl(site.Name, 'restart')}
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center space-x-1"
                    disabled={site.State === SITE_STATES.STARTING}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SiteList;