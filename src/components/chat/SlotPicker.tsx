"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { Clock, Calendar, User, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Slot {
  slotId: string;
  doctorId: string;
  doctorName: string;
  specialties?: string[];
  date: string;
  startTime: string;
  endTime: string;
  roomName: string;
}

interface SlotPickerProps {
  slots: Slot[];
  onSelectSlot: (slot: Slot) => void;
  isLoading?: boolean;
}

export function SlotPicker({ slots, onSelectSlot }: SlotPickerProps) {
  const t = useTranslations('chat');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!slots || slots.length === 0) {
    return <div className="text-sm text-muted-foreground italic">{t('noSlots')}</div>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 mt-2">
      {slots.map((slot) => {
        const isSelected = selectedId === slot.slotId;
        
        return (
          <Card 
            key={slot.slotId}
            className={cn(
              "cursor-pointer transition-all hover:border-primary/50 relative overflow-hidden",
              isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : ""
            )}
            onClick={() => {
              setSelectedId(slot.slotId);
              onSelectSlot(slot);
            }}
          >
            {isSelected && (
              <div className="absolute top-2 right-2 text-primary">
                <CheckCircle className="h-4 w-4" />
              </div>
            )}
            <CardContent className="p-3">
              <div className="flex flex-col gap-1.5 text-sm">
                <div className="font-medium flex items-center pr-6">
                  <User className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  {slot.doctorName}
                </div>
                
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  <span>{slot.date}</span>
                </div>
                
                <div className="flex items-center text-primary font-medium">
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  <span>{slot.startTime} - {slot.endTime}</span>
                  <span className="text-muted-foreground font-normal ml-auto text-xs border rounded px-1.5 py-0.5">
                    {slot.roomName}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
