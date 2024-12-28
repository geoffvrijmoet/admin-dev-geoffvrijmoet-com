"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Play, Square } from "lucide-react";

interface TimeTrackingFormProps {
  projects: string[];
  onLogTime: (data: { 
    project: string; 
    hours: number;
    startTime: string;
    endTime: string;
    description?: string;
  }) => void;
}

interface TimeEntry {
  project: string;
  startTime: string;
  endTime?: string;
  description?: string;
  synced: boolean;
}

export function TimeTrackingForm({ projects, onLogTime }: TimeTrackingFormProps) {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [offlineEntries, setOfflineEntries] = useState<TimeEntry[]>([]);
  const [description, setDescription] = useState("");

  // Load any saved offline entries
  useEffect(() => {
    const saved = localStorage.getItem('timeEntries');
    if (saved) {
      setOfflineEntries(JSON.parse(saved));
    }
  }, []);

  // Save offline entries whenever they change
  useEffect(() => {
    localStorage.setItem('timeEntries', JSON.stringify(offlineEntries));
  }, [offlineEntries]);

  // Update elapsed time every second while tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, startTime]);

  const startTracking = () => {
    const now = new Date();
    setIsTracking(true);
    setStartTime(now);
    setElapsedTime(0);
    
    // Save start time locally in case we go offline
    const newEntry: TimeEntry = {
      project: selectedProject,
      startTime: now.toISOString(),
      synced: false
    };
    setOfflineEntries(prev => [...prev, newEntry]);
  };

  const stopTracking = async () => {
    if (startTime && selectedProject) {
      const endTime = new Date();
      const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

      try {
        await onLogTime({ 
          project: selectedProject, 
          hours,
          startTime: startTime?.toISOString(),
          endTime: endTime.toISOString()
        });

        // Update offline entry as synced
        setOfflineEntries(prev => 
          prev.map(entry => 
            entry.project === selectedProject && entry.startTime === startTime?.toISOString()
              ? { ...entry, endTime: endTime.toISOString(), synced: true }
              : entry
          )
        );
      } catch (error) {
        console.error('Failed to sync time entry:', error);
        // Keep the entry in offline storage to sync later
      }
    }
    setIsTracking(false);
    setStartTime(null);
  };

  // Try to sync any unsynced entries when we come back online
  useEffect(() => {
    const syncOfflineEntries = async () => {
      const unsyncedEntries = offlineEntries.filter(entry => !entry.synced && entry.endTime);
      
      for (const entry of unsyncedEntries) {
        try {
          const hours = (new Date(entry.endTime!).getTime() - new Date(entry.startTime).getTime()) / (1000 * 60 * 60);
          await onLogTime({
            project: entry.project,
            hours,
            startTime: entry.startTime,
            endTime: entry.endTime!
          });
          
          // Mark as synced
          setOfflineEntries(prev => 
            prev.map(e => 
              e === entry ? { ...e, synced: true } : e
            )
          );
        } catch (error) {
          console.error('Failed to sync offline entry:', error);
        }
      }
    };

    window.addEventListener('online', syncOfflineEntries);
    return () => window.removeEventListener('online', syncOfflineEntries);
  }, [offlineEntries, onLogTime]);

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project} value={project}>
                {project}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="What are you working on?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1"
        />

        {isTracking ? (
          <Button 
            variant="destructive" 
            onClick={stopTracking}
            className="flex items-center gap-2"
          >
            <Square className="h-4 w-4" />
            Stop Tracking
          </Button>
        ) : (
          <Button 
            onClick={startTracking} 
            disabled={!selectedProject}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Start Tracking
          </Button>
        )}
      </div>

      {isTracking && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            Tracking time for {selectedProject}... ({elapsedTime.toFixed(2)} hours)
            {!navigator.onLine && " (Offline)"}
          </span>
        </div>
      )}

      {/* Show offline entries that need syncing */}
      {offlineEntries.filter(e => !e.synced).length > 0 && (
        <div className="mt-4 p-2 bg-yellow-50 rounded text-sm">
          {offlineEntries.filter(e => !e.synced).length} entries waiting to sync
        </div>
      )}
    </div>
  );
} 