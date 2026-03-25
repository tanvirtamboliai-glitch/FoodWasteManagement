import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../services/supabase";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KPICard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Utensils, Trash2, Calendar, TrendingUp, TrendingDown, Loader2, Percent } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";

export default function AdminDashboard() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [foodPrep, setFoodPrep] = useState<any[]>([]);
  const [waste, setWaste] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [attRes, prepRes, wasteRes] = await Promise.all([
        supabase.from("attendance").select("*").order("date", { ascending: true }),
        supabase.from("food_preparation").select("*").order("created_at", { ascending: true }),
        supabase.from("waste").select("*").order("created_at", { ascending: true })
      ]);

      setAttendance(attRes.data || []);
      setFoodPrep(prepRes.data || []);
      setWaste(wasteRes.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Attendance trends
  const attendanceChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    attendance.forEach((r) => {
      counts[r.date] = (counts[r.date] || 0) + 1;
    });
    return Object.entries(counts).map(([date, count]) => ({ date: date.slice(5), count }));
  }, [attendance]);

  // Waste trends
  const wasteChartData = useMemo(() => {
    return waste.map(w => ({
      date: new Date(w.created_at).toISOString().slice(5, 10),
      percent: Math.round(w.waste_percentage * 10) / 10
    }));
  }, [waste]);

  const totalPrepared = useMemo(() => foodPrep.reduce((sum, item) => sum + (item.prepared_quantity || 0), 0), [foodPrep]);
  const totalLeftover = useMemo(() => waste.reduce((sum, item) => sum + (item.leftover_quantity || 0), 0), [waste]);
  const avgWastePercent = totalPrepared > 0 ? Math.round((totalLeftover / totalPrepared) * 100) : 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-container space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">System-wide overview of meal consumption and waste efficiency</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium bg-muted/50 px-3 py-1.5 rounded-full border border-border">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Live System Monitoring
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard 
            title="Total Attendance" 
            value={attendance.length} 
            subtitle="Scans recorded" 
            icon={Users} 
          />
          <KPICard 
            title="Total Prepared" 
            value={`${totalPrepared}kg`} 
            subtitle="Food production" 
            icon={Utensils} 
          />
          <KPICard 
            title="Waste Metric" 
            value={`${avgWastePercent}%`} 
            subtitle="Avg. leftover per meal" 
            icon={Percent} 
            trend={{ value: 4, positive: avgWastePercent < 15 }} 
          />
          <KPICard 
            title="Resource Savvy" 
            value="High" 
            subtitle="Efficiency rating" 
            icon={TrendingDown} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Attendance Chart */}
          <Card className="border-none shadow-premium overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>Attendance Trends</CardTitle>
              </div>
              <CardDescription>Daily student meal consumption history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.1)" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Waste Chart */}
          <Card className="border-none shadow-premium overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" />
                <CardTitle>Waste Percentage</CardTitle>
              </div>
              <CardDescription>Leftover ratio per meal session over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={wasteChartData}>
                    <defs>
                      <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.1)" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} unit="%" />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                    <Area type="monotone" dataKey="percent" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorWaste)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}