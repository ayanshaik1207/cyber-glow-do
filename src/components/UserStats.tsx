import React from 'react';
import { Trophy, Zap, Target, Flame } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Profile {
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  tasks_completed: number;
  focus_minutes: number;
  achievements: string[];
}

interface UserStatsProps {
  userData: Profile;
}

export function UserStats({ userData }: UserStatsProps) {
  const xpToNextLevel = (userData.current_level * 100) - userData.total_xp;
  const currentLevelXP = userData.total_xp - ((userData.current_level - 1) * 100);
  const progressPercentage = (currentLevelXP / 100) * 100;

  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/20 hover-glow min-w-[280px]">
      <div className="space-y-4">
        {/* Level & XP */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-neon-cyan" />
            <span className="text-2xl font-bold text-gradient">
              Level {userData.current_level}
            </span>
          </div>
          
          {/* XP Progress Bar */}
          <div className="w-full bg-surface rounded-full h-2 mb-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-500 animate-glow"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            {currentLevelXP}/100 XP ({xpToNextLevel} to next level)
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 text-center">
          {/* Total XP */}
          <div className="space-y-1">
            <Zap className="w-4 h-4 text-neon-purple mx-auto" />
            <div className="text-lg font-bold text-neon-purple">
              {userData.total_xp.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total XP</div>
          </div>

          {/* Tasks Completed */}
          <div className="space-y-1">
            <Target className="w-4 h-4 text-success mx-auto" />
            <div className="text-lg font-bold text-success">
              {userData.tasks_completed}
            </div>
            <div className="text-xs text-muted-foreground">Tasks Done</div>
          </div>

          {/* Current Streak */}
          <div className="space-y-1">
            <Flame className="w-4 h-4 text-warning mx-auto" />
            <div className="text-lg font-bold text-warning">
              {userData.current_streak}
            </div>
            <div className="text-xs text-muted-foreground">Streak</div>
          </div>
        </div>

        {/* Achievements */}
        {userData.achievements.length > 0 && (
          <div className="pt-2 border-t border-border/30">
            <div className="text-xs text-muted-foreground mb-2">Recent Achievements:</div>
            <div className="flex flex-wrap gap-1">
              {userData.achievements.slice(-3).map((achievement, index) => {
                const achievementData = {
                  first_task: { icon: "🎯", name: "First Task" },
                  task_master: { icon: "👑", name: "Task Master" },
                  consistency_king: { icon: "🔥", name: "Consistency" },
                }[achievement as keyof typeof achievementData];

                return (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-neon-cyan/10 text-neon-cyan rounded-full border border-neon-cyan/30"
                    title={achievementData?.name}
                  >
                    {achievementData?.icon}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}