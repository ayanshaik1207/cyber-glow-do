import React from 'react';
import { Calendar, Flag, Edit, Trash2, CheckCircle, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Task } from '@/components/TaskManager';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskList({ tasks, onToggleComplete, onEdit, onDelete }: TaskListProps) {
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getCategoryColor = (category: Task['category']) => {
    switch (category) {
      case 'work': return 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30';
      case 'study': return 'bg-neon-purple/20 text-neon-purple border-neon-purple/30';
      case 'personal': return 'bg-success/20 text-success border-success/30';
      case 'urgent': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (tasks.length === 0) {
    return (
      <Card className="p-12 text-center bg-card/50 backdrop-blur-sm border-border/20 animate-fade-in">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-2xl font-bold text-neon-cyan mb-2">No tasks found</h3>
        <p className="text-muted-foreground">
          Create your first task to start your cyberpunk productivity journey!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          Task Matrix <span className="text-neon-cyan">({tasks.length})</span>
        </h2>
      </div>

      <div className="grid gap-4">
        {tasks.map((task, index) => (
          <Card 
            key={task.id} 
            className={`p-6 bg-card/50 backdrop-blur-sm border-border/20 hover-glow transition-all duration-200 animate-slide-up ${
              task.completed ? 'opacity-75' : ''
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start gap-4">
              {/* Completion Toggle */}
              <button
                onClick={() => onToggleComplete(task.id)}
                className="mt-1 hover-glow-purple click-scale"
              >
                {task.completed ? (
                  <CheckCircle className="w-6 h-6 text-success animate-scale-in" />
                ) : (
                  <Circle className="w-6 h-6 text-muted-foreground hover:text-neon-cyan transition-colors" />
                )}
              </button>

              {/* Task Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className={`text-lg font-semibold ${
                    task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                  }`}>
                    {task.title}
                  </h3>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="neon-ghost"
                      size="sm"
                      onClick={() => onEdit(task)}
                      className="hover-glow"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="neon-danger"
                      size="sm"
                      onClick={() => onDelete(task.id)}
                      className="hover-glow"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Description */}
                {task.description && (
                  <p className={`text-sm mb-3 ${
                    task.completed ? 'text-muted-foreground' : 'text-muted-foreground'
                  }`}>
                    {task.description}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-4 text-sm">
                  {/* Category */}
                  <span className={`px-3 py-1 rounded-full border font-medium ${getCategoryColor(task.category)}`}>
                    {task.category}
                  </span>

                  {/* Priority */}
                  <div className={`flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                    <Flag className="w-4 h-4" />
                    <span className="capitalize font-medium">{task.priority}</span>
                  </div>

                  {/* Due Date */}
                  {task.due_date && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(task.due_date)}</span>
                    </div>
                  )}

                  {/* Completion Date */}
                  {task.completed && task.completed_at && (
                    <div className="flex items-center gap-1 text-success">
                      <CheckCircle className="w-4 h-4" />
                      <span>Completed {formatDate(task.completed_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}