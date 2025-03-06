import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Project } from '@/types/business';

interface TimeLogDialogProps {
  project: Project;
  onTimeLogCreated: () => void;
}

export function TimeLogDialog({ project, onTimeLogCreated }: TimeLogDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const totalHours = formData.hours + (formData.minutes / 60) + (formData.seconds / 3600);

    try {
      const now = new Date();
      const endTime = now;
      const startTime = new Date(now.getTime() - (totalHours * 60 * 60 * 1000));

      const res = await fetch('/api/time-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project._id,
          projectName: project.projectName,
          client: project.client,
          startTime,
          endTime,
          hours: totalHours,
          description: formData.description || null,
          createdAt: now,
          updatedAt: now
        })
      });

      if (!res.ok) throw new Error('Failed to create time log');
      
      setOpen(false);
      setFormData({ hours: 0, minutes: 0, seconds: 0, description: '' });
      onTimeLogCreated();
    } catch (error) {
      console.error('Failed to create time log:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Add Time Log</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Time Log for {project.project}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                type="number"
                min="0"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: Number(e.target.value) })}
                onFocus={(e) => e.target.select()}
                required
              />
            </div>
            <div>
              <Label htmlFor="minutes">Minutes</Label>
              <Input
                id="minutes"
                type="number"
                min="0"
                max="59"
                value={formData.minutes}
                onChange={(e) => setFormData({ ...formData, minutes: Number(e.target.value) })}
                onFocus={(e) => e.target.select()}
                required
              />
            </div>
            <div>
              <Label htmlFor="seconds">Seconds</Label>
              <Input
                id="seconds"
                type="number"
                min="0"
                max="59"
                value={formData.seconds}
                onChange={(e) => setFormData({ ...formData, seconds: Number(e.target.value) })}
                onFocus={(e) => e.target.select()}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What did you work on?"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Time Log'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 