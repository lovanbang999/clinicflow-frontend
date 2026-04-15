export interface GeneralFindings {
  status?: string;
  conclusion?: string;
}

export interface EyeFindings {
  vaRightNone?: string;
  vaLeftNone?: string;
  vaRightGlass?: string;
  vaLeftGlass?: string;
  iopRight?: string;
  iopLeft?: string;
  iopMethod?: 'non-contact' | 'goldmann' | string;
  fundusResult?: 'normal' | 'dr' | 'amd' | 'hemorrhage' | string;
  lens?: 'clear' | 'cataract1' | 'cataract3' | string;
  clinicalNote?: string;
  status?: string;
  conclusion?: string;
}

export interface DentalFindings {
  problemTeeth?: number[];
  clinicalNote?: string;
  gumStatus?: 'normal' | 'gingivitis1' | 'gingivitis2' | 'periodontitis' | string;
  hygiene?: 'good' | 'average' | 'poor' | string;
  status?: string;
  conclusion?: string;
}

export interface EntFindings {
  earRight_drum?: 'normal' | 'perforated' | 'opaque' | string;
  earRight_hearing?: 'normal' | 'mild' | 'severe' | string;
  nose_septum?: 'normal' | 'deviated' | string;
  nose_discharge?: 'none' | 'clear' | 'mucous' | 'bloody' | string;
  status?: string;
  conclusion?: string;
}

export interface CardiologyFindings {
  heartSounds?: 'normal' | 'murmur_systolic' | 'murmur_diastolic' | 'arrhythmic' | string;
  hr?: string;
  pulses?: 'normal' | 'weak' | string;
  edema?: 'none' | 'mild' | 'pitting' | string;
  ecgRhythm?: string;
  status?: string;
  conclusion?: string;
}

export interface DermatologyFindings {
  distribution?: string;
  lesionType?: 'macule' | 'papule' | 'plaque' | 'vesicle' | string;
  color?: string;
  status?: string;
  conclusion?: string;
}

export interface GynecologyFindings {
  cycle?: string;
  para?: string;
  vagina?: string;
  status?: string;
  conclusion?: string;
}

export interface OrthopedicsFindings {
  location?: string;
  vas?: number | string;
  rom?: string;
  status?: string;
  conclusion?: string;
}

export interface NeurologyFindings {
  gcs?: string;
  motor?: string;
  status?: string;
  conclusion?: string;
}

export interface GastroFindings {
  wall?: string;
  liver?: string;
  spleen?: string;
  endo?: string;
  status?: string;
  conclusion?: string;
}

export interface EndoFindings {
  hba1c?: string;
  glucose?: string;
  status?: string;
  conclusion?: string;
}

export interface UrologyFindings {
  voiding?: string;
  status?: string;
  conclusion?: string;
}

export interface RespFindings {
  rr?: string;
  lungs?: string;
  status?: string;
  conclusion?: string;
}

export type SpecialistFindings =
  | GeneralFindings
  | EyeFindings
  | DentalFindings
  | EntFindings
  | CardiologyFindings
  | DermatologyFindings
  | GynecologyFindings
  | OrthopedicsFindings
  | NeurologyFindings
  | GastroFindings
  | EndoFindings
  | UrologyFindings
  | RespFindings;
