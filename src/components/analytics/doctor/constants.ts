export type Period = '7d' | 'month' | '6m' | 'year';

export const PERIODS: { label: string; value: Period }[] = [
  { label: '7 ngày', value: '7d' },
  { label: 'Tháng này', value: 'month' },
  { label: '6 tháng', value: '6m' },
  { label: 'Năm nay', value: 'year' },
];

export const COLORS = {
  BLUE: '#185FA5',
  TEAL: '#0F6E56',
  AMBER: '#BA7517',
  RED_CLR: '#E24B4A',
  GREEN: '#1D9E75',
  PURPLE: '#534AB7',
  CORAL: '#993C1D',
  GRAY: '#B4B2A9',
};

export const DIAG_COLORS = [COLORS.BLUE, '#0EA5E9', COLORS.TEAL, COLORS.PURPLE, COLORS.CORAL];

export const STATUS_META: Record<string, { label: string; color: string }> = {
  COMPLETED:   { label: 'Hoàn thành', color: COLORS.GREEN  },
  CANCELLED:   { label: 'Đã huỷ',     color: COLORS.AMBER  },
  NO_SHOW:     { label: 'Vắng mặt',   color: COLORS.RED_CLR },
  IN_PROGRESS: { label: 'Đang khám',  color: COLORS.BLUE   },
  CHECKED_IN:  { label: 'Đã đến',     color: COLORS.TEAL   },
  PENDING:     { label: 'Chờ',        color: COLORS.AMBER  },
};
