'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Invoice } from "@/lib/invoices";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { EditInvoiceDialog } from "./edit-invoice-dialog";

interface ViewInvoiceDialogProps {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewInvoiceDialog({ invoice, open, onOpenChange }: ViewInvoiceDialogProps) {
  const [showEdit, setShowEdit] = useState(false);

  const handleSave = async (data: Partial<Invoice>) => {
    const response = await fetch(`/api/invoices/${invoice._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to update invoice');
    }

    window.location.reload();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Invoice {invoice.number}</DialogTitle>
            <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Client</p>
                <p className="text-lg">{invoice.client}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-lg">{format(new Date(invoice.date), 'PPP')}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Items</p>
              <div className="space-y-2">
                {invoice.items.map((item, i) => (
                  <div key={i} className="flex justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">{item.project}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                        {invoice.rateType === 'fixed' && (
                          <span className="ml-2 text-xs">
                            (Internal: {item.hours.toFixed(2)} hrs • ${((invoice.total / invoice.items.length) / item.hours).toFixed(2)}/hr)
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      {invoice.rateType === 'hourly' ? (
                        <>
                          <p>{item.hours.toFixed(2)} hrs × ${item.rate}/hr</p>
                          <p className="font-medium">${(item.hours * item.rate).toFixed(2)}</p>
                        </>
                      ) : (
                        <p className="font-medium">${(invoice.total / invoice.items.length).toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <p className="font-medium">{invoice.rateType === 'hourly' ? 'Total Hours' : 'Total'}</p>
              <div className="text-right">
                {invoice.rateType === 'hourly' ? (
                  <p className="text-muted-foreground">
                    {invoice.items.reduce((sum, item) => sum + item.hours, 0).toFixed(2)} hours
                  </p>
                ) : (
                  <p className="text-muted-foreground text-xs">
                    Internal: {invoice.items.reduce((sum, item) => sum + item.hours, 0).toFixed(2)} hrs • 
                    ${(invoice.total / invoice.items.reduce((sum, item) => sum + item.hours, 0)).toFixed(2)}/hr avg
                  </p>
                )}
                <p className="font-bold text-lg">${invoice.total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EditInvoiceDialog
        invoice={invoice}
        open={showEdit}
        onOpenChange={setShowEdit}
        onSave={handleSave}
      />
    </>
  );
} 