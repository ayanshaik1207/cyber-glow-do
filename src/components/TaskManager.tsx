import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Flag, Archive, Zap, Trophy, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { UserStats } from '@/components/UserStats';
import { useToast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: 'work' | 'study' | 'personal' | 'urgent';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  completed: boolean;
  created_at: string;
  completed_at?: string;
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [userData, setUserData] = useState<UserData>({
    totalXP: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    tasksCompleted: 0,
    focusMinutes: 0,
    achievements: []
  });
  const { toast } = useToast();

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('cyberpunk-tasks');
    const savedUserData = localStorage.getItem('cyberpunk-user');
    
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    if (savedUserData) {
      setUserData(JSON.parse(savedUserData));
    }
  }, []);

  // Save to localStorage whenever tasks or userData changes
  useEffect(() => {
    localStorage.setItem('cyberpunk-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('cyberpunk-user', JSON.stringify(userData));
  }, [userData]);

  const addXP = (amount: number, reason: string) => {
    setUserData(prev => {
      const newXP = prev.totalXP + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      const leveledUp = newLevel > prev.level;
      
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
      
      return {
        ...prev,
        totalXP: newXP,
        level: newLevel
      };
    });
  };

  const checkAchievements = (updatedTasks: Task[], updatedUserData: UserData) => {
    const completedToday = updatedTasks.filter(task => 
      task.completed && 
      task.completed_at && 
      new Date(task.completed_at).toDateString() === new Date().toDateString()
    ).length;

    const newAchievements: string[] = [];

    // First task achievement
    if (updatedUserData.tasksCompleted === 1 && !updatedUserData.achievements.includes('first_task')) {
      newAchievements.push('first_task');
    }

    // Task master (10 tasks in a day)
    if (completedToday >= 10 && !updatedUserData.achievements.includes('task_master')) {
      newAchievements.push('task_master');
    }

    // Consistency king (7 day streak)
    if (updatedUserData.currentStreak >= 7 && !updatedUserData.achievements.includes('consistency_king')) {
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
      setUserData(prev => ({
        ...prev,
        achievements: [...prev.achievements, ...newAchievements],
        totalXP: prev.totalXP + newAchievements.reduce((sum, ach) => {
          const data = {
            first_task: 10,
            task_master: 100,
            consistency_king: 200,
          }[ach as keyof typeof data];
          return sum + (data || 0);
        }, 0)
      }));
    }
  };

  const createTask = (taskData: Omit<Task, 'id' | 'created_at' | 'completed' | 'completed_at'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      completed: false
    };

    setTasks(prev => {
      const updated = [newTask, ...prev];
      return updated;
    });

    addXP(5, "Task created!");
    setShowTaskForm(false);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => {
      const updated = prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      );
      return updated;
    });
    setEditingTask(null);
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks(prev => {
      const updated = prev.map(task => {
        if (task.id === taskId) {
          const isCompleting = !task.completed;
          const updatedTask = {
            ...task,
            completed: isCompleting,
            completed_at: isCompleting ? new Date().toISOString() : undefined
          };

          if (isCompleting) {
            // Calculate XP based on priority
            const xpAmount = { low: 10, medium: 15, high: 25 }[task.priority];
            setTimeout(() => addXP(xpAmount, `Task completed! (${task.priority} priority)`), 100);

            // Update user stats
            setUserData(prev => {
              const newUserData = {
                ...prev,
                tasksCompleted: prev.tasksCompleted + 1,
                currentStreak: prev.currentStreak + 1,
                longestStreak: Math.max(prev.longestStreak, prev.currentStreak + 1)
              };
              
              // Check for achievements after state update
              setTimeout(() => checkAchievements(updated, newUserData), 200);
              
              return newUserData;
            });
          }

          return updatedTask;
        }
        return task;
      });
      return updated;
    });
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast({
      title: "Task deleted",
      description: "Task has been permanently removed.",
      className: "animate-fade-in border-destructive bg-card/90 backdrop-blur-sm"
    });
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const onFocusComplete = (minutes: number) => {
    const xpGained = minutes * 2; // 2 XP per minute
    addXP(xpGained, `${minutes} minutes of focused work!`);
    
    setUserData(prev => ({
      ...prev,
      focusMinutes: prev.focusMinutes + minutes
    }));
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
              <UserStats userData={userData} />
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
                  <span className="text-neon-cyan font-bold">{userData.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total XP</span>
                  <span className="text-neon-purple font-bold">{userData.totalXP}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tasks Done</span>
                  <span className="text-success font-bold">{userData.tasksCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Streak</span>
                  <span className="text-warning font-bold">{userData.currentStreak}</span>
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
            <TaskList
              tasks={filteredTasks}
              onToggleComplete={toggleTaskComplete}
              onEdit={setEditingTask}
              onDelete={deleteTask}
            />
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