import { LabOrder } from '@/lib/api/clinical/lab-orders';
import { SpecialistFindings } from '@/lib/types/specialist-findings.types';

export interface BaseFormProps {
  orderId: string;
  order: LabOrder;
  isCompleted: boolean;
  initialResultText: string;
  initialFileUrl: string;
  initialIsAbnormal: boolean;
  initialAbnormalNote: string;
  onSave: (data: { resultText?: string; findings?: SpecialistFindings; fileUrl?: string; isAbnormal: boolean; abnormalNote?: string }) => Promise<void>;
  isSubmitting: boolean;
}

export interface LabTestValue {
  name: string;
  value: string;
  unit: string;
  reference: string;
  evaluation?: 'normal' | 'high' | 'low';
}

export interface LabFindings {
  device?: string;
  results: LabTestValue[];
  generalComment?: string;
  isAbnormal: boolean;
  abnormalNote?: string;
}

export interface ImagingFinding {
  technique?: string;
  quality?: string;
  kvp?: number;
  mas?: number;
  readings: {
    label: string;
    finding: string;
    description?: string;
  }[];
  conclusion: string;
  recommendation?: string;
  abnormalNote?: string;
}

export interface EndoscopyFinding {
  scopeRange: string;
  preparation: string;
  esophagus: string;
  stomach: string;
  duodenum: string;
  cloTest: 'NOT_DONE' | 'NEGATIVE' | 'POSITIVE';
  biopsy: 'NONE' | 'DONE';
  lesionPosition?: string;
  lesionSize?: string;
  description: string;
  conclusion: string;
  followUpMonths?: string;
  abnormalNote?: string;
}

export interface EchoFinding {
  device?: string;
  probe?: string;
  organs: {
    label: string;
    finding: string;
    description?: string;
    measurements?: string;
  }[];
  description: string;
  conclusion: string;
  abnormalNote?: string;
}

export interface EcgFinding {
  heartRate?: number;
  prInterval?: number;
  qrsDuration?: number;
  qtcInterval?: number;
  axis?: string;
  rhythm?: string;
  stSegment?: string;
  pWave?: string;
  qWave?: string;
  description: string;
  conclusion: string;
  abnormalNote?: string;
}

export interface SpirometryFinding {
  device?: string;
  preBronchodilator: boolean;
  quality?: string;
  fvc: { value: number; percent: number };
  fev1: { value: number; percent: number };
  prefix?: string;
  fev1FvcRatio: number;
  pef?: number;
  fef2575?: number;
  mvv?: number;
  goldStage?: string;
  sabaTest?: string;
  description: string;
  conclusion: string;
  abnormalNote?: string;
}

export type FunctionalFinding = EcgFinding | SpirometryFinding;
