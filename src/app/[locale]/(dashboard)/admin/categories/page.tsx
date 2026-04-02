'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { PlusIcon, PencilSimpleIcon, TrashIcon, CheckCircleIcon, XCircleIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';

import { useAdminCategories } from '@/lib/hooks/useAdminCategories';
import type { Category, CreateCategoryDto } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';

export default function AdminCategoriesPage() {
  const t = useTranslations('dashboard.admin.categoryManagement');
  const { categories, isLoading, fetchCategories, createCategory, updateCategory, deleteCategory } = useAdminCategories();
  
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateCategoryDto>({
    code: '',
    name: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = useMemo(() => {
    if (!search) return categories;
    const lowerSearch = search.toLowerCase();
    return categories.filter(c => 
      c.name.toLowerCase().includes(lowerSearch) || 
      c.code.toLowerCase().includes(lowerSearch)
    );
  }, [categories, search]);

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
      fetchCategories();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    await deleteCategory(deletingCategory.id);
    // success will be undefined if error occurs based on useApiHandler signature unless we return a boolean, but execute returns result.
    // Wait, useApiHandler.execute returns the data or undefined.
    // The delete API returns void, so it might return undefined on both success and error.
    // Let's just fetchCategories() anyway and close modal.
    setIsDeleteOpen(false);
    fetchCategories();
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111518]">{t('title')}</h1>
          <p className="text-[#64748b] text-sm mt-1">{t('description')}</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-[#1392ec] hover:bg-[#1392ec]/90 text-white rounded-xl">
          <PlusIcon className="w-5 h-5 mr-2" />
          {t('addCategory')}
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-[#e5e7eb]">
        <div className="relative w-full max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input 
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
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
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <Spinner className="w-6 h-6 mx-auto mb-2" />
                    Đang tải...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-6 py-4 font-medium text-[#111518]">{cat.code}</td>
                    <td className="px-6 py-4 text-[#111518]">{cat.name}</td>
                    <td className="px-6 py-4 text-[#64748b] max-w-xs truncate">{cat.description || '-'}</td>
                    <td className="px-6 py-4">
                      {cat.isActive ? (
                        <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium bg-[#1392ec]/10 text-[#1392ec]">
                          <CheckCircleIcon weight="fill" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                          <XCircleIcon weight="fill" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(cat)}
                        className="text-[#1392ec] hover:text-[#1392ec] hover:bg-[#1392ec]/10 rounded-lg px-2"
                      >
                        <PencilSimpleIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDelete(cat)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg px-2"
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
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingCategory ? t('form.editTitle') : t('form.addTitle')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-sm font-semibold text-[#111518]">
                  {t('form.code')}
                </Label>
                <Input
                  id="code"
                  placeholder={t('form.codePlaceholder')}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  className="rounded-xl border-[#e5e7eb] focus:border-[#1392ec] focus:ring-[#1392ec]/10 h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-semibold text-[#111518]">
                  {t('form.name')}
                </Label>
                <Input
                  id="name"
                  placeholder={t('form.namePlaceholder')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="rounded-xl border-[#e5e7eb] focus:border-[#1392ec] focus:ring-[#1392ec]/10 h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-sm font-semibold text-[#111518]">
                  {t('form.description')}
                </Label>
                <Textarea
                  id="description"
                  placeholder={t('form.descriptionPlaceholder')}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="rounded-xl border-[#e5e7eb] focus:border-[#1392ec] focus:ring-[#1392ec]/10 min-h-[100px] resize-none"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-xl border border-[#e5e7eb]">
                <div>
                  <Label htmlFor="isActive" className="text-sm font-semibold text-[#111518] cursor-pointer block">
                    {t('form.isActive')}
                  </Label>
                  <p className="text-[11px] text-[#64748b] mt-0.5">Bật để danh mục này hiển thị khi quản lý dịch vụ</p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </div>
            <div className="pt-2 flex justify-end gap-3 border-t border-[#e5e7eb] pt-6">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="rounded-xl px-6 h-11">
                {t('form.cancel')}
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-[#1392ec] hover:bg-[#1392ec]/90 text-white rounded-xl px-8 h-11 font-semibold">
                {isLoading ? <Spinner className="w-4 h-4 mr-2" /> : null}
                {t('form.save')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteModal.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteModal.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">{t('deleteModal.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
            >
              {t('deleteModal.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
