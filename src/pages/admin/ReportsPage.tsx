import { useEffect } from "react";
import { useDashboardStore } from "@/store/dashboardStore";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loader2 } from "lucide-react";

export default function ReportsPage() {
  const { reports, isLoading, loadData } = useDashboardStore();

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <DashboardLayout>
      <div className="page-container space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground text-sm">Detailed daily reports overview</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="kpi-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Attendance</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Expected</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Prepared (kg)</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Leftover (kg)</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Waste %</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.date} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium">{r.date}</td>
                      <td className="py-3 px-4">{r.totalAttendance}</td>
                      <td className="py-3 px-4 text-muted-foreground">{r.expectedAttendance}</td>
                      <td className="py-3 px-4">{r.totalPrepared}</td>
                      <td className="py-3 px-4">{r.totalLeftover}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.wastePercentage > 15 ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                          {r.wastePercentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
