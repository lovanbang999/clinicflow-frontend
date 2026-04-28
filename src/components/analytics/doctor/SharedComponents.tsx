import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, UserIcon } from 'lucide-react';
import { STATUS_META, COLORS } from './constants';

export function Delta({ value }: { value: number }) {
  if (value === 0) return <span className="text-[10px] text-[#5F5E5A] bg-[#F1EFE8] px-2 py-0.5 rounded-full">0%</span>;
  const up = value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${up ? 'bg-[#EAF3DE] text-[#3B6D11]' : 'bg-[#FCEBEB] text-[#A32D2D]'}`}>
      {up ? <ArrowUpIcon size={9} /> : <ArrowDownIcon size={9} />}
      {Math.abs(value)}%
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, color: COLORS.GRAY };
  return (
    <span
      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
      style={{ background: meta.color + '1A', color: meta.color }}
    >
      {meta.label}
    </span>
  );
}

export function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name.split(' ').slice(-2).map((n) => n[0]).join('').toUpperCase();
  const colors = [
    ['#E6F1FB','#185FA5'],['#E1F5EE','#0F6E56'],['#FAEEDA','#854F0B'],
    ['#FCEBEB','#A32D2D'],['#EEEDFE','#534AB7'],['#FAECE7','#993C1D'],
  ];
  const pair = colors[initials.charCodeAt(0) % colors.length];
  const cls = size === 'sm' ? 'w-8 h-8 text-[11px]' : 'w-9 h-9 text-sm';
  return (
    <div className={`${cls} rounded-full flex items-center justify-center font-semibold shrink-0`} style={{ background: pair[0], color: pair[1] }}>
      {initials || <UserIcon size={12} />}
    </div>
  );
}

export function CardShell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-[#e5e7eb] p-5 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <p className="text-sm font-semibold text-[#111518]">{title}</p>
      {sub && <p className="text-[11px] text-[#64748b] mt-0.5">{sub}</p>}
    </div>
  );
}
