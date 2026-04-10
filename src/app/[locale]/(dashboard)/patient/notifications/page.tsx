'use client';

import { BaseNotificationPage } from '@/components/notifications/BaseNotificationPage';

export default function PatientNotificationsPage() {
  return <BaseNotificationPage role="PATIENT" dashboardPath="/patient" />;
}
