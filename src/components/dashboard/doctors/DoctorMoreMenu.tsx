'use client';

import { useState, useRef, useEffect } from 'react';
import {
  UserCircleIcon,
  CalendarCheckIcon,
  ProhibitIcon,
  CheckCircleIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { BackendUser } from '@/types';

interface DoctorMoreMenuProps {
  doctor: BackendUser;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  open: boolean;
  onClose: () => void;
  onViewDetail: (doctor: BackendUser) => void;
  onViewSchedule: (doctor: BackendUser) => void;
  onToggleStatus: (doctor: BackendUser) => void;
  onDelete: (doctor: BackendUser) => void;
}

export function DoctorMoreMenu({
  doctor,
  anchorRef,
  open,
  onClose,
  onViewDetail,
  onViewSchedule,
  onToggleStatus,
  onDelete,
}: DoctorMoreMenuProps) {
  const t = useTranslations('dashboard.admin.doctorManagement.moreMenu');
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  // Position the menu next to the anchor button
  useEffect(() => {
    if (open && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 200,
      });
    }
  }, [open, anchorRef]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  const items = [
    {
      icon: <UserCircleIcon size={16} />,
      label: t('viewDetail'),
      onClick: () => { onViewDetail(doctor); onClose(); },
      className: 'text-[#111518]',
    },
    {
      icon: <CalendarCheckIcon size={16} />,
      label: t('viewSchedule'),
      onClick: () => { onViewSchedule(doctor); onClose(); },
      className: 'text-[#111518]',
    },
    { separator: true },
    {
      icon: doctor.isActive
        ? <ProhibitIcon size={16} />
        : <CheckCircleIcon size={16} />,
      label: doctor.isActive ? t('suspend') : t('reinstate'),
      onClick: () => { onToggleStatus(doctor); onClose(); },
      className: doctor.isActive ? 'text-amber-600' : 'text-emerald-600',
    },
    {
      icon: <TrashIcon size={16} />,
      label: t('delete'),
      onClick: () => { onDelete(doctor); onClose(); },
      className: 'text-red-500',
    },
  ];

  return (
    <div
      ref={menuRef}
      style={{ top: pos.top, left: pos.left }}
      className="fixed z-50 w-52 bg-white rounded-2xl border border-[#e5e7eb] shadow-lg shadow-black/10 py-1.5 animate-in fade-in zoom-in-95 duration-100"
    >
      {items.map((item, i) =>
        'separator' in item ? (
          <div key={i} className="my-1 mx-3 border-t border-[#f0f3f4]" />
        ) : (
          <button
            key={i}
            onClick={item.onClick}
            className={cn(
              'w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium hover:bg-[#f8fafc] transition-colors cursor-pointer text-left',
              item.className,
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ),
      )}
    </div>
  );
}
