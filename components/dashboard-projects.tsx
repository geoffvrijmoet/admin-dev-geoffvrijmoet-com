'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { EditProjectDialog } from "@/components/edit-project-dialog";
import { Project } from "@/lib/projects";

export function DashboardProjects({ projects }: { projects: Project[] }) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  return (
    <div className="space-y-4">
      {projects.map((project, i) => (
        <div key={i} className="flex items-center justify-between group">
          <div>
            <p className="text-sm font-medium">
              {project.project} • {project.client}
            </p>
            <p className="text-xs text-muted-foreground">
              {project.rateType}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">
                ${project.rate}{project.rateType === 'hourly' ? '/hr' : ''}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="opacity-0 group-hover:opacity-100"
              onClick={() => setSelectedProject(project)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      
      {selectedProject && (
        <EditProjectDialog
          project={{
            client: selectedProject.client,
            project: selectedProject.project,
            rate: selectedProject.rate ?? 0,
            rateType: selectedProject.rateType ?? 'hourly'
          }}
          open={!!selectedProject}
          onOpenChange={(open) => !open && setSelectedProject(null)}
          onSave={async (data) => {
            const response = await fetch(`/api/projects/${selectedProject.project}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to update project');
            window.location.reload();
          }}
        />
      )}
    </div>
  );
} 