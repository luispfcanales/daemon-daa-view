export const formatDuration = (duration: string): string => {
  const match = duration.match(/(\d+)\.?\d*ms/);
  return match ? `${match[1]}ms` : duration;
};

export const getSiteStateLabel = (state: number): string => {
  switch (state) {
    case 3: return 'Detenido';
    case 2: return 'Iniciando';
    case 1: return 'Ejecutándose';
    default: return 'Desconocido';
  }
};

export const getSiteStateVariant = (state: number): "default" | "secondary" | "destructive" | "outline" => {
  switch (state) {
    case 1: return 'destructive';
    case 2: return 'secondary';
    case 3: return 'default';
    default: return 'outline';
  }
};