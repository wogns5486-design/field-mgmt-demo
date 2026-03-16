import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: { date: string; count: number }[];
}

export function DailySubmissionsChart({ data }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    date: d.date.slice(5), // "MM-DD" format
  }));

  return (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="font-semibold mb-4">일별 제출 추이</h3>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">데이터가 없습니다</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="count"
              name="제출 수"
              stroke="hsl(221.2, 83.2%, 53.3%)"
              fill="hsl(221.2, 83.2%, 53.3%)"
              fillOpacity={0.1}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
