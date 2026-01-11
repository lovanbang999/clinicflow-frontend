import { toast } from 'sonner';
import { getErrorKey } from '@/lib/utils/error-helper';
import type { ApiError } from '@/types';

export function showApiErrorToast(
  err: ApiError,
  tErrors: (key: string) => string,
  options?: { title?: string; fallbackKey?: string },
) {
  const error = err as Partial<ApiError>;

  const fallbackKey = options?.fallbackKey ?? 'generic';
  const errorKey = getErrorKey(error.messageCode, fallbackKey);

  // Prefer translated message from messageCode
  const description = tErrors(errorKey);

  toast.error(options?.title ?? 'Lỗi', { description });
}
