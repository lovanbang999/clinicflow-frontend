'use client';

import React, { useState } from 'react';
import { ImageLightbox } from './ImageLightbox';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

function formatKey(key: string, t: ReturnType<typeof useTranslations>) {
  // Mapping for common medical terms
  const labels: Record<string, string | undefined> = {
    heartRate: t.has('symptoms.heartRate') ? t('symptoms.heartRate') : undefined,
    description: t.has('diagnosis.followUpNote') ? t('diagnosis.followUpNote') : undefined,
    conclusion: t.has('specialist.forms.shared.conclusion') ? t('specialist.forms.shared.conclusion') : undefined,
    abnormalNote: t.has('specialist.abnormalNoteLabel') ? t('specialist.abnormalNoteLabel') : undefined,
  };

  if (key in labels && labels[key]) return labels[key];

  // Map specialized result keys if they exist in i18n
  const cardiologyKey = `specialist.forms.CARDIOLOGY.${key}`;
  if (t.has(cardiologyKey)) {
    const translated = t(cardiologyKey);
    if (translated && translated !== cardiologyKey) return translated;
  }

  const sharedKey = `specialist.forms.shared.${key}`;
  if (t.has(sharedKey)) {
    const translated = t(sharedKey);
    if (translated && translated !== sharedKey) return translated;
  }

  // Fallback: convert camelCase to Title Case
  const result = key.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

interface LabResultContentProps {
  text: string;
  imageUrls?: string[];
  noDetailDesc?: string;
  className?: string;
}

export function LabResultContent({ text, imageUrls = [], noDetailDesc, className = '' }: LabResultContentProps) {
  const t = useTranslations('emr.visit');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const defaultNoDetail = noDetailDesc || t('services.results.empty');

  const renderImages = () => {
    if (!imageUrls || imageUrls.length === 0) return null;
    return (
      <div className="mt-6 border-t border-slate-100 pt-4">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <div className="w-1 h-3 bg-cyan-500 rounded-full" />
          <span>{t('services.results.viewImage')}</span>
          <span className="bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-cyan-100">
            {imageUrls.length}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {imageUrls.map((url, idx) => (
            <div 
              key={idx} 
              className="group relative aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-200 hover:border-cyan-400 hover:shadow-md hover:shadow-cyan-100 transition-all cursor-zoom-in"
              onClick={() => setSelectedImage(url)}
            >
              <Image 
                src={url} 
                alt={`Lab result ${idx + 1}`} 
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end justify-center pb-3">
                <button 
                  className="bg-white/95 text-cyan-700 text-[11px] font-bold px-4 py-1.5 rounded-full shadow-lg backdrop-blur-sm transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                >
                  {t('resultsTab.viewAttachment')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!text && imageUrls.length === 0) return <p className={`text-[13px] text-slate-400 italic py-4 ${className}`}>{defaultNoDetail}</p>;

  let parsedData: Record<string, unknown> | null = null;
  try {
    if (text) {
      const data = JSON.parse(text);
      if (typeof data === 'object' && data !== null) {
        parsedData = data;
      }
    }
  } catch {
    // Not JSON
  }

  const content = parsedData ? (
    <div className={`mt-4 space-y-6 ${className}`}>
      {Object.entries(parsedData).map(([key, value]) => {
        if (value === '' || key === 'abnormalNote' || value === null) return null;

        if (Array.isArray(value)) {
          return (
            <div key={key} className="bg-slate-50/40 p-4 rounded-xl border border-slate-200/60 shadow-sm">
              <div className="text-[11px] font-bold text-cyan-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                {formatKey(key, t)}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {value.map((item, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex flex-col group hover:border-cyan-200 transition-colors">
                    <span className="text-[10px] text-slate-500 font-semibold truncate mb-1" title={item.name}>
                      {item.name}
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-[15px] font-bold text-slate-800">{item.value}</span>
                      <span className="text-[11px] text-slate-500 font-medium">{item.unit}</span>
                    </div>
                    {item.reference && (
                      <span className="text-[10px] text-slate-400 mt-2 border-t border-slate-50 pt-1">
                        Ref: <span className="font-medium text-slate-500">{item.reference}</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        const isLongText = String(value).length > 50 || key === 'conclusion' || key === 'description';
        const isHighlight = key === 'conclusion';

        return (
          <div
            key={key}
            className={`p-4 rounded-xl border flex flex-col gap-1.5 transition-all ${
              isHighlight 
                ? 'bg-cyan-50/30 border-cyan-100 shadow-sm' 
                : 'bg-white border-slate-100'
            } ${isLongText ? 'w-full' : ''}`}
          >
            <span className={`text-[11px] font-bold uppercase tracking-widest ${isHighlight ? 'text-cyan-700' : 'text-slate-400'}`}>
              {formatKey(key, t)}
            </span>
            <span className={`text-[13px] font-medium leading-relaxed whitespace-pre-wrap ${isHighlight ? 'text-slate-900 font-semibold' : 'text-slate-700'}`}>
              {String(value)}
            </span>
          </div>
        );
      })}
    </div>
  ) : (
    <div className={`p-4 bg-white border border-slate-100 rounded-xl text-[14px] leading-relaxed whitespace-pre-wrap text-slate-700 shadow-sm ${className}`}>
      {text}
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      {content}
      {renderImages()}
      {selectedImage && (
        <ImageLightbox 
          url={selectedImage} 
          isOpen={!!selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </div>
  );
}
