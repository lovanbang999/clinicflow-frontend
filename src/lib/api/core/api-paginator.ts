export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationData;
}

/**
 * Universal adapter to parse paginated response from SmartClinic Backend.
 */
export function adaptPaginatedResponse<T>(
  data: unknown,
  fallbackKey: string
): PaginatedResult<T> {
  if (data && typeof data === 'object') {
    const rawData = data as Record<string, unknown>;

    // If backend returns the standard { items, total, page, limit }
    if ('items' in rawData && Array.isArray(rawData.items)) {
      const total = (rawData.total as number) ?? 0;
      const limit = (rawData.limit as number) ?? 10;
      return {
        items: rawData.items as T[],
        pagination: {
          total,
          page: (rawData.page as number) ?? 1,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    // Fallback to legacy structure { [fallbackKey]: [...], pagination }
    if (fallbackKey in rawData && Array.isArray(rawData[fallbackKey])) {
      const items = rawData[fallbackKey] as T[];
      const pagination = (rawData.pagination as Record<string, number>) || {};
      const total = pagination.total ?? items.length;
      const limit = pagination.limit ?? 10;
      return {
        items,
        pagination: {
          total,
          page: pagination.page ?? 1,
          limit,
          totalPages: pagination.totalPages ?? Math.ceil(total / limit),
        },
      };
    }
  }

  // Fallback if data itself is an array
  if (Array.isArray(data)) {
    return {
      items: data as T[],
      pagination: {
        total: data.length,
        page: 1,
        limit: data.length || 10,
        totalPages: 1,
      },
    };
  }

  return {
    items: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
  };
}
