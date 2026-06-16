import { visitServiceOrdersApi, type VisitServiceOrder } from '@/lib/api/clinical/visit-service-orders';
import { labOrdersApi, LabOrder } from '@/lib/api/clinical/lab-orders';
import { useApiData } from '@/lib/hooks/core/useApiData';

export function useLabWorkspaceOrder(id: string, source: string) {
  const isVso = source === 'vso';

  const { data: order, isLoading, refetch: refetchOrder } = useApiData(async () => {
    if (isVso) {
      return await visitServiceOrdersApi.getDetail(id);
    } else {
      return await labOrdersApi.getOrderById(id);
    }
  }, null, [id, source]);

  const { data: siblingsResults, isLoading: isLoadingSiblings, refetch: refetchSiblings } = useApiData(async () => {
    if (!order) return [];
    if (isVso) {
      const all = await visitServiceOrdersApi.getWorklist();
      const currentOrder = order as VisitServiceOrder;
      return all.filter((o: VisitServiceOrder) => o.medicalRecordId === currentOrder.medicalRecordId);
    } else {
      const currentOrder = order as LabOrder;
      const all = await labOrdersApi.getOrdersByBooking(currentOrder.bookingId);
      return all;
    }
  }, [], [order?.id, source]);

  const normalizedOrder: LabOrder | null = order ? (isVso ? {
    id: (order as VisitServiceOrder).id,
    bookingId: (order as VisitServiceOrder).bookingId,
    testName: (order as VisitServiceOrder).service.name,
    status: (order as VisitServiceOrder).status as LabOrder['status'],
    orderedAt: (order as VisitServiceOrder).createdAt,
    result: (order as VisitServiceOrder).resultText ? {
      id: (order as VisitServiceOrder).id,
      resultText: (order as VisitServiceOrder).resultText!,
      resultFileUrl: (order as VisitServiceOrder).resultFileUrl || '',
      isAbnormal: (order as VisitServiceOrder).isAbnormal || false,
      abnormalNote: (order as VisitServiceOrder).abnormalNote || '',
      recordedBy: (order as VisitServiceOrder).performedBy || '',
      resultDate: (order as VisitServiceOrder).completedAt || (order as VisitServiceOrder).createdAt
    } : undefined,
    patientProfile: (order as VisitServiceOrder).medicalRecord?.booking?.patientProfile ? {
      fullName: (order as VisitServiceOrder).medicalRecord?.booking?.patientProfile?.fullName || '',
      patientCode: (order as VisitServiceOrder).medicalRecord?.booking?.patientProfile?.patientCode || '',
      gender: (order as VisitServiceOrder).medicalRecord?.booking?.patientProfile?.gender,
      dateOfBirth: (order as VisitServiceOrder).medicalRecord?.booking?.patientProfile?.dateOfBirth,
    } : undefined,
    booking: (order as VisitServiceOrder).medicalRecord?.booking ? {
      bookingCode: (order as VisitServiceOrder).medicalRecord?.booking?.bookingCode || '',
      doctor: { 
        fullName: (order as VisitServiceOrder).medicalRecord?.booking?.doctor?.fullName || '',
        specialties: (order as VisitServiceOrder).medicalRecord?.booking?.doctor?.doctorProfile?.specialties as string[] || []
      }
    } : undefined,
    medicalRecord: (order as VisitServiceOrder).medicalRecord ? {
      bloodPressure: (order as VisitServiceOrder).medicalRecord?.bloodPressure,
      heartRate: (order as VisitServiceOrder).medicalRecord?.heartRate,
      temperature: (order as VisitServiceOrder).medicalRecord?.temperature ? Number((order as VisitServiceOrder).medicalRecord?.temperature) : null,
      spO2: (order as VisitServiceOrder).medicalRecord?.spO2,
      weightKg: (order as VisitServiceOrder).medicalRecord?.weightKg ? Number((order as VisitServiceOrder).medicalRecord?.weightKg) : null,
      heightCm: (order as VisitServiceOrder).medicalRecord?.heightCm ? Number((order as VisitServiceOrder).medicalRecord?.heightCm) : null,
      bmi: (order as VisitServiceOrder).medicalRecord?.bmi ? Number((order as VisitServiceOrder).medicalRecord?.bmi) : null,
      chiefComplaint: (order as VisitServiceOrder).medicalRecord?.chiefComplaint,
      clinicalFindings: (order as VisitServiceOrder).medicalRecord?.clinicalFindings,
      doctorNotes: (order as VisitServiceOrder).medicalRecord?.doctorNotes,
      allergies: (order as VisitServiceOrder).medicalRecord?.allergies,
      diagnosisName: (order as VisitServiceOrder).medicalRecord?.diagnosisName,
    } : undefined,
    service: (order as VisitServiceOrder).service as LabOrder['service'],
  } : (order as LabOrder)) : null;

  const normalizedSiblings: (LabOrder & { _source: 'vso' | 'lab' })[] = (siblingsResults || []).map((s) => {
    const isSiblingVso = 'medicalRecord' in s;
    if (isSiblingVso) {
      const vso = s as VisitServiceOrder;
      return {
        id: vso.id,
        bookingId: vso.bookingId,
        testName: vso.service.name,
        status: vso.status as LabOrder['status'],
        orderedAt: vso.createdAt,
        patientProfile: vso.medicalRecord?.booking?.patientProfile ? {
          fullName: vso.medicalRecord.booking.patientProfile.fullName || '',
          patientCode: vso.medicalRecord.booking.patientProfile.patientCode || '',
          gender: vso.medicalRecord.booking.patientProfile.gender,
          dateOfBirth: vso.medicalRecord.booking.patientProfile.dateOfBirth,
        } : undefined,
        service: vso.service as LabOrder['service'],
        _source: 'vso' as const
      };
    } else {
      return { ...(s as LabOrder), _source: 'lab' as const };
    }
  });

  const getLabFormType = () => {
    if (!order) return 'GENERAL';
    if (isVso) {
      const v = order as VisitServiceOrder;
      return (v.service as { labFormType?: string }).labFormType || 'GENERAL';
    } else {
      const l = order as LabOrder;
      return l.service?.labFormType || ((l.service as { category?: string })?.category === 'IMAGING' ? 'IMAGING' : 'BLOOD_LAB');
    }
  };

  return {
    order: normalizedOrder,
    siblings: normalizedSiblings,
    isLoading: isLoading || isLoadingSiblings,
    labFormType: getLabFormType(),
    isVso,
    refetch: () => { void refetchOrder(); void refetchSiblings(); }
  };
}
