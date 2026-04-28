import { useState, useCallback } from 'react';
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
  const tApi = useTranslations('common.api');

  const execute = useCallback(async <T,>(
    action: () => Promise<T>,
    options?: ApiActionOptions<T>
  ): Promise<T | undefined> => {
    try {
      void Promise.resolve().then(() => {
        setError(null);
        setIsLoading(true);
      });
      
      const result = await action();
      
      if (options?.showSuccessToast !== false && options?.onSuccessMsg) {
        // Only attempt translation if it looks like a translation key (no spaces/special chars)
        const isKey = /^[a-zA-Z0-9_.-]+$/.test(options.onSuccessMsg);
        let message = options.onSuccessMsg;
        
        if (isKey) {
          try {
            const translated = tApi(options.onSuccessMsg);
            message = translated === `common.api.${options.onSuccessMsg}` 
              ? options.onSuccessMsg 
              : translated;
          } catch {
            // Fallback if next-intl throws
          }
        }
        toast.success(message);
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
        
        console.log(errorMessage);
        
        if (errorMessage === `errors.${errorKey}` || errorMessage === errorKey) {
          errorMessage = apiError.message || tErrors('generic');
        }

        // Translate fallback message if provided
        let fallbackMsg = tErrors('generic');
        if (options?.errorFallbackMsg) {
          const isKey = /^[a-zA-Z0-9_.-]+$/.test(options.errorFallbackMsg);
          fallbackMsg = options.errorFallbackMsg;
          
          if (isKey) {
            try {
              const translated = tApi(options.errorFallbackMsg);
              if (translated !== `common.api.${options.errorFallbackMsg}`) {
                fallbackMsg = translated;
              }
            } catch {
               // Fallback
            }
          }
        }

        toast.error(fallbackMsg, {
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
  }, [tErrors, tApi]);

  return { execute, isLoading, error };
}
