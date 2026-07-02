'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { StarIcon } from '@phosphor-icons/react';

export function Specialists() {
  const t = useTranslations('landing');

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('specialists.title')}</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">{t('specialists.subtitle')}</p>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow">
            <Image alt="Dr. Sarah Johnson" className="w-full h-64 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyjRDzr0S9k7BU51TDg71ORvt8oy27BD-1JVE7vivqvAdkBWT4qZYFfQMe2ToUpRnh5aJB7tivzqANghcJgrynoBuFvh217u5Iv_qTcZQlfPiEXZHMWubFziE2pGSbalxqk_HFp8aiupN8qEe-42mVEoqnzrS3UplFKaWe_6QJrTOcSELA8GRfzSENR-lXURQ3KqXa7DZzXNpQmVeSP5xsu48-TafkumO8FgbnzDTF2678yc7JnX5avghT5GipG2BPALy8Ak8nFM8" width={400} height={400} />
            <div className="p-6">
              <h4 className="text-lg font-bold text-slate-900">Dr. Sarah Johnson</h4>
              <p className="text-[#1392ec] text-sm font-semibold mb-2">Cardiologist</p>
              <div className="flex items-center gap-1 mb-4">
                <StarIcon weight="fill" className="text-amber-400 text-sm" />
                <span className="text-xs font-bold text-slate-700">4.9 (120 reviews)</span>
              </div>
              <Link href="/doctors">
                <button className="w-full bg-slate-50 hover:bg-[#1392ec] hover:text-white text-[#1392ec] font-bold py-3 rounded-xl transition-colors text-sm cursor-pointer">
                  {t('specialists.bookAppointment')}
                </button>
              </Link>
            </div>
          </div>
          
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow">
            <Image alt="Dr. Robert Chen" className="w-full h-64 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBHW2rm6VghkOOHiodrnVAbBGSmTZjUtr29nwgMKdyiNoWRnll4XXVsHynJGxnFqKufE2XUJoJA_jXCz3uhXDdQHZkUk6XZgLSDHsIgwWC8VPXlSPfQN9QQjf3eb3Qs6sXWr4DPZ95uDkw0vpZlCTbHheVYIzy6zlHSsT3OK4EokLV9EkwV6pyaRBPPgsSyUdmTeorRIB9GIILnhnBa6IDiztmVkJB0C7G-zILVCrKRSr1qnI6LUZuY7jF-mAUgNbSegjNtcensSc" width={400} height={400} />
            <div className="p-6">
              <h4 className="text-lg font-bold text-slate-900">Dr. Robert Chen</h4>
              <p className="text-[#1392ec] text-sm font-semibold mb-2">Neurologist</p>
              <div className="flex items-center gap-1 mb-4">
                <StarIcon weight="fill" className="text-amber-400 text-sm" />
                <span className="text-xs font-bold text-slate-700">4.8 (95 reviews)</span>
              </div>
              <Link href="/doctors">
                <button className="w-full bg-slate-50 hover:bg-[#1392ec] hover:text-white text-[#1392ec] font-bold py-3 rounded-xl transition-colors text-sm cursor-pointer">
                  {t('specialists.bookAppointment')}
                </button>
              </Link>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow">
            <Image alt="Dr. Emily Davis" className="w-full h-64 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbcuRoOEBShAOqr7Sljn0dLnDcaV8Ve5gX3gGw9hQxxNG3FLYmQNl9qntCkqeTGl1MY66u9fipKn-VSuNYuxdfk02RPm3Vd5U_WhDtvInCKyxZnB3QGYXEyJBviNjHNs627bnNuIbQpHS5eSmzKggRxuv_h-xw3IMd3s1wdKRHlfFm0g2IX52bCb3UsqNQUyvXk2fykXNLJSuV1yK08bxfKKaZPUzI-tLVdwEK2O0xtLE87ScBaEnOcONW67B0BbxZrHiT90Za3zE" width={400} height={400} />
            <div className="p-6">
              <h4 className="text-lg font-bold text-slate-900">Dr. Emily Davis</h4>
              <p className="text-[#1392ec] text-sm font-semibold mb-2">Pediatrician</p>
              <div className="flex items-center gap-1 mb-4">
                <StarIcon weight="fill" className="text-amber-400 text-sm" />
                <span className="text-xs font-bold text-slate-700">5.0 (200 reviews)</span>
              </div>
              <Link href="/doctors">
                <button className="w-full bg-slate-50 hover:bg-[#1392ec] hover:text-white text-[#1392ec] font-bold py-3 rounded-xl transition-colors text-sm cursor-pointer">
                  {t('specialists.bookAppointment')}
                </button>
              </Link>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow">
             <Image alt="Dr. Michael Lee" className="w-full h-64 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyjRDzr0S9k7BU51TDg71ORvt8oy27BD-1JVE7vivqvAdkBWT4qZYFfQMe2ToUpRnh5aJB7tivzqANghcJgrynoBuFvh217u5Iv_qTcZQlfPiEXZHMWubFziE2pGSbalxqk_HFp8aiupN8qEe-42mVEoqnzrS3UplFKaWe_6QJrTOcSELA8GRfzSENR-lXURQ3KqXa7DZzXNpQmVeSP5xsu48-TafkumO8FgbnzDTF2678yc7JnX5avghT5GipG2BPALy8Ak8nFM8" width={400} height={400} />
            <div className="p-6">
              <h4 className="text-lg font-bold text-slate-900">Dr. Michael Lee</h4>
              <p className="text-[#1392ec] text-sm font-semibold mb-2">Orthopedic</p>
              <div className="flex items-center gap-1 mb-4">
                <StarIcon weight="fill" className="text-amber-400 text-sm" />
                <span className="text-xs font-bold text-slate-700">4.7 (80 reviews)</span>
              </div>
              <Link href="/doctors">
                <button className="w-full bg-slate-50 hover:bg-[#1392ec] hover:text-white text-[#1392ec] font-bold py-3 rounded-xl transition-colors text-sm cursor-pointer">
                  {t('specialists.bookAppointment')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
