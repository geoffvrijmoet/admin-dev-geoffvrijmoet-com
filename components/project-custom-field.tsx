import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ProjectCustomFieldProps {
  onAdd: (fieldName: string, value: string) => Promise<void>;
}

export function ProjectCustomField({ onAdd }: ProjectCustomFieldProps) {
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldValue, setFieldValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const getMongoFieldName = useCallback((label: string) => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_');
  }, []);

  const handleAdd = async () => {
    if (!fieldLabel || !fieldValue) return;
    
    try {
      setIsAdding(true);
      await onAdd(getMongoFieldName(fieldLabel), fieldValue);
      setFieldLabel('');
      setFieldValue('');
    } catch (error) {
      console.error('Failed to add field:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <h3 className="text-sm font-medium">Add Custom Field</h3>
      <div className="space-y-2">
        <div>
          <Label htmlFor="fieldLabel">Field Name</Label>
          <Input
            id="fieldLabel"
            value={fieldLabel}
            onChange={(e) => setFieldLabel(e.target.value)}
            placeholder="e.g. Project Manager"
            className="mt-1"
          />
          {fieldLabel && (
            <p className="text-xs text-muted-foreground mt-1">
              Will be stored as: {getMongoFieldName(fieldLabel)}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="fieldValue">Value</Label>
          <Input
            id="fieldValue"
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
            placeholder="Enter value"
            className="mt-1"
          />
        </div>
        <Button 
          onClick={handleAdd}
          disabled={!fieldLabel || !fieldValue || isAdding}
          className="w-full"
        >
          Add Field
        </Button>
      </div>
    </div>
  );
} 