'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PlusIcon,
  PencilSimpleIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  CaretLeftIcon,
  CaretRightIcon
} from '@phosphor-icons/react';
import { useAdminCategories } from '@/lib/hooks/admin/useAdminCategories';
import { useTranslations } from 'next-intl';
import type { Category, CreateCategoryDto } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';

export function CategoriesTab() {
  const t = useTranslations('adminCategories');
  
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const { 
    categories, 
    pagination, 
    isLoading, 
    fetchCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory 
  } = useAdminCategories();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateCategoryDto>({
    code: '',
    name: '',
    description: '',
    isActive: true,
  });

  const LIMIT = 10;

  useEffect(() => {
    fetchCategories({ page, limit: LIMIT });
  }, [fetchCategories, page]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({ code: '', name: '', description: '', isActive: true });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      code: category.code,
      name: category.name,
      description: category.description || '',
      isActive: category.isActive,
    });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let success = false;
    if (editingCategory) {
      success = !!(await updateCategory(editingCategory.id, formData));
    } else {
      success = !!(await createCategory(formData));
    }
    
    if (success) {
      setIsFormOpen(false);
      fetchCategories({ page, limit: LIMIT });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    await deleteCategory(deletingCategory.id);
    setIsDeleteOpen(false);
    fetchCategories({ page, limit: LIMIT });
  };

  const from = categories.length > 0 ? (page - 1) * LIMIT + 1 : 0;
  const to = pagination ? Math.min(page * LIMIT, pagination.total) : 0;

  const filteredCategories = categories.filter((cat) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      cat.name.toLowerCase().includes(s) ||
      cat.code.toLowerCase().includes(s) ||
      (cat.description && cat.description.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t('title')}</h2>
          <p className="text-slate-500 text-sm mt-1">{t('description')}</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-[#1392ec] hover:bg-[#1392ec]/90 text-white rounded-xl cursor-pointer">
          <PlusIcon className="w-5 h-5 mr-2" />
          {t('addCategory')}
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input 
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-[#1392ec]/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#64748b] bg-[#f8fafc] uppercase border-b border-[#e5e7eb]">
              <tr>
                <th className="px-6 py-4 font-semibold">{t('table.code')}</th>
                <th className="px-6 py-4 font-semibold">{t('table.name')}</th>
                <th className="px-6 py-4 font-semibold">{t('table.description')}</th>
                <th className="px-6 py-4 font-semibold">{t('table.isActive')}</th>
                <th className="px-6 py-4 font-semibold text-right">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {isLoading && categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    <Spinner className="w-6 h-6 mx-auto mb-2 text-[#1392ec]" />
                    {t('tableState.loading')}
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    {t('tableState.empty')}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{cat.code}</td>
                    <td className="px-6 py-4 text-slate-900 font-medium">{cat.name}</td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{cat.description || '-'}</td>
                    <td className="px-6 py-4">
                      {cat.isActive ? (
                        <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                          <CheckCircleIcon weight="fill" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          <XCircleIcon weight="fill" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(cat)}
                        className="text-[#1392ec] hover:text-[#1392ec] hover:bg-[#1392ec]/10 rounded-lg px-2 cursor-pointer"
                      >
                        <PencilSimpleIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDelete(cat)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg px-2 cursor-pointer"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-[#e5e7eb] flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            {t('pagination.showing')}{' '}
            <span className="text-slate-900 font-bold">{categories.length > 0 ? `${from}–${to}` : '0'}</span>{' '}
            {t('pagination.of')}{' '}
            <span className="text-slate-900 font-bold">{pagination?.total || 0}</span>{' '}
            {t('pagination.results')}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <CaretLeftIcon size={12} weight="bold" />
              {t('pagination.prev')}
            </button>
            <button
              disabled={!pagination || page >= pagination.totalPages}
              onClick={() => setPage(p => Math.min(pagination?.totalPages || 1, p + 1))}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {t('pagination.next')}
              <CaretRightIcon size={12} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="w-full sm:max-w-[500px] p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              {editingCategory ? t('form.editTitle') : t('form.addTitle')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                  {t('form.code')}
                </Label>
                <Input
                  id="code"
                  placeholder={t('form.codePlaceholder')}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  className="rounded-xl border-slate-200 focus-visible:ring-[#1392ec]/20 h-10 bg-slate-50"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                  {t('form.name')}
                </Label>
                <Input
                  id="name"
                  placeholder={t('form.namePlaceholder')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="rounded-xl border-slate-200 focus-visible:ring-[#1392ec]/20 h-10 bg-slate-50"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                  {t('form.description')}
                </Label>
                <Textarea
                  id="description"
                  placeholder={t('form.descriptionPlaceholder')}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="rounded-xl border-slate-200 focus-visible:ring-[#1392ec]/20 min-h-[100px] resize-none bg-slate-50"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <Label htmlFor="isActive" className="text-sm font-semibold text-slate-800 cursor-pointer block">
                    {t('form.isActive')}
                  </Label>
                  <p className="text-[11px] text-[#64748b] mt-0.5">{t('form.isActiveHint')}</p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="rounded-xl px-5 h-10 cursor-pointer">
                {t('form.cancel')}
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-[#1392ec] hover:bg-[#1392ec]/90 text-white rounded-xl px-7 h-10 font-semibold cursor-pointer">
                {isLoading ? <Spinner className="w-4 h-4 mr-2" /> : null}
                {t('form.save')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold text-slate-900">{t('deleteModal.title')}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              {t('deleteModal.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl cursor-pointer">{t('deleteModal.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl cursor-pointer"
            >
              {t('deleteModal.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
