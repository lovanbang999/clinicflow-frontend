'use client';

import { useState, useCallback } from 'react';

export interface TicketItem {
  serviceName: string;
  roomName: string;
  queueNumber: string | number;
  suggestedOrder?: number;
  preparationNotes?: string;
  type: 'CONSULTATION' | 'LAB';
}

export interface TicketData {
  patientName: string;
  patientCode: string;
  doctorName?: string;
  items: TicketItem[];
  date: Date;
  estimatedDuration?: number;
  completedBefore?: string;
}

export function useTicketPrint() {
  const [activeTicket, setActiveTicket] = useState<TicketData | null>(null);

  const printTicket = useCallback((ticket: TicketData) => {
    setActiveTicket(ticket);
    // Use timeout to allow React to render the printable content before printing
    setTimeout(() => {
      window.print();
    }, 100);
  }, []);

  const printInvoice = useCallback(() => {
    setActiveTicket(null); // Ensure ticket is hidden if we want to print invoice
    setTimeout(() => {
      window.print();
    }, 100);
  }, []);

  return {
    activeTicket,
    printTicket,
    printInvoice,
  };
}
