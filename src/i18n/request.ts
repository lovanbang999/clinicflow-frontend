import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';
 
export default getRequestConfig(async ({requestLocale}) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // Load all message files for the locale
  const messages = {
    common: (await import(`../../messages/${locale}/common.json`)).default,
    landing: (await import(`../../messages/${locale}/landing.json`)).default,
    auth: (await import(`../../messages/${locale}/auth.json`)).default,
    validation: (await import(`../../messages/${locale}/validation.json`)).default,
    dashboard: (await import(`../../messages/${locale}/dashboard.json`)).default,
    booking: (await import(`../../messages/${locale}/booking.json`)).default,
    queue: (await import(`../../messages/${locale}/queue.json`)).default,
    services: (await import(`../../messages/${locale}/services.json`)).default,
    errors: (await import(`../../messages/${locale}/errors.json`)).default,
  };
 
  return {
    locale,
    messages
  };
});
