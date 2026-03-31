import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ApiError } from '@/types';
import { getErrorKey } from '@/lib/utils/error-helper';

export interface ApiActionOptions<T> {
  onSuccessMsg?: string;
  errorFallbackMsg?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError | Error) => void;
}

/**
 * A generic hook to wrap API calls with loading states, automated error translations,
 * and unified toast notifications.
 */
export function useApiHandler() {
  const [isLoading, setIsLoading] = useState(false);
  const tErrors = useTranslations('errors');

  const execute = async <T,>(
    action: () => Promise<T>,
    options?: ApiActionOptions<T>
  ): Promise<T | undefined> => {
    try {
      setIsLoading(true);
      const result = await action();
      
      if (options?.showSuccessToast !== false && options?.onSuccessMsg) {
        toast.success(options.onSuccessMsg);
      }
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      // Because `client.ts` strips the Axios wrapper, err is typically an ApiError
      const error = err as ApiError;
      
      if (options?.showErrorToast !== false) {
        // Resolve mapped translation key for this messageCode
        const errorKey = getErrorKey(error.messageCode, 'generic');
        let errorMessage = tErrors(errorKey);
        
        // If the translation dictionary doesn't have the key, fallback to backend message
        if (errorMessage === errorKey) {
          errorMessage = error.message || tErrors('generic');
        }

        toast.error(options?.errorFallbackMsg || tErrors('generic'), {
          description: errorMessage,
        });
      }

      if (options?.onError) {
        options.onError(error);
      } else {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading };
}
