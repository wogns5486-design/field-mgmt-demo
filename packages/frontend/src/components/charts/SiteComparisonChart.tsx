import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: { name: string; worker_count: number; submission_count: number }[];
}

export function SiteComparisonChart({ data }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    name: d.name.length > 10 ? d.name.slice(0, 10) + '...' : d.name,
  }));

  return (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="font-semibold mb-4">현장별 비교</h3>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">데이터가 없습니다</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={formatted} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
            <Tooltip />
            <Bar dataKey="submission_count" name="제출 수" fill="hsl(221.2, 83.2%, 53.3%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
