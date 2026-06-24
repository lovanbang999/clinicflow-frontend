'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import {
  SealCheckIcon,
  ArrowRightIcon,
  PhoneIcon,
  CheckCircleIcon,
  StarIcon,
  UserIcon,
  CalendarBlankIcon,
  StethoscopeIcon,
} from '@phosphor-icons/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useRouter } from '@/i18n/navigation';
import { useServices } from '@/lib/hooks/clinic/useServices';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function Hero() {
  const t = useTranslations('landing');
  const locale = useLocale();
  const router = useRouter();
  const { services } = useServices({ isActive: true });
  
  const [selectedServiceId, setSelectedServiceId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const dateFnsLocale = locale === 'vi' ? vi : enUS;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedServiceId && selectedServiceId !== 'all') {
      params.append('serviceId', selectedServiceId);
    }
    if (searchQuery.trim()) {
      params.append('query', searchQuery.trim());
    }
    if (date) {
      params.append('date', format(date, 'yyyy-MM-dd'));
    }
    const queryString = params.toString();
    router.push(`/doctors${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <header className="relative pt-12 pb-32 overflow-hidden bg-gradient-to-b from-white to-[#F0F7FF]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[10%] w-[50rem] h-[50rem] bg-blue-100/40 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[40rem] h-[40rem] bg-indigo-50/60 rounded-full blur-[80px]"></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left relative z-10">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-[#1392ec] text-sm font-bold tracking-wide mb-8">
              <SealCheckIcon weight="fill" className="text-base mr-2" />
              {t('hero.badge')}
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
              {t('hero.titleLine1')} <br /><span className="text-gradient">{t('hero.titleLine2')}</span>
            </h1>
            <p className="max-w-xl text-lg text-slate-600 mb-10 font-medium leading-relaxed">
              {t('hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-[#1392ec] hover:bg-[#0d7cd1] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-[#1392ec]/20 flex items-center justify-center gap-2"
              >
                {t('hero.cta')} <ArrowRightIcon weight="bold" className="text-sm" />
              </Link>
              <a
                href="tel:+84912345678"
                className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <PhoneIcon weight="fill" className="text-[#1392ec]" /> {t('hero.phone')}
              </a>
            </div>
            <div className="flex items-center gap-8 pt-8 border-t border-slate-200/60">
              <div className="flex -space-x-3">
                <Image alt="Doctor" className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBHW2rm6VghkOOHiodrnVAbBGSmTZjUtr29nwgMKdyiNoWRnll4XXVsHynJGxnFqKufE2XUJoJA_jXCz3uhXDdQHZkUk6XZgLSDHsIgwWC8VPXlSPfQN9QQjf3eb3Qs6sXWr4DPZ95uDkw0vpZlCTbHheVYIzy6zlHSsT3OK4EokLV9EkwV6pyaRBPPgsSyUdmTeorRIB9GIILnhnBa6IDiztmVkJB0C7G-zILVCrKRSr1qnI6LUZuY7jF-mAUgNbSegjNtcensSc" width={40} height={40} />
                <Image alt="Doctor" className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyjRDzr0S9k7BU51TDg71ORvt8oy27BD-1JVE7vivqvAdkBWT4qZYFfQMe2ToUpRnh5aJB7tivzqANghcJgrynoBuFvh217u5Iv_qTcZQlfPiEXZHMWubFziE2pGSbalxqk_HFp8aiupN8qEe-42mVEoqnzrS3UplFKaWe_6QJrTOcSELA8GRfzSENR-lXURQ3KqXa7DZzXNpQmVeSP5xsu48-TafkumO8FgbnzDTF2678yc7JnX5avghT5GipG2BPALy8Ak8nFM8" width={40} height={40} />
                <Image alt="Doctor" className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbcuRoOEBShAOqr7Sljn0dLnDcaV8Ve5gX3gGw9hQxxNG3FLYmQNl9qntCkqeTGl1MY66u9fipKn-VSuNYuxdfk02RPm3Vd5U_WhDtvInCKyxZnB3QGYXEyJBviNjHNs627bnNuIbQpHS5eSmzKggRxuv_h-xw3IMd3s1wdKRHlfFm0g2IX52bCb3UsqNQUyvXk2fykXNLJSuV1yK08bxfKKaZPUzI-tLVdwEK2O0xtLE87ScBaEnOcONW67B0BbxZrHiT90Za3zE" width={40} height={40} />
                <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">+2k</div>
              </div>
              <div className="text-sm font-medium text-slate-500">
                <span className="block text-slate-900 font-bold text-base">{t('hero.doctorCount')}</span>
                {t('hero.doctorSubtext')}
              </div>
            </div>
          </div>
          <div className="relative lg:h-[600px] w-full hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-white rounded-[40px] rotate-3 opacity-50"></div>
            <Image
              alt="Modern Medical Clinic Interior"
              className="object-cover rounded-[40px] shadow-2xl shadow-blue-900/10"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrqM_6q5JszHsm8kXrp574S2H4vifrthy6Uhdw48Jf-mNalGjkNBph39TA9AK-jYupO2fpX2OFA4VePFR0jMGmtkkoL2S7vVOG02djl887hx1DEfRUt6Rilxz93_BEbtPTJgd32S1XjaT30dfW93gfB_dKhDqXvj2EiiRth6VjZd3SOcXwx7DErvn1Ta6pcsRmaP5gDadZJx0sEkJfHucOh66MtAKo0WvJPXFGQLM35jobxa2FmuYvDuyIdfhvUtpS8SFAmnfcWVM"
              fill
              priority
            />
            <div className="absolute inset-0 bg-blue-900/5 rounded-[40px] pointer-events-none"></div>
            <div className="absolute top-10 -left-10 bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 flex items-center gap-3 animate-bounce" style={{ animationDuration: "3s" }}>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <CheckCircleIcon weight="fill" className="text-xl" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">{t('hero.statusLabel')}</p>
                <p className="text-sm font-bold text-slate-800">{t('hero.statusValue')}</p>
              </div>
            </div>
            <div className="absolute bottom-20 -right-6 bg-white p-5 rounded-2xl shadow-xl shadow-slate-200/50 max-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <StarIcon weight="fill" className="text-amber-400 text-sm" />
                <span className="text-sm font-bold text-slate-800">{t('hero.rating')}</span>
              </div>
              <p className="text-xs text-slate-500">{t('hero.ratingQuote')}</p>
            </div>
          </div>
        </div>

        {/* Search Feature */}
        <div className="max-w-4xl mx-auto mt-16 relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#1392ec]/10 to-blue-400/10 rounded-[24px] blur-md"></div>
          <div className="relative bg-white p-2 rounded-2xl shadow-lg border border-slate-100">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <div className="flex-1 w-full relative group">
                <StethoscopeIcon weight="fill" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1392ec] text-xl z-10 pointer-events-none" />
                <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                  <SelectTrigger className="w-full pl-12 pr-4 py-4 rounded-xl bg-transparent border-0 focus:ring-0 focus:ring-offset-0 outline-none text-slate-900 placeholder-slate-400 shadow-none h-auto cursor-pointer">
                    <SelectValue placeholder={t('servicesPage.searchPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent position='popper' align='end' className="bg-white border border-slate-200/80 rounded-2xl shadow-lg z-[100] max-h-[300px] overflow-y-auto">
                    <SelectItem value="all" className="cursor-pointer font-bold text-[#0066FF]">{t('servicesPage.searchPlaceholder')}</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id} className="cursor-pointer">
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 w-full relative group">
                <UserIcon weight="fill" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1392ec] text-xl pointer-events-none" />
                <input
                  aria-label={t('hero.searchPlaceholder')}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-transparent border-0 focus:ring-0 outline-none text-slate-900 placeholder-slate-400"
                  placeholder={t('hero.searchPlaceholder')}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex-1 w-full relative group">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full text-left pl-12 pr-4 py-4 rounded-xl bg-transparent border-0 focus:ring-0 outline-none text-slate-900 placeholder-slate-400 flex items-center cursor-pointer select-none"
                    >
                      <CalendarBlankIcon weight="fill" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1392ec] text-xl pointer-events-none" />
                      {date ? (
                        <span className="text-slate-900 font-medium">
                          {format(date, 'dd/MM/yyyy', { locale: dateFnsLocale })}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">{t('hero.datePlaceholder')}</span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border border-slate-200/80 shadow-lg bg-white z-[100]" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="p-2 w-full md:w-auto">
                <button
                  type="submit"
                  className="block w-full md:w-auto bg-[#1392ec] hover:bg-[#0d7cd1] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-xl text-center cursor-pointer whitespace-nowrap"
                >
                  {t('hero.searchBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto border-t border-slate-100 pt-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 mb-1">{t('hero.stat1Num')}</div>
            <div className="text-sm text-slate-500 font-medium">{t('hero.stat1')}</div>
          </div>
          <div className="text-center border-l border-slate-100">
            <div className="text-3xl font-bold text-slate-900 mb-1">{t('hero.stat2Num')}</div>
            <div className="text-sm text-slate-500 font-medium">{t('hero.stat2')}</div>
          </div>
          <div className="text-center border-l border-slate-100">
            <div className="text-3xl font-bold text-slate-900 mb-1">{t('hero.stat3Num')}</div>
            <div className="text-sm text-slate-500 font-medium">{t('hero.stat3')}</div>
          </div>
          <div className="text-center border-l border-slate-100">
            <div className="text-3xl font-bold text-slate-900 mb-1">{t('hero.stat4Num')}</div>
            <div className="text-sm text-slate-500 font-medium">{t('hero.stat4')}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
