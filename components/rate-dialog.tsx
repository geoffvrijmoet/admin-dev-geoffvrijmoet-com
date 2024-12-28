'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign } from "lucide-react";

interface RateDialogProps {
  rate: number;
  rateType: string;
  onSave: (data: { rate: number; rateType: string }) => Promise<void>;
}

export function RateDialog({ rate, rateType, onSave }: RateDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentRate, setCurrentRate] = useState(rate);
  const [currentRateType, setCurrentRateType] = useState(rateType);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({ rate: currentRate, rateType: currentRateType });
      setIsOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <DollarSign className="h-4 w-4" />
          ${rate}/hr ({rateType})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Rate</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Rate</label>
            <Input
              type="number"
              value={currentRate}
              onChange={(e) => setCurrentRate(parseFloat(e.target.value))}
              placeholder="Enter rate"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Rate Type</label>
            <Select value={currentRateType} onValueChange={setCurrentRateType}>
              <SelectTrigger>
                <SelectValue placeholder="Select rate type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="fixed">Fixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            className="w-full" 
            onClick={handleSave}
            disabled={isSaving}
          >
            Save Rate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 