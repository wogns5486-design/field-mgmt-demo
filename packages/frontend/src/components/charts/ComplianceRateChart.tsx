import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  data: { name: string; rate: number; total: number }[];
}

function getColor(rate: number): string {
  if (rate >= 90) return '#22c55e';
  if (rate >= 70) return '#eab308';
  return '#ef4444';
}

export function ComplianceRateChart({ data }: Props) {
  const formatted = data
    .filter((d) => d.total > 0)
    .map((d) => ({
      ...d,
      name: d.name.length > 10 ? d.name.slice(0, 10) + '...' : d.name,
    }));

  return (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="font-semibold mb-4">안전점검 준수율</h3>
      {formatted.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">데이터가 없습니다</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={formatted} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
            <Tooltip formatter={(value: number) => [`${value}%`, '준수율']} />
            <Bar dataKey="rate" name="준수율" radius={[0, 4, 4, 0]}>
              {formatted.map((entry, index) => (
                <Cell key={index} fill={getColor(entry.rate)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
