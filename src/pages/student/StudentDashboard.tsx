import { useEffect } from "react";
import { useDashboardStore } from "@/store/dashboardStore";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KPICard } from "@/components/ui/kpi-card";
import { QrCode, ClipboardList, UtensilsCrossed, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { attendance, isLoading, loadData } = useDashboardStore();

  useEffect(() => { loadData(); }, [loadData]);

  const myAttendance = attendance.filter((a) => a.studentId === "s1");
  const todayCount = myAttendance.filter((a) => a.date === new Date().toISOString().slice(0, 10)).length;

  return (
    <DashboardLayout>
      <div className="page-container space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Welcome, {user?.name} 👋</h1>
          <p className="text-muted-foreground text-sm">Your meal tracking overview</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KPICard title="Today's Meals" value={todayCount} subtitle="scanned" icon={UtensilsCrossed} />
              <KPICard title="This Week" value={myAttendance.length} subtitle="total meals" icon={ClipboardList} />
              <KPICard title="Streak" value="5 days" subtitle="consecutive" icon={QrCode} trend={{ value: 12, positive: true }} />
            </div>

            <div className="flex gap-3">
              <Button asChild>
                <Link to="/student/scan">
                  <QrCode className="mr-2 h-4 w-4" /> Scan Meal QR
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/student/history">View History</Link>
              </Button>
            </div>

            {/* Recent scans */}
            <div className="kpi-card">
              <h3 className="font-display font-semibold mb-3">Recent Scans</h3>
              {myAttendance.slice(0, 5).length === 0 ? (
                <p className="text-sm text-muted-foreground">No scans yet. Start by scanning a QR code!</p>
              ) : (
                <div className="space-y-2">
                  {myAttendance.slice(0, 5).map((a) => (
                    <div key={a.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium capitalize">{a.mealType}</p>
                        <p className="text-xs text-muted-foreground">{a.date}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success font-medium">✓ Recorded</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
