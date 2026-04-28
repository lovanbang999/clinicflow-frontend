'use client';

import { BaseNotificationPage } from '@/components/notifications/BaseNotificationPage';

export default function AdminNotificationsPage() {
  return <BaseNotificationPage role="ADMIN" dashboardPath="/admin" />;
}
