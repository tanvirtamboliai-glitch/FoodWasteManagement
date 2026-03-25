import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface AttendanceChartProps {
  data: { date: string; count: number }[];
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  return (
    <div className="kpi-card">
      <h3 className="font-display font-semibold mb-4">Daily Attendance</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(140 15% 89%)" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(160 10% 45%)" />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(160 10% 45%)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(0 0% 100%)",
              border: "1px solid hsl(140 15% 89%)",
              borderRadius: "8px",
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="hsl(152 55% 36%)"
            strokeWidth={2}
            dot={{ fill: "hsl(152 55% 36%)", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface WasteChartProps {
  data: { date: string; wastePercent: number }[];
}

export function WasteChart({ data }: WasteChartProps) {
  return (
    <div className="kpi-card">
      <h3 className="font-display font-semibold mb-4">Waste Trends (%)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(140 15% 89%)" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(160 10% 45%)" />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(160 10% 45%)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(0 0% 100%)",
              border: "1px solid hsl(140 15% 89%)",
              borderRadius: "8px",
              fontSize: 12,
            }}
          />
          <Bar dataKey="wastePercent" fill="hsl(38 90% 55%)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
