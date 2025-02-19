import { useState, useEffect, useRef } from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface InlineEditProps {
  value: string | number;
  onSave: (value: string | number) => Promise<void>;
  type?: 'text' | 'number';
  className?: string;
}

export function InlineEdit({ value: initialValue, onSave, type = 'text', className }: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(type === 'number' ? Number(value) : value);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setValue(initialValue);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={isSaving}
        className={cn("min-w-[100px]", className)}
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={cn("cursor-pointer hover:bg-muted px-2 py-1 rounded", className)}
    >
      {value}
    </span>
  );
} 