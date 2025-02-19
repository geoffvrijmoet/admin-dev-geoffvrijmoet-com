'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/types/business";
import { InlineEdit } from "@/components/ui/inline-edit";
import { ProjectCustomField } from "@/components/project-custom-field";
import { NewProjectDialog } from "@/components/new-project-dialog";
import { TimeLogDialog } from "@/components/time-log-dialog";

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to load projects");
      const data = await res.json();
      setProjects(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (projectId: string, field: string, value: string | number) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });

      if (!res.ok) throw new Error("Failed to update project");
      await fetchProjects();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update project");
      }
    }
  };

  const addCustomField = async (projectId: string, fieldName: string, value: string) => {
    await updateProject(projectId, fieldName, value);
  };

  const renderCustomFields = (project: Project) => {
    const standardFields = ['_id', 'client', 'project', 'rate', 'rateType', 'createdAt', 'updatedAt', 'totalHours', 'totalEarnings'];
    const customFields = Object.entries(project).filter(([key]) => !standardFields.includes(key));

    return customFields.map(([key, value]) => (
      <p key={key} className="text-sm">
        <span className="text-muted-foreground">{key}: </span>
        <InlineEdit
          value={value}
          onSave={async (newValue) => updateProject(project._id, key, newValue)}
        />
      </p>
    ));
  };


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Projects</h1>
        <NewProjectDialog onProjectCreated={fetchProjects} />
      </div>
      
      {loading && <p>Loading projects...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project._id}>
            <CardHeader>
              <CardTitle>
                <InlineEdit
                  value={project.projectName}
                  onSave={async (value) => updateProject(project._id, 'projectName', value)}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Client:{' '}
                <InlineEdit
                  value={project.client}
                  onSave={async (value) => updateProject(project._id, 'client', value)}
                />
              </p>
              <p className="text-sm">
                Rate: $
                <InlineEdit
                  value={project.rate}
                  type="number"
                  onSave={async (value) => updateProject(project._id, 'rate', value)}
                />{' '}
                <InlineEdit
                  value={project.rateType}
                  onSave={async (value) => updateProject(project._id, 'rateType', value)}
                />
              </p>
              
              {/* Time and Earnings Information */}
              <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                
                <p className="text-sm font-medium">
                  Total Hours: {project.totalHours?.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm font-medium">
                  {project.rateType === 'hourly' ? 'Earnings' : 'Fixed Rate'}: ${project.totalEarnings?.toFixed(2) || '0.00'}
                </p>
                
                <TimeLogDialog project={project} onTimeLogCreated={fetchProjects} />
              </div>

              <p className="text-xs text-muted-foreground">
                Created: {new Date(project.createdAt).toLocaleDateString()}
              </p>
              
              {/* Custom Fields */}
              <div className="pt-2 border-t">
                <h4 className="text-sm font-medium mb-2">Custom Fields</h4>
                {renderCustomFields(project)}
              </div>
              
              {/* Add Custom Field */}
              <ProjectCustomField
                onAdd={async (fieldName, value) => addCustomField(project._id, fieldName, value)}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
