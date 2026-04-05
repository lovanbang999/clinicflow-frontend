import { BookingStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: BookingStatus;
  label: string;
  className?: string;
}

const statusStyles: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-500 dark:ring-yellow-500/20',
  [BookingStatus.CONFIRMED]: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20',
  [BookingStatus.CHECKED_IN]: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/20',
  [BookingStatus.IN_PROGRESS]: 'bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-500/10 dark:text-purple-400 dark:ring-purple-500/20',
  [BookingStatus.COMPLETED]: 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20',
  [BookingStatus.CANCELLED]: 'bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-500/10 dark:text-gray-400 dark:ring-gray-500/20',
  [BookingStatus.QUEUED]: 'bg-cyan-50 text-cyan-700 ring-cyan-600/20 dark:bg-cyan-500/10 dark:text-cyan-400 dark:ring-cyan-500/20',
  [BookingStatus.NO_SHOW]: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20',
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center gap-1 max-w-24',
        'min-h-6 px-2.5 py-2',
        'rounded-lg text-xs font-medium leading-none',
        'ring-1 ring-inset',
        'transition-colors duration-200',
        statusStyles[status],
        className
      )}
    >
      {label}
    </span>
  );
}
