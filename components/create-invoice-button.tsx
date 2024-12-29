'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TimeLog } from "@/lib/time-logs";
import { Plus, Check, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CreateInvoiceButtonProps {
  logs: TimeLog[];
}

interface GroupedTimeLog {
  client: string;
  project: string;
  logs: TimeLog[];
  totalHours: number;
  totalAmount: number;
}

function generateInvoiceNumber() {
  const prefix = 'INV';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}${random}`;
}

export function CreateInvoiceButton({ logs }: CreateInvoiceButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState<Record<string, boolean>>({});
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [date, setDate] = useState<Date>(new Date());

  // Generate invoice number when dialog opens
  useEffect(() => {
    if (open) {
      setInvoiceNumber(generateInvoiceNumber());
    }
  }, [open]);

  // Group unbilled logs by project
  const unbilledLogs = logs.filter(log => !log.invoiced);
  const groupedLogs = unbilledLogs.reduce((acc, log) => {
    const key = `${log.client}|||${log.project}`;
    if (!acc[key]) {
      acc[key] = {
        client: log.client,
        project: log.project,
        logs: [],
        totalHours: 0,
        totalAmount: 0
      };
    }
    acc[key].logs.push(log);
    acc[key].totalHours += log.hours;
    acc[key].totalAmount += log.hours * log.rate;
    return acc;
  }, {} as Record<string, GroupedTimeLog>);

  const handleCreateInvoice = async () => {
    const selectedLogIds = Object.entries(selectedLogs)
      .filter(([, isSelected]) => isSelected)
      .map(([logId]) => logId);

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: invoiceNumber,
          date: date.toISOString(),
          timeLogs: selectedLogIds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }

      setOpen(false);
      // Optionally refresh the page or update the invoice list
      window.location.reload();
    } catch (error) {
      console.error('Failed to create invoice:', error);
      // TODO: Show error message to user
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Create Invoice
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Invoice Number</label>
                <Input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="INV-001"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Invoice Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-4">
              {Object.values(groupedLogs).map((group) => (
                <Card key={`${group.client}|||${group.project}`} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{group.project}</h3>
                      <p className="text-sm text-muted-foreground">{group.client}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${group.totalAmount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {group.totalHours.toFixed(2)} hours
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {group.logs.map((log) => (
                      <div key={log._id?.toString()} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedLogs[log._id?.toString() ?? '']}
                            onCheckedChange={(checked) => 
                              setSelectedLogs(prev => ({
                                ...prev,
                                [log._id?.toString() ?? '']: checked === true
                              }))
                            }
                          />
                          <span>{new Date(log.startTime).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span>{log.hours.toFixed(2)} hrs</span>
                          <span>${(log.hours * log.rate).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            <Button 
              className="w-full" 
              onClick={handleCreateInvoice}
              disabled={!invoiceNumber || Object.values(selectedLogs).filter(Boolean).length === 0}
            >
              <Check className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 