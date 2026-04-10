'use client';

import { BaseNotificationPage } from '@/components/notifications/BaseNotificationPage';

export default function DoctorNotificationsPage() {
  return <BaseNotificationPage role="DOCTOR" dashboardPath="/doctor" />;
}
