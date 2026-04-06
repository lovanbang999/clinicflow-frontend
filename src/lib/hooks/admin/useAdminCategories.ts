'use client';

import { useState, useCallback } from 'react';
import { categoriesApi } from '@/lib/api/clinic/categories';
import type { Category, CreateCategoryDto, UpdateCategoryDto, PaginationMeta } from '@/types';
import { useApiHandler } from '@/lib/hooks/core/useApiHandler';

export const useAdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>();
  const { execute, isLoading } = useApiHandler();

  const fetchCategories = useCallback(async (filters?: { isActive?: boolean; page?: number; limit?: number }) => {
    const data = await execute(
      () => categoriesApi.getAll(filters),
      { errorFallbackMsg: 'fetchCategoriesError' }
    );
    if (data) {
      setCategories(data.items);
      setPagination(data.pagination);
    }
  }, [execute]);

  const createCategory = async (dto: CreateCategoryDto) => {
    return execute(
      () => categoriesApi.create(dto),
      {
        onSuccessMsg: 'createCategorySuccess',
        errorFallbackMsg: 'createCategoryError'
      }
    );
  };

  const updateCategory = async (id: string, dto: UpdateCategoryDto) => {
    return execute(
      () => categoriesApi.update(id, dto),
      {
        onSuccessMsg: 'updateCategorySuccess',
        errorFallbackMsg: 'updateCategoryError'
      }
    );
  };

  const deleteCategory = async (id: string) => {
    return execute(
      () => categoriesApi.delete(id),
      {
        onSuccessMsg: 'deleteCategorySuccess',
        errorFallbackMsg: 'deleteCategoryError'
      }
    );
  };

  return {
    categories,
    pagination,
    isLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
