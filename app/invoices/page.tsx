import { getRecentLogs } from "@/app/time-tracking/actions";
import { InvoiceList } from "../../components/invoice-list";
import { CreateInvoiceButton } from "../../components/create-invoice-button";

export default async function InvoicesPage() {
  const logs = await getRecentLogs();
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground">
            Manage your invoices and payments
          </p>
        </div>
        <CreateInvoiceButton logs={logs} />
      </div>
      
      <InvoiceList />
    </div>
  );
} 