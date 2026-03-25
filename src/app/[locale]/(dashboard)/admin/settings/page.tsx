'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  GearIcon,
  ClockIcon,
  BellIcon,
  FloppyDiskIcon,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

interface SystemConfig {
  clinicOpenTime: string;
  clinicCloseTime: string;
  noShowGraceMinutes: number;
  reminderHours24: boolean;
  reminderHours1: boolean;
}

const DEFAULTS: SystemConfig = {
  clinicOpenTime: '07:00',
  clinicCloseTime: '17:00',
  noShowGraceMinutes: 30,
  reminderHours24: true,
  reminderHours1: true,
};

function SectionCard({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
        <div className="size-8 rounded-xl bg-[#1392ec]/10 flex items-center justify-center">
          <Icon size={16} weight="duotone" className="text-[#1392ec]" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function FieldRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function AdminSystemConfigPage() {
  const [config, setConfig] = useState<SystemConfig>(DEFAULTS);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // API call would go here: await configApi.save(config);
      await new Promise((r) => setTimeout(r, 600)); // Simulate API
      toast.success('Đã lưu cấu hình hệ thống');
    } catch {
      toast.error('Lưu thất bại, vui lòng thử lại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-[#1392ec]/10 text-[#1392ec] flex items-center justify-center">
            <GearIcon size={20} weight="duotone" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Cấu hình hệ thống</h1>
            <p className="text-xs text-slate-500 mt-0.5">Thiết lập thông số vận hành phòng khám</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-9 px-4 bg-[#1392ec] hover:bg-[#1180d0] text-white rounded-xl text-sm font-bold cursor-pointer"
        >
          <FloppyDiskIcon size={15} weight="bold" className="mr-1.5" />
          {saving ? 'Đang lưu…' : 'Lưu cấu hình'}
        </Button>
      </div>

      {/* Working Hours */}
      <SectionCard title="Giờ làm việc phòng khám" icon={ClockIcon}>
        <FieldRow label="Giờ mở cửa" description="Thời gian bắt đầu nhận bệnh nhân">
          <input
            type="time"
            value={config.clinicOpenTime}
            onChange={(e) => setConfig((p) => ({ ...p, clinicOpenTime: e.target.value }))}
            className="h-9 rounded-lg border border-slate-200 bg-white text-sm px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1392ec]/30 cursor-pointer"
          />
        </FieldRow>
        <FieldRow label="Giờ đóng cửa" description="Thời gian kết thúc nhận lịch hẹn">
          <input
            type="time"
            value={config.clinicCloseTime}
            onChange={(e) => setConfig((p) => ({ ...p, clinicCloseTime: e.target.value }))}
            className="h-9 rounded-lg border border-slate-200 bg-white text-sm px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1392ec]/30 cursor-pointer"
          />
        </FieldRow>
        <FieldRow
          label="Thời gian chờ tối đa (No-show)"
          description="Số phút chờ trước khi đánh dấu bệnh nhân vắng mặt"
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={5}
              max={120}
              value={config.noShowGraceMinutes}
              onChange={(e) => setConfig((p) => ({ ...p, noShowGraceMinutes: Number(e.target.value) }))}
              className="h-9 w-20 rounded-lg border border-slate-200 bg-white text-sm px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1392ec]/30 text-center"
            />
            <span className="text-sm text-slate-500">phút</span>
          </div>
        </FieldRow>
      </SectionCard>

      {/* Reminders */}
      <SectionCard title="Nhắc lịch hẹn tự động" icon={BellIcon}>
        <FieldRow label="Nhắc nhở trước 24 giờ" description="Gửi email cho bệnh nhân trước ngày hẹn 1 ngày">
          <button
            onClick={() => setConfig((p) => ({ ...p, reminderHours24: !p.reminderHours24 }))}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
              config.reminderHours24 ? 'bg-[#1392ec]' : 'bg-slate-200'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                config.reminderHours24 ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </button>
        </FieldRow>
        <FieldRow label="Nhắc nhở trước 1 giờ" description="Gửi email cho bệnh nhân trước giờ hẹn 1 tiếng">
          <button
            onClick={() => setConfig((p) => ({ ...p, reminderHours1: !p.reminderHours1 }))}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
              config.reminderHours1 ? 'bg-[#1392ec]' : 'bg-slate-200'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                config.reminderHours1 ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </button>
        </FieldRow>
      </SectionCard>
    </div>
  );
}
