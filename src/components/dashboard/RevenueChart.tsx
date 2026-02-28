'use client';

import { Card } from '@/components/ui/card';
import { RevenueDataPoint } from '@/types/dashboard';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface RevenueChartProps {
  title: string;
  data: RevenueDataPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: RevenueDataPoint;
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const date = new Date(data.date);
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    const formattedRevenue = new Intl.NumberFormat('vi-VN').format(
      data.revenue
    );

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-xs text-gray-600 mb-1">{formattedDate}</p>
        <p className="text-sm font-semibold text-blue-600">
          {formattedRevenue}đ
        </p>
      </div>
    );
  }
  return null;
};

export function RevenueChart({ title, data }: RevenueChartProps) {
  if (data.length === 0) {
    return (
      <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          {title}
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-400 bg-linear-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <div>No data available</div>
          </div>
        </div>
      </Card>
    );
  }

  const formatXAxis = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const formatYAxis = (value: number) => {
    return `${(value / 1000000).toFixed(1)}M`;
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-300 bg-linear-to-br from-white to-blue-50">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        {title}
      </h3>
      <div className="relative bg-white rounded-lg p-4 shadow-inner">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatYAxis}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{
                fill: '#3b82f6',
                strokeWidth: 2,
                r: 4,
                stroke: '#ffffff',
              }}
              activeDot={{
                r: 6,
                fill: '#2563eb',
                stroke: '#ffffff',
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
