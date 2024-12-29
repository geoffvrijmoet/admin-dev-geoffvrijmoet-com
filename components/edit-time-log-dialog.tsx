'use client';

import { useState } from "react";
import { TimeLog } from "@/lib/time-logs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface EditTimeLogDialogProps {
  log: TimeLog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (log: TimeLog) => Promise<void>;
}

export function EditTimeLogDialog({ log, open, onOpenChange, onSave }: EditTimeLogDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    client: log.client,
    project: log.project,
    rate: log.rate,
    hours: Math.floor(log.hours),
    minutes: Math.floor((log.hours % 1) * 60),
    seconds: Math.floor((((log.hours % 1) * 60) % 1) * 60)
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const totalHours = 
        formData.hours + 
        (formData.minutes / 60) + 
        (formData.seconds / 3600);

      await onSave({
        ...log,
        client: formData.client,
        project: formData.project,
        rate: formData.rate,
        hours: totalHours
      });
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Time Log</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Client Name</label>
            <Input
              value={formData.client}
              onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Name</label>
            <Input
              value={formData.project}
              onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Rate ($/hr)</label>
            <Input
              type="number"
              value={formData.rate}
              onChange={(e) => setFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Hours</label>
              <Input
                type="number"
                value={formData.hours}
                onChange={(e) => setFormData(prev => ({ ...prev, hours: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Minutes</label>
              <Input
                type="number"
                min="0"
                max="59"
                value={formData.minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, minutes: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Seconds</label>
              <Input
                type="number"
                min="0"
                max="59"
                value={formData.seconds}
                onChange={(e) => setFormData(prev => ({ ...prev, seconds: parseInt(e.target.value) }))}
              />
            </div>
          </div>
          <Button 
            className="w-full" 
            onClick={handleSave}
            disabled={isLoading}
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 