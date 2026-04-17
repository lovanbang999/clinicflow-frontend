'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  type SpecialistFindings,
  type GeneralFindings,
  type EyeFindings,
  type DentalFindings,
  type EntFindings,
  type CardiologyFindings,
  type DermatologyFindings,
  type GynecologyFindings,
  type OrthopedicsFindings,
  type NeurologyFindings,
  type GastroFindings,
  type EndoFindings,
  type UrologyFindings,
  type RespFindings
} from '@/lib/types/specialist-findings.types';

import { 
  Section, 
  FormGroup, 
  Input, 
  Select, 
  TextArea, 
  QuickSuggestions, 
  NumericStepper, 
  ChoiceGrid 
} from '../shared/ExamHelpers';

// --- SPECIALTY FORMS ---

interface BaseFormProps<T> {
  value: T;
  onChange: (val: T) => void;
}

// 1. GENERAL / OTHERS
const GeneralForm: React.FC<BaseFormProps<GeneralFindings>> = ({ value, onChange }) => {
  const t = useTranslations('emr.visit.specialist.forms.GENERAL');
  const ts = useTranslations('emr.visit.specialist.forms.shared');

  const update = <K extends keyof GeneralFindings>(field: K, val: GeneralFindings[K]) => 
    onChange({ ...value, [field]: val });

  return (
    <div className="space-y-4">
      <Section title={t('title')}>
        <FormGroup label={t('status')}>
          <TextArea 
            rows={4}
            value={value.status || ''}
            onChange={(e) => update('status', e.target.value)}
            placeholder={t('statusPlaceholder')}
          />
        </FormGroup>
      </Section>

      <Section title={ts('conclusion')} dotColor="bg-teal-500">
        <FormGroup label={ts('conclusion')}>
          <TextArea 
            rows={2}
            value={value.conclusion || ''}
            onChange={(e) => update('conclusion', e.target.value)}
            placeholder={ts('conclusionPlaceholder')}
          />
          <QuickSuggestions 
            suggestions={['Bình thường', 'Ổn định', 'Cần theo dõi thêm', 'Chuyển tuyến']} 
            onSelect={(s) => update('conclusion', s)}
          />
        </FormGroup>
      </Section>
    </div>
  );
};

// 2. EYE (OPHTHALMOLOGY)
const EyeForm: React.FC<BaseFormProps<EyeFindings>> = ({ value, onChange }) => {
  const t = useTranslations('emr.visit.specialist.forms.EYE');
  const ts = useTranslations('emr.visit.specialist.forms.shared');

  const update = <K extends keyof EyeFindings>(field: K, val: EyeFindings[K]) => 
    onChange({ ...value, [field]: val });

  return (
    <div className="space-y-4">
      <Section title={t('visualAcuity')}>
        <div className="grid grid-cols-2 gap-4">
          <FormGroup label={t('vaRightNone')}>
            <Input value={value.vaRightNone || ''} onChange={(e) => update('vaRightNone', e.target.value)} placeholder="VD: 8/10" />
            <QuickSuggestions suggestions={['10/10', '9/10', '8/10', '7/10', '5/10', 'ST', 'BBT']} onSelect={(s) => update('vaRightNone', s)} />
          </FormGroup>
          <FormGroup label={t('vaLeftNone')}>
            <Input value={value.vaLeftNone || ''} onChange={(e) => update('vaLeftNone', e.target.value)} placeholder="VD: 7/10" />
            <QuickSuggestions suggestions={['10/10', '9/10', '8/10', '7/10', '5/10', 'ST', 'BBT']} onSelect={(s) => update('vaLeftNone', s)} />
          </FormGroup>
          <FormGroup label={t('vaRightGlass')}>
            <Input value={value.vaRightGlass || ''} onChange={(e) => update('vaRightGlass', e.target.value)} placeholder="VD: 10/10" />
            <QuickSuggestions suggestions={['10/10', '9/10', '8/10']} onSelect={(s) => update('vaRightGlass', s)} />
          </FormGroup>
          <FormGroup label={t('vaLeftGlass')}>
            <Input value={value.vaLeftGlass || ''} onChange={(e) => update('vaLeftGlass', e.target.value)} placeholder="VD: 10/10" />
            <QuickSuggestions suggestions={['10/10', '9/10', '8/10']} onSelect={(s) => update('vaLeftGlass', s)} />
          </FormGroup>
        </div>
      </Section>

      <Section title={t('iop')} dotColor="bg-teal-500">
        <div className="grid grid-cols-3 gap-4">
           <FormGroup label={t('iopRight')}>
             <Input value={value.iopRight || ''} onChange={(e) => update('iopRight', e.target.value)} placeholder="mmHg" />
             <QuickSuggestions suggestions={['14', '16', '18', '21']} onSelect={(s) => update('iopRight', s)} />
           </FormGroup>
           <FormGroup label={t('iopLeft')}>
             <Input value={value.iopLeft || ''} onChange={(e) => update('iopLeft', e.target.value)} placeholder="mmHg" />
             <QuickSuggestions suggestions={['14', '16', '18', '21']} onSelect={(s) => update('iopLeft', s)} />
           </FormGroup>
           <FormGroup label={t('iopMethod')}>
              <Select value={value.iopMethod || ''} onChange={(e) => update('iopMethod', e.target.value)}>
                 <option value="">-- Select --</option>
                 <option value="non-contact">Non-contact</option>
                 <option value="goldmann">Goldmann</option>
              </Select>
           </FormGroup>
        </div>
      </Section>

      <Section title={t('fundus')} dotColor="bg-purple-500">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormGroup label={t('fundusResult')}>
            <Select value={value.fundusResult || ''} onChange={(e) => update('fundusResult', e.target.value)}>
              <option value="">-- Select --</option>
              <option value="normal">Normal</option>
              <option value="dr">Retinopathy (DR)</option>
              <option value="amd">AMD</option>
              <option value="hemorrhage">Hemorrhage</option>
            </Select>
          </FormGroup>
          <FormGroup label={t('lens')}>
            <Select value={value.lens || ''} onChange={(e) => update('lens', e.target.value)}>
              <option value="">-- Select --</option>
              <option value="clear">Clear</option>
              <option value="cataract1">Cataract Grade 1-2</option>
              <option value="cataract3">Cataract Grade 3-4</option>
            </Select>
          </FormGroup>
        </div>
        <FormGroup label={ts('clinicalDescription')}>
          <TextArea value={value.clinicalNote || ''} onChange={(e) => update('clinicalNote', e.target.value)} placeholder={ts('clinicalPlaceholder')} />
        </FormGroup>
      </Section>
    </div>
  );
};

// 3. DENTAL
const DentalForm: React.FC<BaseFormProps<DentalFindings>> = ({ value, onChange }) => {
  const t = useTranslations('emr.visit.specialist.forms.DENTAL');
  const ts = useTranslations('emr.visit.specialist.forms.shared');
  const update = <K extends keyof DentalFindings>(field: K, val: DentalFindings[K]) => 
    onChange({ ...value, [field]: val });

  const teeth = Array.from({ length: 32 }, (_, i) => i + 1); // Mock 32 teeth
  const toggleTooth = (num: number) => {
    const current = value.problemTeeth || [];
    const next = current.includes(num) ? current.filter((n: number) => n !== num) : [...current, num];
    update('problemTeeth', next);
  };

  return (
    <div className="space-y-4">
      <Section title={t('toothChart')}>
        <div className="grid grid-cols-8 gap-2 mb-4">
          {teeth.map(n => (
            <div 
              key={n} 
              onClick={() => toggleTooth(n)}
              className={`p-2 border rounded-md text-center cursor-pointer text-[11px] font-bold transition-all ${
                value.problemTeeth?.includes(n) ? 'bg-blue-100 border-blue-500 text-blue-800 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {n}
            </div>
          ))}
        </div>
        <FormGroup label={ts('clinicalDescription')}>
          <TextArea value={value.clinicalNote || ''} onChange={(e) => update('clinicalNote', e.target.value)} placeholder="VD: R36 sâu ngà độ II..." />
        </FormGroup>
      </Section>

      <Section title={t('gumStatus')} dotColor="bg-teal-500">
         <div className="grid grid-cols-1 gap-6">
            <FormGroup label={t('gumStatus')}>
              <ChoiceGrid 
                currentValue={value.gumStatus}
                onSelect={(val) => update('gumStatus', val)}
                options={[
                  { value: 'normal', label: 'Bình thường' },
                  { value: 'gingivitis1', label: 'Viêm lợi nhẹ', color: 'bg-amber-50 border-amber-500 text-amber-700' },
                  { value: 'gingivitis2', label: 'Viêm lợi nặng', color: 'bg-red-50 border-red-500 text-red-700' },
                  { value: 'periodontitis', label: 'Viêm quanh răng', color: 'bg-red-100 border-red-600 text-red-800' },
                ]}
              />
            </FormGroup>
            <FormGroup label={t('oralHygiene')}>
               <ChoiceGrid 
                currentValue={value.hygiene}
                onSelect={(val) => update('hygiene', val)}
                options={[
                  { value: 'good', label: 'Tốt' },
                  { value: 'average', label: 'Trung bình', color: 'bg-slate-50 border-slate-400 text-slate-700' },
                  { value: 'poor', label: 'Kém', color: 'bg-amber-50 border-amber-400 text-amber-800' },
                ]}
              />
            </FormGroup>
         </div>
      </Section>
    </div>
  );
};

// 4. ENT
const ENTForm: React.FC<BaseFormProps<EntFindings>> = ({ value, onChange }) => {
  const t = useTranslations('emr.visit.specialist.forms.ENT');
  const update = <K extends keyof EntFindings>(field: K, val: EntFindings[K]) => 
    onChange({ ...value, [field]: val });

  return (
    <div className="space-y-4">
      <Section title={t('earRight')}>
        <div className="grid grid-cols-2 gap-4">
           <FormGroup label={t('eardrum')}>
              <Select value={value.earRight_drum || ''} onChange={(e) => update('earRight_drum', e.target.value)}>
                <option value="normal">Normal</option>
                <option value="perforated">Perforated</option>
                <option value="opaque">Opaque</option>
              </Select>
           </FormGroup>
           <FormGroup label={t('hearing')}>
              <Select value={value.earRight_hearing || ''} onChange={(e) => update('earRight_hearing', e.target.value)}>
                <option value="normal">Normal</option>
                <option value="mild">Mild Loss</option>
                <option value="severe">Severe Loss</option>
              </Select>
           </FormGroup>
        </div>
      </Section>
      <Section title={t('nose')} dotColor="bg-teal-500">
        <div className="grid grid-cols-2 gap-4">
           <FormGroup label={t('septum')}>
              <Select value={value.nose_septum || ''} onChange={(e) => update('nose_septum', e.target.value)}>
                <option value="normal">Normal</option>
                <option value="deviated">Deviated</option>
              </Select>
           </FormGroup>
           <FormGroup label={t('discharge')}>
              <Select value={value.nose_discharge || ''} onChange={(e) => update('nose_discharge', e.target.value)}>
                <option value="none">None</option>
                <option value="clear">Clear</option>
                <option value="mucous">Mucous</option>
                <option value="bloody">Bloody</option>
              </Select>
           </FormGroup>
        </div>
      </Section>
    </div>
  );
};

// 5. CARDIOLOGY
const CardiologyForm: React.FC<BaseFormProps<CardiologyFindings>> = ({ value, onChange }) => {
  const t = useTranslations('emr.visit.specialist.forms.CARDIOLOGY');
  const update = <K extends keyof CardiologyFindings>(field: K, val: CardiologyFindings[K]) => 
    onChange({ ...value, [field]: val });

  return (
    <div className="space-y-4">
      <Section title={t('clinical')}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormGroup label={t('heartSounds')}>
             <Select value={value.heartSounds || ''} onChange={(e) => update('heartSounds', e.target.value)}>
                <option value="normal">Normal S1, S2</option>
                <option value="murmur_systolic">Systolic Murmur</option>
                <option value="murmur_diastolic">Diastolic Murmur</option>
                <option value="arrhythmic">Arrhythmic</option>
             </Select>
             <QuickSuggestions suggestions={['T1, T2 đều, rõ', 'Tiếng thổi tâm thu', 'Tiếng thổi tâm trương']} onSelect={(s) => update('heartSounds', s)} />
          </FormGroup>
          <FormGroup label={t('heartRate')}>
             <NumericStepper value={value.hr || '80'} onChange={(val) => update('hr', val)} />
             <label className="text-[10px] text-slate-400 mt-1">bpm</label>
          </FormGroup>
        </div>
        <div className="grid grid-cols-2 gap-4">
           <FormGroup label={t('pulses')}>
              <ChoiceGrid 
                currentValue={value.pulses}
                onSelect={(val) => update('pulses', val)}
                options={[
                  { value: 'normal', label: 'Bình thường' },
                  { value: 'weak', label: 'Yếu', color: 'bg-amber-50 border-amber-500 text-amber-700' },
                ]}
              />
           </FormGroup>
           <FormGroup label={t('edema')}>
              <ChoiceGrid 
                currentValue={value.edema}
                onSelect={(val) => update('edema', val)}
                options={[
                  { value: 'none', label: 'Không phù' },
                  { value: 'mild', label: 'Phù nhẹ', color: 'bg-amber-50 border-amber-500 text-amber-800' },
                  { value: 'pitting', label: 'Phù ấn lõm', color: 'bg-red-50 border-red-500 text-red-800' },
                ]}
              />
           </FormGroup>
        </div>
      </Section>
      <Section title={t('ecg')} dotColor="bg-coral-500">
         <FormGroup label={t('rhythm')}><Input value={value.ecgRhythm || ''} onChange={(e) => update('ecgRhythm', e.target.value)} /></FormGroup>
      </Section>
    </div>
  );
};

// 6. DERMATOLOGY
const DermatologyForm: React.FC<BaseFormProps<DermatologyFindings>> = ({ value, onChange }) => {
  const t = useTranslations('emr.visit.specialist.forms.DERMATOLOGY');
  const update = <K extends keyof DermatologyFindings>(field: K, val: DermatologyFindings[K]) => 
    onChange({ ...value, [field]: val });

  return (
    <div className="space-y-4">
      <Section title={t('distribution')}>
        <TextArea value={value.distribution || ''} onChange={(e) => update('distribution', e.target.value)} placeholder="VD: Head, face, right arm..." />
      </Section>
      <Section title={t('lesionType')} dotColor="bg-pink-500">
        <div className="grid grid-cols-1 gap-6">
           <FormGroup label={t('lesionType')}>
              <ChoiceGrid 
                currentValue={value.lesionType}
                onSelect={(val) => update('lesionType', val)}
                options={[
                  { value: 'macule', label: 'Dát' },
                  { value: 'papule', label: 'Sẩn' },
                  { value: 'plaque', label: 'Mảng' },
                  { value: 'vesicle', label: 'Mụn nước' },
                ]}
              />
           </FormGroup>
           <FormGroup label={t('lesionColor')}>
              <Input value={value.color || ''} onChange={(e) => update('color', e.target.value)} />
              <QuickSuggestions suggestions={['Hồng ban', 'Thâm', 'Trắng', 'Đỏ']} onSelect={(s) => update('color', s)} />
           </FormGroup>
        </div>
      </Section>
    </div>
  );
};

// 7. GYNECOLOGY
const GynecologyForm: React.FC<BaseFormProps<GynecologyFindings>> = ({ value, onChange }) => {
  const t = useTranslations('emr.visit.specialist.forms.GYNECOLOGY');
  const update = <K extends keyof GynecologyFindings>(field: K, val: GynecologyFindings[K]) => 
    onChange({ ...value, [field]: val });

  return (
    <div className="space-y-4">
      <Section title={t('history')}>
        <div className="grid grid-cols-2 gap-4">
           <FormGroup label={t('cycle')}><Input value={value.cycle || ''} onChange={(e) => update('cycle', e.target.value)} /></FormGroup>
           <FormGroup label={t('para')}><Input value={value.para || ''} onChange={(e) => update('para', e.target.value)} /></FormGroup>
        </div>
      </Section>
      <Section title={t('exam')} dotColor="bg-blue-500">
        <FormGroup label={t('vagina')}><TextArea value={value.vagina || ''} onChange={(e) => update('vagina', e.target.value)} /></FormGroup>
      </Section>
    </div>
  );
};

// 8. ORTHOPEDICS
const OrthopedicsForm: React.FC<BaseFormProps<OrthopedicsFindings>> = ({ value, onChange }) => {
  const t = useTranslations('emr.visit.specialist.forms.ORTHOPEDICS');
  const update = <K extends keyof OrthopedicsFindings>(field: K, val: OrthopedicsFindings[K]) => 
    onChange({ ...value, [field]: val });

  return (
    <div className="space-y-4">
      <Section title={t('pain')}>
        <div className="grid grid-cols-2 gap-4 items-end">
           <FormGroup label={t('location')}>
              <Input value={value.location || ''} onChange={(e) => update('location', e.target.value)} />
              <QuickSuggestions suggestions={['Khớp gối', 'Cột sống thắt lưng', 'Cổ tay', 'Vai']} onSelect={(s) => update('location', s)} />
           </FormGroup>
           <FormGroup label={t('vas')}>
              <div className="flex flex-col gap-2">
                 <NumericStepper value={value.vas || '0'} onChange={(val) => update('vas', val)} min={0} />
                 <label className="text-[10px] text-slate-400">VAS (0-10)</label>
              </div>
           </FormGroup>
        </div>
      </Section>
      <Section title={t('mobility')} dotColor="bg-teal-500">
        <FormGroup label={t('rom')}><TextArea value={value.rom || ''} onChange={(e) => update('rom', e.target.value)} /></FormGroup>
      </Section>
    </div>
  );
};

// 9. NEUROLOGY
const NeurologyForm: React.FC<BaseFormProps<NeurologyFindings>> = ({ value, onChange }) => {
  const t = useTranslations('emr.visit.specialist.forms.NEUROLOGY');
  const update = <K extends keyof NeurologyFindings>(field: K, val: NeurologyFindings[K]) => 
    onChange({ ...value, [field]: val });

  return (
    <div className="space-y-4">
      <Section title={t('consciousness')}>
        <FormGroup label={t('gcs')}><Input value={value.gcs || ''} onChange={(e) => update('gcs', e.target.value)} /></FormGroup>
      </Section>
      <Section title={t('motor')}>
        <FormGroup label={t('limbsMotor')}><TextArea value={value.motor || ''} onChange={(e) => update('motor', e.target.value)} /></FormGroup>
      </Section>
    </div>
  );
};

// 10. GASTROENTEROLOGY
const GastroForm: React.FC<BaseFormProps<GastroFindings>> = ({ value, onChange }) => {
  const t = useTranslations('emr.visit.specialist.forms.GASTROENTEROLOGY');
  const update = <K extends keyof GastroFindings>(field: K, val: GastroFindings[K]) => 
    onChange({ ...value, [field]: val });

  return (
    <div className="space-y-4">
      <Section title={t('abdominal')}>
        <div className="grid grid-cols-1 gap-6">
           <FormGroup label={t('wall')}>
              <ChoiceGrid 
                currentValue={value.wall}
                onSelect={(val) => update('wall', val)}
                options={[
                  { value: 'soft', label: 'Bụng mềm' },
                  { value: 'distended', label: 'Bụng chướng', color: 'bg-amber-50 border-amber-500 text-amber-800' },
                  { value: 'tender', label: 'Ấn đau', color: 'bg-red-50 border-red-500 text-red-800' },
                ]}
              />
           </FormGroup>
           <div className="grid grid-cols-2 gap-4">
              <FormGroup label={t('liver')}>
                <Input value={value.liver || ''} onChange={(e) => update('liver', e.target.value)} />
                <QuickSuggestions suggestions={['Không sờ thấy', 'Dưới bờ sườn 1cm', 'Dưới bờ sườn 2cm']} onSelect={(s) => update('liver', s)} />
              </FormGroup>
              <FormGroup label={t('spleen')}>
                <Input value={value.spleen || ''} onChange={(e) => update('spleen', e.target.value)} />
                <QuickSuggestions suggestions={['Không sờ thấy', 'Độ I', 'Độ II']} onSelect={(s) => update('spleen', s)} />
              </FormGroup>
           </div>
        </div>
      </Section>
      <Section title={t('endoscopy')} dotColor="bg-teal-500">
        <FormGroup label={t('endoResult')}><TextArea value={value.endo || ''} onChange={(e) => update('endo', e.target.value)} /></FormGroup>
      </Section>
    </div>
  );
};

// 11. ENDOCRINOLOGY
const EndoForm: React.FC<BaseFormProps<EndoFindings>> = ({ value, onChange }) => {
  const t = useTranslations('emr.visit.specialist.forms.ENDOCRINOLOGY');
  const update = <K extends keyof EndoFindings>(field: K, val: EndoFindings[K]) => 
    onChange({ ...value, [field]: val });

  return (
    <div className="space-y-4">
      <Section title={t('diabetes')}>
        <div className="grid grid-cols-2 gap-4">
           <FormGroup label={t('hba1c')}><Input value={value.hba1c || ''} onChange={(e) => update('hba1c', e.target.value)} /></FormGroup>
           <FormGroup label={t('glucoseFasting')}><Input value={value.glucose || ''} onChange={(e) => update('glucose', e.target.value)} /></FormGroup>
        </div>
      </Section>
    </div>
  );
};

// 12. UROLOGY
const UrologyForm: React.FC<BaseFormProps<UrologyFindings>> = ({ value, onChange }) => {
  const t = useTranslations('emr.visit.specialist.forms.UROLOGY');
  const update = <K extends keyof UrologyFindings>(field: K, val: UrologyFindings[K]) => 
    onChange({ ...value, [field]: val });

  return (
    <div className="space-y-4">
      <Section title={t('symptoms')}>
        <FormGroup label={t('voiding')}><TextArea value={value.voiding || ''} onChange={(e) => update('voiding', e.target.value)} /></FormGroup>
      </Section>
    </div>
  );
};

// 13. RESPIRATORY
const RespForm: React.FC<BaseFormProps<RespFindings>> = ({ value, onChange }) => {
  const t = useTranslations('emr.visit.specialist.forms.RESPIRATORY');
  const update = <K extends keyof RespFindings>(field: K, val: RespFindings[K]) => 
    onChange({ ...value, [field]: val });

  return (
    <div className="space-y-4">
      <Section title={t('clinical')}>
        <div className="grid grid-cols-1 gap-6">
           <FormGroup label={t('respRate')}>
              <NumericStepper value={value.rr || '16'} onChange={(val) => update('rr', val)} />
              <label className="text-[10px] text-slate-400 mt-1">lần/phút</label>
           </FormGroup>
           <FormGroup label={t('auscultation')}>
              <ChoiceGrid 
                currentValue={value.lungs}
                onSelect={(val) => update('lungs', val)}
                options={[
                  { value: 'clear', label: 'Rì rào phế nang êm dịu' },
                  { value: 'crackles', label: 'Có ran ẩm/ran nổ', color: 'bg-amber-50 border-amber-500 text-amber-800' },
                  { value: 'wheezing', label: 'Có ran rít/ran ngáy', color: 'bg-red-50 border-red-500 text-red-800' },
                ]}
              />
              <TextArea 
                className="mt-2"
                value={value.lungs || ''} 
                onChange={(e) => update('lungs', e.target.value)} 
                placeholder="Mô tả thêm..."
              />
           </FormGroup>
        </div>
      </Section>
    </div>
  );
};

// --- MAIN MAPPING ---

// Using a type-safe mapping for specialty forms
// We use a cast to SpecialistForm to handle the variance between specific findings types and the general SpecialistFindings union.
type SpecialistForm = React.FC<BaseFormProps<SpecialistFindings>>;

const formMap: Record<string, SpecialistForm> = {
  GENERAL: GeneralForm as unknown as SpecialistForm,
  EYE: EyeForm as unknown as SpecialistForm,
  DENTAL: DentalForm as unknown as SpecialistForm,
  ENT: ENTForm as unknown as SpecialistForm,
  CARDIOLOGY: CardiologyForm as unknown as SpecialistForm,
  DERMATOLOGY: DermatologyForm as unknown as SpecialistForm,
  GYNECOLOGY: GynecologyForm as unknown as SpecialistForm,
  ORTHOPEDICS: OrthopedicsForm as unknown as SpecialistForm,
  NEUROLOGY: NeurologyForm as unknown as SpecialistForm,
  GASTROENTEROLOGY: GastroForm as unknown as SpecialistForm,
  ENDOCRINOLOGY: EndoForm as unknown as SpecialistForm,
  UROLOGY: UrologyForm as unknown as SpecialistForm,
  RESPIRATORY: RespForm as unknown as SpecialistForm,
};

// --- EXPORTED COMPONENT ---

interface ExaminationExtendedFieldsProps {
  examFormType: string;
  initialValue?: SpecialistFindings;
  onChange?: (findings: SpecialistFindings) => void;
}

export function ExaminationExtendedFields({ 
  examFormType, 
  initialValue = {}, 
  onChange 
}: ExaminationExtendedFieldsProps) {
  const [findings, setFindings] = useState<SpecialistFindings>(initialValue);

  // Sync state if initialValue changes (e.g., when switching between service orders)
  useEffect(() => {
    setFindings(initialValue);
  }, [initialValue]);

  const handleFindingsChange = (newFindings: SpecialistFindings) => {
    setFindings(newFindings);
    if (onChange) {
      onChange(newFindings);
    }
  };

  const Component = formMap[examFormType] || GeneralForm;

  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
      <Component value={findings} onChange={handleFindingsChange} />
    </div>
  );
}
