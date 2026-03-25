import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MEAL_TYPES } from "@/constants";
import { submitWaste } from "@/services/api";
import { useDashboardStore } from "@/store/dashboardStore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { MealType } from "@/types";

export default function WasteEntryPage() {
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [prepared, setPrepared] = useState("");
  const [leftover, setLeftover] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { addWaste } = useDashboardStore();

  const wastePercent = prepared && leftover && Number(prepared) > 0
    ? Math.round((Number(leftover) / Number(prepared)) * 100 * 10) / 10
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const entry = await submitWaste({
        mealType,
        preparedQuantity: Number(prepared),
        leftoverQuantity: Number(leftover),
        notes: notes || undefined,
      });
      addWaste(entry);
      toast.success(`Waste entry recorded: ${wastePercent}%`);
      setPrepared("");
      setLeftover("");
      setNotes("");
    } catch {
      toast.error("Failed to submit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-container max-w-lg space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Waste Entry</h1>
          <p className="text-muted-foreground text-sm">Log food waste after each meal</p>
        </div>

        <form onSubmit={handleSubmit} className="kpi-card space-y-4">
          <div className="space-y-2">
            <Label>Meal Type</Label>
            <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MEAL_TYPES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prepared (kg)</Label>
              <Input type="number" min="1" placeholder="100" value={prepared} onChange={(e) => setPrepared(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Leftover (kg)</Label>
              <Input type="number" min="0" placeholder="15" value={leftover} onChange={(e) => setLeftover(e.target.value)} required />
            </div>
          </div>

          {/* Live waste calculation */}
          {wastePercent > 0 && (
            <div className={`rounded-lg p-3 text-center ${wastePercent > 15 ? "bg-destructive/10" : "bg-success/10"}`}>
              <p className="text-sm text-muted-foreground">Waste Percentage</p>
              <p className={`text-3xl font-display font-bold ${wastePercent > 15 ? "text-destructive" : "text-success"}`}>
                {wastePercent}%
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea placeholder="Any observations..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Waste Entry
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
