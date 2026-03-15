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

interface DeleteUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string) => void;
  loading?: boolean;
}

export function DeleteUserDialog({
  user,
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: DeleteUserDialogProps) {
  const t = useTranslations('dashboard.admin.userManagement');

  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('dialogs.deleteTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('dialogs.deleteDesc', { name: user.fullName || '' })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading} className='cursor-pointer'>{t('dialogs.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(user.id)}
            className="bg-red-600 hover:bg-red-700 cursor-pointer"
            disabled={loading}
          >
            {t('table.actions.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
