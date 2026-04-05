'use client';

import { useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { User } from '@/types';

interface SuspendUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (user: User) => void;
  loading?: boolean;
}

export function SuspendUserDialog({
  user,
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: SuspendUserDialogProps) {
  const t = useTranslations('adminUsers');

  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {user.isActive 
              ? t('dialogs.suspendTitle') 
              : t('dialogs.reinstateTitle')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {user.isActive 
              ? t('dialogs.suspendDesc', { name: user.fullName || '' })
              : t('dialogs.reinstateDesc', { name: user.fullName || '' })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading} className='cursor-pointer'>
            {t('dialogs.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(user)}
            className={user.isActive ? "bg-amber-600 hover:bg-amber-700 cursor-pointer" : "bg-blue-600 hover:bg-blue-700 cursor-pointer"}
            disabled={loading}
          >
            {user.isActive ? t('table.actions.suspend') : t('table.actions.reinstate')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
