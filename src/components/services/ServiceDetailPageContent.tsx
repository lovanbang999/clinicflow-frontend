'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useService } from '@/lib/hooks/clinic/useService';
import { resolveMediaUrl } from '@/lib/utils/media-url';
import { resolveAvatarUrl } from '@/lib/utils/avatar-url';

const AVATAR_COLORS = [
  'from-blue-500 to-blue-600',
  'from-green-500 to-emerald-600',
  'from-orange-500 to-amber-600',
  'from-sky-500 to-indigo-600',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-teal-600',
];

export function ServiceDetailPageContent() {
  const params = useParams();
  const serviceId = params.id as string;
  const t = useTranslations('services.detail');
  const locale = useLocale();
  const { service, isLoading } = useService(serviceId);
  const serviceImageSrc = resolveMediaUrl(service?.iconUrl);

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 max-w-lg w-full shadow-lg border border-slate-100 dark:border-slate-700 text-center relative z-10 flex flex-col items-center">
          <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-6">medical_services</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{t('notFound')}</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            {t('notFoundDesc')}
          </p>
          <Link
            href="/services"
            className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center text-sm"
          >
            {t('returnToServices')}
          </Link>
        </div>
      </div>
    );
  }

  const faqs = [
    { question: t('faq.q1'), answer: t('faq.a1') },
    { question: t('faq.q2'), answer: t('faq.a1') }, // Placeholder duplicate answers as in HTML for visual structure
    { question: t('faq.q3'), answer: t('faq.a1') },
    { question: t('faq.q4'), answer: t('faq.a1') },
  ];

  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
        <Link href="/services" className="hover:text-blue-600 transition-colors">
          {t('navServices')}
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-slate-900 dark:text-slate-300 font-medium">{service.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-8 tracking-tight leading-tight">
            {service.name}
          </h1>
          
          <div className="rounded-3xl overflow-hidden bg-white dark:bg-slate-800 mb-12 shadow-sm aspect-[16/9] relative">
            {serviceImageSrc ? (
              <Image 
                alt={service.name}
                className="w-full h-full object-cover"
                src={serviceImageSrc}
                fill
              />
            ) : (
              <Image 
                alt={service.name}
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-N2FFwn2Ndjv4wz51_gHVMq1OtS9AQr-ehP5gEBBYJRg_0KvVUfapCCY6jePWgY4gWg2ivh6ugaBMwtG-9WRvXxungjiiENHgJXqflvtyCvq58E32Gyf1qSRvot-Afl-NtgT4YYg94FVREJ8ZFFiYYDSsEkxOPC9OMmHaodt9MipSg2wd100-P1RkGLHh4uZga0px7JD7Ub06gy0uqIBZQRL8kVaLgiGlB4nemTs9BPZw0usmAQ-Abo9n-yN5KmhbDJ3gGxXv-AQ"
                width={1200}
                height={675}
              />
            )}
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('overview')}</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed">
              {service.description ? (
                <p>{service.description}</p>
              ) : (
                locale === 'vi' ? (
                  <>
                    <p>Dịch vụ {service.name} của chúng tôi cung cấp sự đánh giá toàn diện về sức khỏe của bạn. Các chuyên gia giàu kinh nghiệm của chúng tôi sử dụng công cụ chẩn đoán tiên tiến nhất để đánh giá chức năng, xác định rủi ro tiềm ẩn và xây dựng kế hoạch điều trị được cá nhân hóa.</p>
                    <p>Dù bạn đang gặp phải triệu chứng hay đang tìm kiếm một cuộc sàng lọc phòng ngừa, đội ngũ của chúng tôi luôn đảm bảo mang lại trải nghiệm lâm sàng tận tâm và toàn diện nhất.</p>
                  </>
                ) : (
                  <>
                    <p>Our {service.name} provides a thorough assessment of your health. Our board-certified specialists utilize state-of-the-art diagnostic tools to evaluate function, identify potential risks, and develop personalized treatment plans tailored to your specific needs.</p>
                    <p>Whether you&apos;re experiencing symptoms or seeking a preventative screening, our team ensures a compassionate and comprehensive clinical experience.</p>
                  </>
                )
              )}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{t('whatWeTreat')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[t('treat.item1'), t('treat.item2'), t('treat.item3'), t('treat.item4'), t('treat.item5'), t('treat.item6')].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-emerald-500 font-bold">check_circle</span>
                  <span className="text-slate-700 dark:text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{t('procedureDetails')}</h2>
            <div className="space-y-6">
              {[
                { title: t('proc.step1Title'), desc: t('proc.step1Desc') },
                { title: t('proc.step2Title'), desc: t('proc.step2Desc') },
                { title: t('proc.step3Title'), desc: t('proc.step3Desc') }
              ].map((step, idx) => (
                <div key={idx} className="flex gap-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-blue-600 font-bold shadow-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">{step.title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-28">
            <div className="bg-white dark:bg-slate-800 rounded-[16px] border border-slate-200 dark:border-slate-700/50 shadow-xl shadow-slate-200/50 dark:shadow-none p-6">
              <div className="mb-6">
                <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">{t('serviceFee')}</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                    {service.price 
                      ? (locale === 'vi' 
                          ? `${service.price.toLocaleString('vi-VN')}đ` 
                          : `${service.price.toLocaleString('en-US')} VND`)
                      : (locale === 'vi' ? '200.000đ' : '200,000 VND')}
                  </span>
                  <span className="text-slate-400 line-through text-lg">
                    {service.price 
                      ? (locale === 'vi'
                          ? `${(service.price * 1.25).toLocaleString('vi-VN')}đ`
                          : `${(service.price * 1.25).toLocaleString('en-US')} VND`)
                      : (locale === 'vi' ? '250.000đ' : '250,000 VND')}
                  </span>
                </div>
              </div>

              <div className="space-y-4 py-6 border-y border-slate-100 dark:border-slate-700/50 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span className="material-symbols-outlined text-lg">schedule</span>
                    <span className="text-sm">{t('duration')}</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {service.durationMinutes 
                      ? `${service.durationMinutes} ${locale === 'vi' ? 'Phút' : 'Mins'}` 
                      : (locale === 'vi' ? '45-60 Phút' : '45-60 Mins')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span className="material-symbols-outlined text-lg">calendar_month</span>
                    <span className="text-sm">{t('availability')}</span>
                  </div>
                  <span className="font-semibold text-emerald-600">{t('availableToday')}</span>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wide">{t('whatsIncluded')}</h4>
                <ul className="space-y-3">
                  {[t('includes.item1'), t('includes.item2'), t('includes.item3'), t('includes.item4')].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <span className="material-symbols-outlined text-blue-600 text-lg">check_circle</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/register"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98] mb-4 text-center"
              >
                {t('bookService')}
              </Link>
              <p className="text-center text-xs text-slate-400">{t('noPaymentText')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Specialists Static Section */}
      <section className="mt-24">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3 text-left">
              {t('ourSpecialists', { specialty: service.name })}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-left">{t('meetSpecialistsDesc')}</p>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {service.doctorServices && service.doctorServices.length > 0 ? (
            service.doctorServices.map(({ doctorProfile }) => {
              const { id, specialties, user } = doctorProfile;
              const avatarSrc = resolveAvatarUrl(user.avatar);
              const colorIndex = parseInt(id.slice(0, 8), 16) % AVATAR_COLORS.length;
              const avatarColor = AVATAR_COLORS[colorIndex];
              const initials = user.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <div key={id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-lg transition-all text-center flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full p-1 bg-white ring-1 ring-slate-100 dark:ring-slate-700/50 shadow-md mb-4 overflow-hidden relative">
                    {avatarSrc ? (
                      <Image
                        src={avatarSrc}
                        alt={user.fullName}
                        fill
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-2xl font-bold text-white`}>
                        {initials}
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">{user.fullName}</h4>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-1">
                    {Array.isArray(specialties) && specialties.length > 0
                      ? specialties[0]
                      : (locale === 'vi' ? 'Chuyên gia' : 'Specialist')}
                  </p>
                  <Link href={`/doctors/${user.id}`} className="mt-auto text-blue-600 text-sm font-bold hover:underline cursor-pointer">
                    {t('viewProfile')}
                  </Link>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20">
              <span className="material-symbols-outlined text-4xl mb-2 text-slate-300 dark:text-slate-600 block">supervised_user_circle</span>
              <p className="text-sm font-medium">{t('noSpecialists') || 'Chưa có bác sĩ liên kết với dịch vụ này.'}</p>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mt-24 mb-16 max-w-3xl mx-auto">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-10 text-center">{t('faqTitle')}</h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-slate-200 dark:border-slate-800 py-2">
              <button 
                className="w-full flex justify-between items-center text-left py-3 group cursor-pointer"
                onClick={() => toggleFaq(index)}
              >
                <span className={`text-lg font-bold transition-colors ${openFaq === index ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200 group-hover:text-blue-600 cursor-pointer'}`}>
                  {faq.question}
                </span>
                <span className={`material-symbols-outlined transition-transform duration-300 ${openFaq === index ? 'text-blue-600 rotate-180' : 'text-slate-400 group-hover:text-blue-600'}`}>
                  expand_more
                </span>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-96 opacity-100 pb-5 pt-1' : 'max-h-0 opacity-0'}`}
              >
                <div className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
