'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useDoctor } from '@/lib/hooks/clinical/useDoctor';
import { Shield, Calendar, Mail, MapPin, Globe, Star, FileCheck, CheckCircle2, GraduationCap, Briefcase, Stethoscope, Search } from 'lucide-react';
import Link from 'next/link';

export function DoctorProfilePageContent() {
  const params = useParams();
  const doctorId = params.id as string;
  const t = useTranslations('doctors.profile');
  const { doctor, isLoading } = useDoctor(doctorId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfdfe]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1392ec]"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#fdfdfe] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] p-6">
        <div className="bg-white rounded-3xl p-10 max-w-lg w-full shadow-[0_20px_40px_-4px_rgba(20,25,40,0.06)] border border-slate-100 text-center relative z-10 flex flex-col items-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-white shadow-sm flex items-center justify-center">
              <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15" />
              </svg>
            </div>
            <div className="animate-bounce absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg border border-slate-100 flex items-center justify-center w-10 h-10">
              <Search className="w-5 h-5 text-[#1392ec]" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-[#0a1118] mb-3">{t('notFound')}</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            {t('notFoundDesc')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mt-2">
            <Link
              href="/doctors"
              className="flex-1 sm:flex-none w-full sm:w-auto h-11 px-6 bg-[#1392ec] hover:bg-[#1392ec]/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 text-sm"
            >
              <Stethoscope className="w-4 h-4" />
              {t('browseAllDoctors')}
            </Link>
            <Link
              href="/"
              className="flex-1 sm:flex-none w-full sm:w-auto h-11 px-6 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all border border-slate-200 flex items-center justify-center text-sm"
            >
              {t('returnToHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const AVATAR_COLORS = [
    'from-blue-500 to-blue-600',
    'from-green-500 to-emerald-600',
    'from-orange-500 to-amber-600',
    'from-purple-500 to-indigo-600',
    'from-pink-500 to-rose-600',
    'from-cyan-500 to-teal-600',
  ];
  const colorIndex = parseInt(doctor.id.slice(0, 8), 16) % AVATAR_COLORS.length;
  const avatarColor = AVATAR_COLORS[colorIndex];
  const initials = doctor.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <main className="max-w-[1280px] mx-auto px-6 py-12 bg-[#fdfdfe] font-display min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-[#1392ec]/10 blur-3xl rounded-full scale-125"></div>
              <div className="relative h-48 w-48 rounded-full border-4 border-white shadow-2xl overflow-hidden mx-auto bg-slate-100 flex items-center justify-center">
                {doctor.avatar ? (
                  <Image
                    alt={doctor.fullName}
                    className="w-full h-full object-cover"
                    src={`${process.env.NEXT_PUBLIC_API_URL}${doctor.avatar}`}
                    width={192}
                    height={192}
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-5xl font-bold text-white`}>
                    {initials}
                  </div>
                )}
              </div>
              <div className="absolute bottom-4 right-4 bg-green-500 border-4 border-white rounded-full h-8 w-8 flex items-center justify-center shadow-lg">
                <CheckCircle2 strokeWidth={4} className="h-4 w-4 text-white" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-[#0a1118] mb-1">{doctor.fullName}</h1>
            <p className="text-[#1392ec] font-bold mb-4 tracking-wide uppercase text-xs">
              {doctor.specialties[0] || t('generalPractice')}
            </p>
            
            <div className="flex items-center justify-center gap-1.5 mb-8">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-bold text-[#0a1118]">{Number(doctor.rating || 0).toFixed(1)}</span>
              <span className="text-slate-400 text-sm ml-1">({doctor.reviewCount} {t('reviews')})</span>
            </div>
            
            <div className="space-y-3">
              <Link
                href="/register"
                className="w-full h-14 bg-[#1392ec] hover:bg-[#1392ec]/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 group"
              >
                <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {t('bookAppointment')}
              </Link>
              <button className="w-full h-14 bg-slate-50 hover:bg-slate-100 text-[#0a1118] rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-slate-100 cursor-pointer">
                <Mail className="w-5 h-5" />
                {t('contactClinic')}
              </button>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-100 space-y-5 text-left">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0a1118]">{t('clinicLocation')}</p>
                  <p className="text-sm text-slate-500">{t('clinicAddress')}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <Globe className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0a1118]">{t('languages')}</p>
                  <p className="text-sm text-slate-500">{t('languageList')}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center shadow-sm">
              <p className="text-2xl font-bold text-[#1392ec]">{doctor.yearsOfExperience}+</p>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">{t('expYears')}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center shadow-sm">
              <p className="text-2xl font-bold text-[#1392ec]">1k+</p>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">{t('patients')}</p>
            </div>
          </div>
        </aside>

        {/* Right Main Content */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* About Section */}
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-2.5 bg-blue-50 rounded-xl">
                <Shield className="w-6 h-6 text-[#1392ec]" />
              </div>
              <h2 className="text-xl font-bold text-[#0a1118]">{t('aboutDoctor')}</h2>
            </div>
            <p className="text-slate-600 leading-relaxed mb-10 text-[15px]">
              {doctor.bio || t('noBioAvailable')}
            </p>
            
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-5">{t('specializations')}</h3>
            <div className="flex flex-wrap gap-2.5">
              {doctor.specialties.map((spec, i) => (
                <span key={i} className="px-4 py-2 bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl border border-slate-100">
                  {spec}
                </span>
              ))}
            </div>
          </section>

          {/* Education & Experience Section */}
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-2.5 bg-blue-50 rounded-xl">
                <FileCheck className="w-6 h-6 text-[#1392ec]" />
              </div>
              <h2 className="text-xl font-bold text-[#0a1118]">{t('educationExperience')}</h2>
            </div>
            
            {/* Pseudo timeline using border approach or relative absolute */}
            <div className="relative space-y-12 ml-2 before:absolute before:inset-0 before:ml-[1.2rem] before:-translate-x-px before:w-0.5 before:bg-slate-200">
              
              <div className="relative pl-12 flex items-start">
                <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-white border-2 border-[#1392ec] flex items-center justify-center z-10 shadow-sm">
                  <GraduationCap className="w-5 h-5 text-[#1392ec]" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mt-1 text-[#0a1118]">{t('qualificationsTitle')}</h4>
                  <div className="mt-3 space-y-2">
                    {doctor.qualifications.map((qual, i) => (
                      <p key={i} className="text-slate-500 text-sm flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1392ec] mt-1.5 flex-shrink-0"></span>
                        {qual}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative pl-12 flex items-start">
                <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-white border-2 border-[#1392ec] flex items-center justify-center z-10 shadow-sm">
                  <Briefcase className="w-5 h-5 text-[#1392ec]" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mt-1 text-[#0a1118]">{t('experienceTitle')}</h4>
                  <p className="text-slate-500 text-sm mt-2">{t('experienceDesc', { years: doctor.yearsOfExperience })}</p>
                </div>
              </div>

            </div>
          </section>

          {/* Reviews Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100">
              <div className="flex items-center gap-4 mb-10">
                <div className="p-2.5 bg-blue-50 rounded-xl">
                  <Star className="w-6 h-6 text-[#1392ec]" />
                </div>
                <h2 className="text-xl font-bold text-[#0a1118]">{t('patientReviews')}</h2>
              </div>
              
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="text-center md:px-8">
                  <div className="text-6xl font-black text-[#0a1118] tracking-tight">{Number(doctor.rating || 0).toFixed(1)}</div>
                  <div className="flex gap-1 my-4 justify-center text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-5 h-5 ${star <= Math.round(doctor.rating) ? 'fill-yellow-400' : 'fill-none text-slate-300'}`} />
                    ))}
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{doctor.reviewCount} {t('verifiedReviews')}</p>
                </div>
                
                <div className="flex-1 w-full space-y-3.5">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-500 w-4">5</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#1392ec] rounded-full w-[92%]"></div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 w-8">92%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-500 w-4">4</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#1392ec] rounded-full w-[6%]"></div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 w-8">6%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-500 w-4">3</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#1392ec] rounded-full w-[2%]"></div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 w-8">2%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 text-center border-t border-slate-100">
              <button className="text-[#1392ec] font-bold text-sm hover:underline tracking-tight cursor-pointer">
                {t('viewAllReviews', { count: doctor.reviewCount })}
              </button>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
