import { useEffect } from "react";
import { useDashboardStore } from "@/store/dashboardStore";
import { useAuthStore } from "@/store/authStore";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loader2 } from "lucide-react";

export default function HistoryPage() {
  const { user } = useAuthStore();
  const { attendance, isLoading, loadData } = useDashboardStore();

  useEffect(() => { 
    if (user?.id) {
      loadData(user.id); 
    }
  }, [loadData, user?.id]);

  const myAttendance = attendance;

  return (
    <DashboardLayout>
      <div className="page-container space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Attendance History</h1>
          <p className="text-muted-foreground text-sm">Your complete meal attendance record</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="kpi-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Meal</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Time</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myAttendance.map((a) => (
                    <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">{a.date}</td>
                      <td className="py-3 px-4 capitalize">{a.mealType}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(a.scannedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success font-medium">Present</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {myAttendance.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">No attendance records found.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
