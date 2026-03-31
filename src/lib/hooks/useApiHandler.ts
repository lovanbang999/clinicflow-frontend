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
  const [error, setError] = useState<ApiError | Error | null>(null);
  const tErrors = useTranslations('errors');

  const execute = async <T,>(
    action: () => Promise<T>,
    options?: ApiActionOptions<T>
  ): Promise<T | undefined> => {
    try {
      setError(null);
      // Use microtask to avoid "setState in effect" warning during synchronous execution
      // This ensures that the state update happens after the effect finish executing 
      // its synchronous part.
      void Promise.resolve().then(() => {
        setIsLoading(true);
      });
      
      const result = await action();
      
      if (options?.showSuccessToast !== false && options?.onSuccessMsg) {
        toast.success(options.onSuccessMsg);
      }
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      
      if (options?.showErrorToast !== false) {
        const errorKey = getErrorKey(apiError.messageCode, 'generic');
        let errorMessage = tErrors(errorKey);
        
        if (errorMessage === errorKey) {
          errorMessage = apiError.message || tErrors('generic');
        }

        toast.error(options?.errorFallbackMsg || tErrors('generic'), {
          description: errorMessage,
        });
      }

      if (options?.onError) {
        options.onError(apiError);
      } else {
        throw apiError;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading, error };
}
