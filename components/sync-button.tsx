'use client';

import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";

interface SyncButtonProps {
  onSync: () => Promise<{ success: boolean } | void>;
}

export function SyncButton({ onSync }: SyncButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSync();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button 
      onClick={handleSync} 
      disabled={isSyncing}
      variant="outline"
      className="gap-2"
    >
      {isSyncing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      {isSyncing ? 'Syncing...' : 'Sync Hours'}
    </Button>
  );
} 