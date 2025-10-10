export const formatDuration = (duration: string): string => {
  const match = duration.match(/(\d+)\.?\d*ms/);
  return match ? `${match[1]}ms` : duration;
};

export const getSiteStateLabel = (state: number): string => {
  switch (state) {
    case 3: return 'Stopped';
    case 2: return 'Stopping';
    case 1: return 'Started';
    case 0: return 'starting';
    default: return 'Unknown';
  }
};

export const getSiteStateNumber = (state: string): number => {
  switch (state) {
    case 'Stopped': return 3;
    case 'Stopping': return 2;
    case 'Started': return 1;
    case 'starting': return 0;
    default: return -1;
  }
};

export const getSiteStateVariant = (state: number): string => {
  switch (state) {
    case 1: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 2: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 3: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};