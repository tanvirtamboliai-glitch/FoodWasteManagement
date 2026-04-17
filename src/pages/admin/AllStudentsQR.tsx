import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { supabase } from "@/services/supabase";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Search, RefreshCw, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type Student = {
  id: string;
  name: string | null;
  email: string;
  avatar_url?: string;
};

type StudentWithQR = Student & {
  qr: string;
};

export default function AllStudentsQR() {
  const [students, setStudents] = useState<StudentWithQR[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    setLoading(true);
    try {
      // Fetch users with 'student' role from students table
      const { data, error } = await supabase
        .from("students")
        .select("id, name, email, avatar_url")
        .eq("role", "student")
        .order("name", { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        setStudents([]);
        return;
      }

      // Generate QRs in parallel
      const qrData = await Promise.all(
        data.map(async (s) => ({
          ...s,
          qr: await QRCode.toDataURL(s.id, {
            width: 400,
            margin: 2,
            color: { dark: "#000000", light: "#ffffff" }
          }),
        }))
      );

      setStudents(qrData);
    } catch (error: any) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load student data");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="page-container space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Student Directory</h1>
            <p className="text-muted-foreground italic">Manage and download attendance QR codes for all students</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchStudents} 
            disabled={loading}
            className="w-fit gap-2 border-primary/20 hover:bg-primary/5 text-primary"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or ID..."
            className="pl-10 bg-card/50 backdrop-blur-sm border-border/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-medium">Generating student access tokens...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-border/50">
            <UserIcon className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No students found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredStudents.map((s, index) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-none shadow-premium bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
                    <CardHeader className="pb-4 border-b border-border/50">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] font-mono tracking-widest uppercase opacity-70">
                          {s.id.slice(0, 8)}
                        </Badge>
                        <UserIcon className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <CardTitle className="text-base font-bold truncate mt-2">{s.name || "Unknown Student"}</CardTitle>
                      <CardDescription className="text-xs truncate">{s.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 flex flex-col items-center space-y-4">
                      <div className="p-3 bg-white rounded-xl border border-border/20 shadow-inner group-hover:scale-105 transition-transform duration-300">
                        <img src={s.qr} alt={`QR for ${s.name}`} className="w-32 h-32" />
                      </div>
                      <Button variant="ghost" size="sm" asChild className="w-full text-xs gap-2 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <a href={s.qr} download={`${s.name || s.id}-qr.png`}>
                          <Download className="h-3.5 w-3.5" />
                          Download Token
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
