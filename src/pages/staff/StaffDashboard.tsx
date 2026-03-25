import { useEffect } from "react";
import { useDashboardStore } from "@/store/dashboardStore";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KPICard } from "@/components/ui/kpi-card";
import { ChefHat, Trash2, UtensilsCrossed, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function StaffDashboard() {
  const { waste, isLoading, loadData } = useDashboardStore();

  useEffect(() => { loadData(); }, [loadData]);

  const todayWaste = waste.filter((w) => w.date === new Date().toISOString().slice(0, 10));
  const avgWaste = todayWaste.length > 0
    ? Math.round(todayWaste.reduce((s, w) => s + w.wastePercentage, 0) / todayWaste.length * 10) / 10
    : 0;

  return (
    <DashboardLayout>
      <div className="page-container space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Staff Dashboard</h1>
          <p className="text-muted-foreground text-sm">Manage food preparation and waste tracking</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KPICard title="Today's Entries" value={todayWaste.length} subtitle="waste records" icon={Trash2} />
              <KPICard title="Avg Waste %" value={`${avgWaste}%`} subtitle="today" icon={UtensilsCrossed} trend={{ value: 5, positive: true }} />
              <KPICard title="Total Prepared" value={todayWaste.reduce((s, w) => s + w.preparedQuantity, 0)} subtitle="kg today" icon={ChefHat} />
            </div>

            <div className="flex gap-3">
              <Button asChild><Link to="/staff/food-prep"><ChefHat className="mr-2 h-4 w-4" /> Food Prep</Link></Button>
              <Button variant="outline" asChild><Link to="/staff/waste"><Trash2 className="mr-2 h-4 w-4" /> Log Waste</Link></Button>
            </div>

            <div className="kpi-card">
              <h3 className="font-display font-semibold mb-3">Today's Waste Entries</h3>
              {todayWaste.length === 0 ? (
                <p className="text-sm text-muted-foreground">No waste entries today.</p>
              ) : (
                <div className="space-y-2">
                  {todayWaste.map((w) => (
                    <div key={w.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium capitalize">{w.mealType}</p>
                        <p className="text-xs text-muted-foreground">{w.preparedQuantity}kg prepared, {w.leftoverQuantity}kg left</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${w.wastePercentage > 15 ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                        {w.wastePercentage}%
                      </span>
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
