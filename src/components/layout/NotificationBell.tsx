'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIconColor = (type: string) => {
    switch (type) {
      case 'BOOKING_CONFIRMED': return 'bg-green-100 text-green-600';
      case 'BOOKING_REMINDER': return 'bg-blue-100 text-blue-600';
      case 'BOOKING_CANCELLED': return 'bg-red-100 text-red-600';
      case 'LAB_RESULT': return 'bg-purple-100 text-purple-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
      >
        <Bell className="w-6 h-6 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 lg:w-96 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 z-50 overflow-hidden flex flex-col max-h-[32rem]">
          <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-800">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  void markAllAsRead();
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
                title="Đánh dấu tất cả đã đọc"
              >
                <Check className="w-3.5 h-3.5" />
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1 overscroll-contain">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-slate-500 text-sm">Bạn chưa có thông báo nào</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => !notif.isRead && markAsRead(notif.id)}
                    className={`w-full text-left p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 flex gap-3 ${
                      !notif.isRead ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getIconColor(notif.type)}`}>
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className={`text-sm truncate pr-2 ${!notif.isRead ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0 mt-0.5">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: vi })}
                        </span>
                      </div>
                      <p className={`text-xs line-clamp-2 ${!notif.isRead ? 'text-slate-700' : 'text-slate-500'}`}>
                        {notif.body}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <button className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors">
                Xem tất cả
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
