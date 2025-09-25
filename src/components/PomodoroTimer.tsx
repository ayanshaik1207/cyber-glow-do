import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Zap, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface PomodoroTimerProps {
  onSessionComplete: (minutes: number) => void;
}

export function PomodoroTimer({ onSessionComplete }: PomodoroTimerProps) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isActive && (minutes > 0 || seconds > 0)) {
      intervalRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        }
      }, 1000);
    } else if (minutes === 0 && seconds === 0 && isActive) {
      // Session completed
      setIsActive(false);
      const completedMinutes = isBreak ? (sessionCount % 4 === 0 ? 30 : 5) : 25;
      
      if (!isBreak) {
        // Work session completed
        onSessionComplete(completedMinutes);
        setSessionCount(prev => prev + 1);
        
        toast({
          title: "🎉 Focus Session Complete!",
          description: `Great work! You focused for ${completedMinutes} minutes.`,
          className: "animate-scale-in border-success bg-success/10 backdrop-blur-sm"
        });

        // Start break
        setIsBreak(true);
        const breakMinutes = sessionCount % 4 === 3 ? 30 : 5; // Long break every 4 sessions
        setMinutes(breakMinutes);
        setSeconds(0);
        
        toast({
          title: breakMinutes === 30 ? "☕ Long Break Time!" : "⚡ Quick Break!",
          description: `Take a ${breakMinutes} minute break. You've earned it!`,
          className: "animate-slide-in-right border-neon-purple bg-neon-purple/10 backdrop-blur-sm"
        });
      } else {
        // Break completed
        toast({
          title: "🔥 Break's Over!",
          description: "Ready for another focus session?",
          className: "animate-pulse-neon border-neon-cyan bg-neon-cyan/10 backdrop-blur-sm"
        });
        
        setIsBreak(false);
        setMinutes(25);
        setSeconds(0);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, minutes, seconds, isBreak, sessionCount, onSessionComplete, toast]);

  const toggle = () => {
    setIsActive(!isActive);
  };

  const reset = () => {
    setIsActive(false);
    if (isBreak) {
      const breakMinutes = (sessionCount - 1) % 4 === 3 ? 30 : 5;
      setMinutes(breakMinutes);
    } else {
      setMinutes(25);
    }
    setSeconds(0);
  };

  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isBreak ? 
    ((((sessionCount - 1) % 4 === 3 ? 30 : 5) * 60 - (minutes * 60 + seconds)) / ((sessionCount - 1) % 4 === 3 ? 30 : 5) / 60) * 100 :
    ((25 * 60 - (minutes * 60 + seconds)) / 25 / 60) * 100;

  const circumference = 2 * Math.PI * 90; // radius of 90
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/20 hover-glow">
      <div className="text-center">
        <h3 className="text-xl font-bold text-neon-cyan mb-4 flex items-center justify-center gap-2">
          {isBreak ? <Coffee className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          {isBreak ? 'Break Time' : 'Focus Mode'}
        </h3>

        {/* Circular Progress Timer */}
        <div className="relative mx-auto mb-6 w-48 h-48 flex items-center justify-center">
          {/* Background Circle */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="hsl(var(--border))"
              strokeWidth="4"
              fill="transparent"
              className="opacity-30"
            />
            
            {/* Progress Circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke={isBreak ? "hsl(var(--neon-purple))" : "hsl(var(--neon-cyan))"}
              strokeWidth="4"
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`transition-all duration-1000 ${isActive ? 'animate-pulse-neon' : ''}`}
              style={{
                filter: `drop-shadow(0 0 8px ${isBreak ? 'hsl(271 76% 53% / 0.5)' : 'hsl(180 100% 50% / 0.5)'})`
              }}
            />
          </svg>

          {/* Timer Display */}
          <div className="text-center">
            <div className={`text-4xl font-mono font-bold ${isBreak ? 'text-neon-purple' : 'text-neon-cyan'}`}>
              {formatTime(minutes, seconds)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Session #{sessionCount + 1}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant={isActive ? "neon-purple" : "neon"}
            size="lg"
            onClick={toggle}
            className="hover-glow click-scale"
          >
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          
          <Button
            variant="neon-ghost"
            size="lg"
            onClick={reset}
            className="hover-glow click-scale"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </Button>
        </div>

        {/* Session Progress */}
        <div className="mt-4 p-3 bg-surface/50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Sessions Today</span>
            <span className="text-neon-cyan font-bold">{sessionCount}</span>
          </div>
          
          {/* Dots indicating sessions */}
          <div className="flex justify-center gap-1 mt-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < sessionCount % 4 
                    ? 'bg-neon-cyan animate-pulse-neon' 
                    : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}