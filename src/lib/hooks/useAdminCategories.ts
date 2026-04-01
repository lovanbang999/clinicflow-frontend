'use client';

import { useState, useCallback } from 'react';
import { categoriesApi } from '@/lib/api/categories';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types';
import { useApiHandler } from './useApiHandler';

export const useAdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { execute, isLoading } = useApiHandler();

  const fetchCategories = useCallback(async (filters?: { isActive?: boolean }) => {
    const data = await execute(
      () => categoriesApi.getAll(filters),
      { errorFallbackMsg: 'Failed to fetch categories' }
    );
    if (data) {
      setCategories(data);
    }
  }, [execute]);

  const createCategory = async (dto: CreateCategoryDto) => {
    return execute(
      () => categoriesApi.create(dto),
      {
        onSuccessMsg: 'Category created successfully',
        errorFallbackMsg: 'Failed to create category'
      }
    );
  };

  const updateCategory = async (id: string, dto: UpdateCategoryDto) => {
    return execute(
      () => categoriesApi.update(id, dto),
      {
        onSuccessMsg: 'Category updated successfully',
        errorFallbackMsg: 'Failed to update category'
      }
    );
  };

  const deleteCategory = async (id: string) => {
    return execute(
      () => categoriesApi.delete(id),
      {
        onSuccessMsg: 'Category deleted successfully',
        errorFallbackMsg: 'Failed to delete category'
      }
    );
  };

  return {
    categories,
    isLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
