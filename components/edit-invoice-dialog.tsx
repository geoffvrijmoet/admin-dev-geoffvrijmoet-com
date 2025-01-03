'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Invoice } from "@/lib/invoices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { TimeLog } from "@/lib/time-logs";
import { Checkbox } from "@/components/ui/checkbox";

interface EditInvoiceDialogProps {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Invoice>) => Promise<void>;
}

export function EditInvoiceDialog({ invoice, open, onOpenChange, onSave }: EditInvoiceDialogProps) {
  const [date, setDate] = useState<string>(new Date(invoice.date).toISOString().split('T')[0]);
  const [status, setStatus] = useState(invoice.status);
  const [number, setNumber] = useState(invoice.number);
  const [client, setClient] = useState(invoice.client);
  const [rateType, setRateType] = useState<'hourly' | 'fixed'>(invoice.rateType || 'hourly');
  const [items, setItems] = useState(invoice.items);
  const [rate, setRate] = useState(invoice.items[0]?.rate ?? 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableLogs, setAvailableLogs] = useState<TimeLog[]>([]);
  const [selectedLogIds, setSelectedLogIds] = useState<Set<string>>(
    new Set(invoice.timeLogs.map(id => id.toString()))
  );

  useEffect(() => {
    async function fetchLogs() {
      try {
        const response = await fetch(`/api/invoices/${invoice._id}/time-logs`);
        if (!response.ok) throw new Error('Failed to fetch time logs');
        const data = await response.json();
        setAvailableLogs(data.logs);
      } catch (error) {
        console.error('Error fetching time logs:', error);
      }
    }
    fetchLogs();
  }, [invoice._id]);

  const handleLogToggle = (logId: string, isSelected: boolean) => {
    const newSelectedLogs = new Set(selectedLogIds);
    if (isSelected) {
      newSelectedLogs.add(logId);
    } else {
      newSelectedLogs.delete(logId);
    }
    setSelectedLogIds(newSelectedLogs);
    
    // Update items based on selected logs
    const selectedLogs = availableLogs.filter(log => log._id && newSelectedLogs.has(log._id.toString()));
    const newItems = groupLogsByProject(selectedLogs);
    setItems(newItems);
  };

  const groupLogsByProject = (logs: TimeLog[]) => {
    const groups = logs.reduce((acc, log) => {
      const key = log.project;
      if (!acc[key]) {
        acc[key] = {
          project: log.project,
          description: `Time logged for ${log.project}`,
          hours: 0,
          rate: rate,
          amount: 0
        };
      }
      acc[key].hours += log.hours;
      acc[key].amount += log.hours * rate;
      return acc;
    }, {} as Record<string, typeof items[0]>);

    return Object.values(groups);
  };

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    setItems(prevItems => prevItems.map(item => ({
      ...item,
      rate: newRate,
      amount: item.hours * newRate
    })));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onSave({
        date: new Date(date),
        status,
        number,
        client,
        rateType,
        items,
        timeLogs: Array.from(selectedLogIds)
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update invoice:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalHours = items.reduce((sum, item) => sum + item.hours, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Invoice</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Invoice Number</label>
              <Input
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="INV-001"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Invoice Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Client Name</label>
            <Input
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Client Name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={(value: 'draft' | 'pending' | 'paid') => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rate Type</label>
              <Select value={rateType} onValueChange={(value: 'hourly' | 'fixed') => setRateType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly Rate</SelectItem>
                  <SelectItem value="fixed">Fixed Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {rateType === 'fixed' && (
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                Time logs will be tracked internally but won&apos;t be visible on the final invoice.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Time Logs</label>
            <Card className="p-4">
              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                {availableLogs.map((log) => (
                  <div key={log._id?.toString()} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedLogIds.has(log._id?.toString() ?? '')}
                        onCheckedChange={(checked) => handleLogToggle(log._id?.toString() ?? '', checked === true)}
                      />
                      <div>
                        <p className="font-medium">{log.project} • {log.client}</p>
                        <p className="text-muted-foreground">
                          {new Date(log.startTime).toLocaleDateString()} • {new Date(log.startTime).toLocaleTimeString()} - {new Date(log.endTime).toLocaleTimeString()} • {log.hours.toFixed(2)} hours
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Invoice Items</label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Rate:</span>
                <span className="text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={rate}
                  onChange={(e) => handleRateChange(parseFloat(e.target.value) || 0)}
                  className="w-20 h-7"
                />
                {rateType === 'hourly' && (
                  <span className="text-muted-foreground">/hr</span>
                )}
              </div>
            </div>
            <Card className="p-4">
              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium">{item.project}</p>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {rateType === 'hourly' && (
                        <div className="text-right">
                          <p>{item.hours.toFixed(2)} hours</p>
                        </div>
                      )}
                      <div className="text-right font-medium">
                        ${(rateType === 'hourly' ? item.hours * rate : rate / items.length).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <div className="flex justify-between font-medium">
                    <span>{rateType === 'hourly' ? 'Total Hours' : 'Total'}</span>
                    <div className="flex items-center gap-4">
                      {rateType === 'hourly' && (
                        <span>{totalHours.toFixed(2)} hours</span>
                      )}
                      <span>${(rateType === 'hourly' ? totalHours * rate : rate).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
        <div className="pt-4 border-t mt-4">
          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 