import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Task } from '@/components/TaskManager';

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (data: Pick<Task, 'title' | 'description' | 'category' | 'priority' | 'due_date'>) => void;
  onClose: () => void;
}

export function TaskForm({ task, onSubmit, onClose }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal' as Task['category'],
    priority: 'medium' as Task['priority'],
    due_date: ''
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        category: task.category,
        priority: task.priority,
        due_date: task.due_date ? task.due_date.slice(0, 16) : ''
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onSubmit({
      ...formData,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-2xl bg-card/95 backdrop-blur-sm border-neon-cyan/30 animate-scale-in">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gradient">
              {task ? 'Edit Task' : 'Create New Task'}
            </h2>
            <Button
              variant="neon-ghost"
              size="icon"
              onClick={onClose}
              className="hover-glow"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-neon-cyan font-medium">
                Task Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title..."
                className="bg-input/50 border-border/30 text-foreground placeholder:text-muted-foreground focus:border-neon-cyan focus:ring-neon-cyan/20"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-neon-purple font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter task description..."
                rows={3}
                className="bg-input/50 border-border/30 text-foreground placeholder:text-muted-foreground focus:border-neon-purple focus:ring-neon-purple/20"
              />
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-success font-medium">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as Task['category'] }))}
                >
                  <SelectTrigger className="bg-input/50 border-border/30 text-foreground focus:border-success focus:ring-success/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover/95 backdrop-blur-sm border-border/30">
                    <SelectItem value="work" className="text-neon-cyan">🏢 Work</SelectItem>
                    <SelectItem value="study" className="text-neon-purple">📚 Study</SelectItem>
                    <SelectItem value="personal" className="text-success">🏠 Personal</SelectItem>
                    <SelectItem value="urgent" className="text-destructive">⚡ Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-warning font-medium">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as Task['priority'] }))}
                >
                  <SelectTrigger className="bg-input/50 border-border/30 text-foreground focus:border-warning focus:ring-warning/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover/95 backdrop-blur-sm border-border/30">
                    <SelectItem value="low" className="text-success">🟢 Low</SelectItem>
                    <SelectItem value="medium" className="text-warning">🟡 Medium</SelectItem>
                    <SelectItem value="high" className="text-destructive">🔴 High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="due_date" className="text-muted-foreground font-medium">
                Due Date (Optional)
              </Label>
              <Input
                id="due_date"
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                className="bg-input/50 border-border/30 text-foreground focus:border-muted-foreground focus:ring-muted-foreground/20"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="neon-ghost"
                onClick={onClose}
                className="hover-glow"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="neon"
                className="hover-glow click-scale"
              >
                {task ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}