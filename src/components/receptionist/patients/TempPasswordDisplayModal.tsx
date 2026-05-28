'use client';

import { useState } from 'react';
import { Copy, Check, Key, Mail, User, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface TempPasswordDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  tempPasswordData: {
    password?: string;
    fullName?: string;
    email?: string;
  } | null;
}

export function TempPasswordDisplayModal({
  isOpen,
  onClose,
  tempPasswordData
}: TempPasswordDisplayModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !tempPasswordData) return null;

  const { password = '', fullName = '', email = '' } = tempPasswordData;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast.success('Đã sao chép mật khẩu tạm thời!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error('Không thể sao chép tự động. Vui lòng chọn và sao chép thủ công.');
    }
  };

  const handleCopyAll = async () => {
    try {
      const textToCopy = `Họ tên: ${fullName}\nEmail đăng nhập: ${email}\nMật khẩu tạm thời: ${password}`;
      await navigator.clipboard.writeText(textToCopy);
      toast.success('Đã sao chép toàn bộ thông tin tài khoản!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl p-6 relative animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        {/* Decorative top bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 mt-2">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[17px] font-extrabold text-slate-900 leading-tight">
              Tài Khoản Kích Hoạt Thành Công!
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Vui lòng cung cấp thông tin này cho bệnh nhân
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3.5 mb-5">
          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Họ và tên</p>
              <p className="text-[13px] font-semibold text-slate-800 truncate">{fullName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email đăng nhập</p>
              <p className="text-[13px] font-semibold text-slate-800 truncate">{email}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Mật khẩu tạm thời</p>
                <p className="text-lg font-mono font-bold text-indigo-600 select-all tracking-wider">
                  {password}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className={`h-9 px-3 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all border cursor-pointer ${
                  copied 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                    : 'bg-white text-slate-700 hover:text-slate-900 border-slate-200 hover:border-slate-300 shadow-sm active:scale-95'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Đã chép
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Sao chép
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Security Warning Alert */}
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3.5 flex gap-3 mb-6">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11.5px] font-medium text-amber-800 leading-relaxed">
            Hệ thống đã gửi email hướng dẫn đăng nhập đến bệnh nhân. Mật khẩu này chỉ sử dụng cho <strong>lần đăng nhập đầu tiên</strong>, bệnh nhân bắt buộc phải đổi mật khẩu mới để bảo mật.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={handleCopyAll}
            className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[13px] font-bold transition-colors cursor-pointer active:scale-[0.99]"
          >
            Sao chép tất cả
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-extrabold shadow-lg shadow-blue-500/20 transition-all cursor-pointer active:scale-[0.99]"
          >
            Hoàn tất
          </button>
        </div>

      </div>
    </div>
  );
}
