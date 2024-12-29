'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { InsertOneResult } from 'mongodb';
import { TimeLog } from '@/lib/time-logs';

interface AddTimeLogProps {
  onAddLog: (data: {
    client: string;
    project: string;
    hours: number;
    startTime: string;
    endTime: string;
    description?: string;
  }) => Promise<{ success: boolean; data: InsertOneResult<TimeLog> }>;
}

export function AddTimeLog({ onAddLog }: AddTimeLogProps) {
  const [open, setOpen] = useState(false);
  const [client, setClient] = useState("");
  const [project, setProject] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    const totalHours = hours + (minutes / 60) + (seconds / 3600);
    const startTime = new Date(date);
    const endTime = new Date(date);
    endTime.setHours(endTime.getHours() + hours);
    endTime.setMinutes(endTime.getMinutes() + minutes);
    endTime.setSeconds(endTime.getSeconds() + seconds);

    await onAddLog({
      client,
      project,
      hours: totalHours,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      description
    });

    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setClient("");
    setProject("");
    setDate(new Date());
    setHours(0);
    setMinutes(0);
    setSeconds(0);
    setDescription("");
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Time Log
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Time Log</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Client Name</label>
              <Input
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Enter client name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name</label>
              <Input
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="Enter project name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Hours</label>
                <Input
                  type="number"
                  min="0"
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Minutes</label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Seconds</label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description (optional)</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What did you work on?"
              />
            </div>

            <Button 
              className="w-full" 
              onClick={handleSubmit}
              disabled={!client || !project || (hours === 0 && minutes === 0 && seconds === 0)}
            >
              Add Time Log
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 