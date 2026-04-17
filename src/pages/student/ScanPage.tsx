import { DashboardLayout } from "@/components/layout/DashboardLayout";
import QRScanner from "@/components/qr/QRScanner";
import { isMealTime } from "@/constants";
import { AlertCircle, History, User } from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";
import { useAuthStore } from "@/store/authStore";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";

export default function ScanPage() {
  const { user } = useAuthStore();
  const mealActive = isMealTime();
  const { attendance, loadData } = useDashboardStore();

  useEffect(() => {
    if (user?.id) {
      loadData(user.id);
    }
  }, [user?.id, loadData]);

  // Get today's scans for the current user
  const today = new Date().toISOString().slice(0, 10);
  const recentScans = attendance
    .filter(a => a.date === today && a.studentId === user?.id)
    .slice(0, 5);

  return (
    <DashboardLayout>
      <div className="page-container max-w-2xl mx-auto space-y-8 pb-12">
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-tight">Scan QR Code</h1>
          <p className="text-muted-foreground">Scan the dining hall QR code to record your meal attendance</p>
        </div>

        <div className="space-y-6">
          {!mealActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl p-4 bg-warning/10 border border-warning/20 flex items-start gap-4"
            >
              <div className="p-2 bg-warning/20 rounded-full">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
              <div className="pt-1">
                <p className="text-sm font-semibold text-accent-foreground">No Active Meal Session</p>
                <p className="text-xs text-muted-foreground">Scanning is typically only available during meal times. (Demo: Always allowed)</p>
              </div>
            </motion.div>
          )}

          <QRScanner />

          <Card className="border-none shadow-premium overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Recent Scans
              </CardTitle>
              <Badge variant="secondary" className="rounded-full">Today</Badge>
            </CardHeader>
            <CardContent className="pt-4 p-0">
              {recentScans.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {recentScans.map((scan, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={scan.id}
                      className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium capitalize">{scan.mealType} Recorded</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(scan.scannedAt), "hh:mm a")}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20 capitalize px-3">
                        {scan.mealType}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-12 space-y-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto opacity-50">
                    <History className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No scans recorded today yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}



