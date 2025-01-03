'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Invoice } from "@/lib/invoices";
import { format } from "date-fns";

interface ViewInvoiceDialogProps {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewInvoiceDialog({ invoice, open, onOpenChange }: ViewInvoiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Invoice {invoice.number}</DialogTitle>
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
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="text-right">
                    <p>{item.hours} hrs × ${item.rate}/hr</p>
                    <p className="font-medium">${item.amount.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <p className="font-medium">Total</p>
            <p className="font-bold text-lg">${invoice.total.toFixed(2)}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 