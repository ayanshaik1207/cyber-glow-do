import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Flag, Archive, Zap, Trophy, Clock, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { UserStats } from '@/components/UserStats';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  priority: string;
  due_date?: string | null;
  completed: boolean;
  created_at: string;
  completed_at?: string | null;
  updated_at: string;
  user_id: string;
}

export interface UserData {
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  tasksCompleted: number;
  focusMinutes: number;
  achievements: string[];
}

export function TaskManager() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load tasks from Supabase on mount
  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error Loading Tasks",
        description: error.message,
        className: "animate-fade-in border-destructive bg-destructive/10 backdrop-blur-sm"
      });
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  const addXP = async (amount: number, reason: string) => {
    if (!profile || !user) return;
    
    const newXP = profile.total_xp + amount;
    const newLevel = Math.floor(newXP / 100) + 1;
    const leveledUp = newLevel > profile.current_level;
    
    const updates = {
      total_xp: newXP,
      current_level: newLevel
    };
    
    await updateProfile(updates);
    
    if (leveledUp) {
      toast({
        title: "🎉 LEVEL UP!",
        description: `You've reached level ${newLevel}! Amazing progress!`,
        className: "animate-scale-in border-neon-cyan bg-card/90 backdrop-blur-sm"
      });
    }
    
    toast({
      title: `+${amount} XP`,
      description: reason,
      className: "animate-slide-in-right border-neon-purple bg-card/90 backdrop-blur-sm"
    });
  };

  const checkAchievements = async (completedTasksCount: number) => {
    if (!profile || !user) return;
    
    const completedToday = tasks.filter(task => 
      task.completed && 
      task.completed_at && 
      new Date(task.completed_at).toDateString() === new Date().toDateString()
    ).length;

    const newAchievements: string[] = [];

    // First task achievement
    if (completedTasksCount === 1 && !profile.achievements.includes('first_task')) {
      newAchievements.push('first_task');
    }

    // Task master (10 tasks in a day)
    if (completedToday >= 10 && !profile.achievements.includes('task_master')) {
      newAchievements.push('task_master');
    }

    // Consistency king (7 day streak)
    if (profile.current_streak >= 7 && !profile.achievements.includes('consistency_king')) {
      newAchievements.push('consistency_king');
    }

    // Show achievement notifications
    newAchievements.forEach(achievement => {
      const achievementData = {
        first_task: { name: "Getting Started", icon: "🎯", xp: 10 },
        task_master: { name: "Task Master", icon: "👑", xp: 100 },
        consistency_king: { name: "Consistency King", icon: "🔥", xp: 200 },
      }[achievement as keyof typeof achievementData];

      if (achievementData) {
        toast({
          title: `🏆 Achievement Unlocked!`,
          description: `${achievementData.icon} ${achievementData.name} (+${achievementData.xp} XP)`,
          className: "animate-scale-in border-neon-cyan bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 backdrop-blur-sm"
        });
      }
    });

    if (newAchievements.length > 0) {
      const achievementXP = newAchievements.reduce((sum, ach) => {
        const data = {
          first_task: 10,
          task_master: 100,
          consistency_king: 200,
        }[ach as keyof typeof data];
        return sum + (data || 0);
      }, 0);

      await updateProfile({
        achievements: [...profile.achievements, ...newAchievements],
        total_xp: profile.total_xp + achievementXP
      });
    }
  };

  const createTask = async (taskData: Pick<Task, 'title' | 'description' | 'category' | 'priority' | 'due_date'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        ...taskData,
        user_id: user.id,
      }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error Creating Task",
        description: error.message,
        className: "animate-fade-in border-destructive bg-destructive/10 backdrop-blur-sm"
      });
    } else {
      setTasks(prev => [data, ...prev]);
      addXP(5, "Task created!");
      setShowTaskForm(false);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId);

    if (error) {
      toast({
        title: "Error Updating Task",
        description: error.message,
        className: "animate-fade-in border-destructive bg-destructive/10 backdrop-blur-sm"
      });
    } else {
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));
      setEditingTask(null);
    }
  };

  const toggleTaskComplete = async (taskId: string) => {
    if (!user || !profile) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const isCompleting = !task.completed;
    const updates = {
      completed: isCompleting,
      completed_at: isCompleting ? new Date().toISOString() : null
    };

    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId);

    if (error) {
      toast({
        title: "Error Updating Task",
        description: error.message,
        className: "animate-fade-in border-destructive bg-destructive/10 backdrop-blur-sm"
      });
      return;
    }

    // Update local state
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, ...updates } : t
    ));

    if (isCompleting) {
      // Calculate XP based on priority
      const xpAmount = ({ low: 10, medium: 15, high: 25 } as const)[task.priority as 'low' | 'medium' | 'high'] || 10;
      setTimeout(() => addXP(xpAmount, `Task completed! (${task.priority} priority)`), 100);

      // Update user stats
      const newTasksCompleted = profile.tasks_completed + 1;
      const newStreak = profile.current_streak + 1;
      
      await updateProfile({
        tasks_completed: newTasksCompleted,
        current_streak: newStreak,
        longest_streak: Math.max(profile.longest_streak, newStreak)
      });

      // Check for achievements
      setTimeout(() => checkAchievements(newTasksCompleted), 200);
    }
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      toast({
        title: "Error Deleting Task",
        description: error.message,
        className: "animate-fade-in border-destructive bg-destructive/10 backdrop-blur-sm"
      });
    } else {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast({
        title: "Task deleted",
        description: "Task has been permanently removed.",
        className: "animate-fade-in border-destructive bg-card/90 backdrop-blur-sm"
      });
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const onFocusComplete = async (minutes: number) => {
    if (!profile) return;
    
    const xpGained = minutes * 2; // 2 XP per minute
    addXP(xpGained, `${minutes} minutes of focused work!`);
    
    await updateProfile({
      focus_minutes: profile.focus_minutes + minutes
    });

    // Save focus session to database
    if (user) {
      await supabase.from('focus_sessions').insert([{
        user_id: user.id,
        duration_minutes: minutes,
        session_type: 'work'
      }]);
    }
  };

  return (
    <div className="min-h-screen bg-background grid-bg">
      {/* Header */}
      <header className="border-b border-border/20 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gradient animate-fade-in">
                NEURO<span className="text-neon-cyan">TASKS</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Cyberpunk Productivity Interface v2.077
              </p>
            </div>
            <div className="flex items-center gap-4">
              {profile && <UserStats userData={profile} />}
              <Button
                variant="neon-ghost"
                size="lg"
                onClick={signOut}
                className="hover-glow click-scale"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </Button>
              <Button 
                variant="neon" 
                size="lg"
                onClick={() => setShowTaskForm(true)}
                className="hover-glow click-scale"
              >
                <Plus className="w-5 h-5" />
                New Task
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Stats & Timer */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/20 hover-glow">
              <h3 className="text-xl font-bold text-neon-cyan mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Level</span>
                  <span className="text-neon-cyan font-bold">{profile?.current_level || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total XP</span>
                  <span className="text-neon-purple font-bold">{profile?.total_xp || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tasks Done</span>
                  <span className="text-success font-bold">{profile?.tasks_completed || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Streak</span>
                  <span className="text-warning font-bold">{profile?.current_streak || 0}</span>
                </div>
              </div>
            </Card>

            {/* Pomodoro Timer */}
            <PomodoroTimer onSessionComplete={onFocusComplete} />

            {/* Filter Buttons */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/20">
              <h3 className="text-xl font-bold text-neon-purple mb-4 flex items-center gap-2">
                <Archive className="w-5 h-5" />
                Filters
              </h3>
              <div className="space-y-2">
                {[
                  { key: 'all', label: 'All Tasks', icon: Archive },
                  { key: 'active', label: 'Active', icon: Zap },
                  { key: 'completed', label: 'Completed', icon: Flag }
                ].map(({ key, label, icon: Icon }) => (
                  <Button
                    key={key}
                    variant={filter === key ? 'neon-outline' : 'neon-ghost'}
                    className="w-full justify-start"
                    onClick={() => setFilter(key as any)}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content - Task List */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-neon-cyan animate-pulse">Loading neural tasks...</p>
                </div>
              </div>
            ) : (
              <TaskList
                tasks={filteredTasks}
                onToggleComplete={toggleTaskComplete}
                onEdit={setEditingTask}
                onDelete={deleteTask}
              />
            )}
          </div>
        </div>
      </div>

      {/* Task Form Modal */}
      {(showTaskForm || editingTask) && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? 
            (data) => updateTask(editingTask.id, data) : 
            createTask
          }
          onClose={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}