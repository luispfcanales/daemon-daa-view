import React, { useState } from 'react';
import type { IISSite } from '@/types';
import { 
  Play, 
  Square, 
  RefreshCw, 
  Link, 
  Search, 
  Filter,
  Grid,
  List,
  Server,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { getSiteStateLabel, getSiteStateVariant } from '@/utils/helpers';
import { SITE_STATES } from '@/utils/constant';

interface SiteListProps {
  sites: IISSite[];
  onSiteControl: (siteName: string, action: 'start' | 'stop' | 'restart') => void;
}


const URLList: React.FC<{ urlString: string }> = ({ urlString }) => {
  const urls = urlString.split(',').map(url => url.trim()).filter(url => url);
  
  if (urls.length === 0) return null;
  
  return (
    <div className="space-y-1">
      {urls.map((url, index) => (
        <div key={index} className="flex items-center space-x-2 text-sm">
          <Link className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-blue-600 dark:hover:text-blue-400 truncate font-mono text-xs group flex items-center space-x-1"
            title={`Abrir ${url}`}
          >
            <span className="truncate">{url}</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </a>
        </div>
      ))}
    </div>
  );
};
const SiteList: React.FC<SiteListProps> = ({ sites, onSiteControl }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'running' | 'stopped'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [loadingSites, setLoadingSites] = useState<Set<string>>(new Set());

  const handleSiteControl = async (siteName: string, action: 'start' | 'stop' | 'restart') => {
    setLoadingSites(prev => new Set(prev).add(siteName));
    
    try {
      await onSiteControl(siteName, action);
    } finally {
      setTimeout(() => {
        setLoadingSites(prev => {
          const newSet = new Set(prev);
          newSet.delete(siteName);
          return newSet;
        });
      }, 500);
    }
  };

  const isSiteLoading = (siteName: string) => loadingSites.has(siteName);

  const filteredSites = sites.filter(site => {
    const matchesSearch = site.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         site.URL.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'running' && site.State !== SITE_STATES.STOPPED) ||
                         (statusFilter === 'stopped' && site.State === SITE_STATES.STOPPED);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Barra de herramientas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar sitios por nombre o URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filtros y vistas */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Filtro por estado */}
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
                <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="text-sm bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  <option value="all">Todos los estados</option>
                  <option value="running">En ejecución</option>
                  <option value="stopped">Detenidos</option>
                </select>
              </div>

              {/* Modo de vista */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'list' 
                      ? 'bg-white dark:bg-gray-600 shadow-sm' 
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Vista de lista"
                >
                  <List className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-white dark:bg-gray-600 shadow-sm' 
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Vista de cuadrícula"
                >
                  <Grid className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>

          {/* Contador de resultados */}
          {searchTerm && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">{filteredSites.length}</span> de{' '}
                <span className="font-semibold text-gray-900 dark:text-white">{sites.length}</span> sitios coinciden con{' '}
                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">"{searchTerm}"</span>
              </p>
            </div>
          )}
        </div>

        {/* Lista de sitios */}
        {filteredSites.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-dashed border-gray-300 dark:border-gray-600 p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                <Server className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No se encontraron sitios IIS
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda' 
                  : 'No hay sitios configurados para mostrar'}
              </p>
            </div>
          </div>
        ) : viewMode === 'list' ? (
          /* Vista de lista */
          <div className="space-y-3">
            {filteredSites.map((site) => {
              const stateLabel = getSiteStateLabel(site.State);
              const stateVariant = getSiteStateVariant(site.State);
              const isStopped = site.State === SITE_STATES.STOPPED;
              const isStarting = site.State === SITE_STATES.STARTING;
              const isStopping = site.State === SITE_STATES.STOPPING;
              const isLoading = isSiteLoading(site.Name) || isStarting || isStopping;

              return (
                <div 
                  key={site.Id} 
                  className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 transition-all ${
                    isLoading ? 'opacity-60' : 'hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 shadow-lg ${
                        isStopped ? 'bg-red-500 shadow-red-500/50' : 'bg-green-500 shadow-green-500/50'
                      } ${isStarting || isStopping ? 'animate-pulse' : ''}`} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate">
                            {site.Name}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${stateVariant}`}>
                            {isStarting || isStopping ? (
                              <span className="flex items-center space-x-1.5">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>{stateLabel}</span>
                              </span>
                            ) : (
                              stateLabel
                            )}
                          </span>
                        </div>
                        
                        <URLList urlString={site.URL} />
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-mono">ID: {site.Id}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => handleSiteControl(site.Name, isStopped ? 'start' : 'stop')}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-2 min-w-28 justify-center ${
                          isStopped 
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30' 
                            : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isLoading && isSiteLoading(site.Name) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isStopped ? (
                          <>
                            <Play className="w-4 h-4 fill-current" />
                            <span>Iniciar</span>
                          </>
                        ) : (
                          <>
                            <Square className="w-4 h-4 fill-current" />
                            <span>Detener</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleSiteControl(site.Name, 'restart')}
                        disabled={true}
                        className="px-4 py-2 rounded-lg font-medium text-sm border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center space-x-2 min-w-28 justify-center disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                      >
                        {isLoading && isSiteLoading(site.Name) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4" />
                            <span>Reiniciar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {isLoading && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="font-medium">Procesando operación...</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Vista de cuadrícula */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredSites.map((site) => {
              const stateLabel = getSiteStateLabel(site.State);
              const stateVariant = getSiteStateVariant(site.State);
              const isStopped = site.State === SITE_STATES.STOPPED;
              const isStarting = site.State === SITE_STATES.STARTING;
              const isStopping = site.State === SITE_STATES.STOPPING;
              const isLoading = isSiteLoading(site.Name) || isStarting || isStopping;

              return (
                <div 
                  key={site.Id} 
                  className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 transition-all ${
                    isLoading ? 'opacity-60' : 'hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2.5 h-2.5 rounded-full shadow-lg ${
                        isStopped ? 'bg-red-500 shadow-red-500/50' : 'bg-green-500 shadow-green-500/50'
                      } ${isStarting || isStopping ? 'animate-pulse' : ''}`} />
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${stateVariant}`}>
                        {isStarting || isStopping ? (
                          <span className="flex items-center space-x-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>{stateLabel}</span>
                          </span>
                        ) : (
                          stateLabel
                        )}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3 truncate">
                    {site.Name}
                  </h3>
                  
                  <div className="mb-4">
                    <URLList urlString={site.URL} />
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-mono">ID: {site.Id}</p>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSiteControl(site.Name, isStopped ? 'start' : 'stop')}
                      disabled={isLoading}
                      className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center space-x-1.5 ${
                        isStopped 
                          ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30' 
                          : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isLoading && isSiteLoading(site.Name) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isStopped ? (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Iniciar</span>
                        </>
                      ) : (
                        <>
                          <Square className="w-4 h-4 fill-current" />
                          <span>Detener</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleSiteControl(site.Name, 'restart')}
                      disabled={true}
                      className="px-3 py-2 rounded-lg font-medium text-sm border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                    >
                      {isLoading && isSiteLoading(site.Name) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {isLoading && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-center space-x-2 text-xs text-blue-600 dark:text-blue-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span className="font-medium">Procesando...</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteList;