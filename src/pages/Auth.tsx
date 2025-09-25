import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be less than 20 characters')
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export default function Auth() {
  const { user, signUp, signIn, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  const validateForm = () => {
    const schema = isSignUp ? signUpSchema : signInSchema;
    try {
      schema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    if (isSignUp) {
      await signUp(formData.email, formData.password, formData.username);
    } else {
      await signIn(formData.email, formData.password);
    }
    
    setIsSubmitting(false);
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background grid-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
          <p className="text-neon-cyan animate-pulse">Initializing Neural Interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">
            NEURO<span className="text-neon-cyan">TASKS</span>
          </h1>
          <p className="text-muted-foreground">
            {isSignUp ? 'Join the Cyberpunk Revolution' : 'Access Neural Network'}
          </p>
        </div>

        <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/20 hover-glow">
          {/* Mode Toggle */}
          <div className="flex rounded-lg bg-surface/50 p-1 mb-6">
            <Button
              variant={!isSignUp ? 'neon' : 'neon-ghost'}
              size="sm"
              className="flex-1"
              onClick={() => {
                setIsSignUp(false);
                setErrors({});
              }}
            >
              <Shield className="w-4 h-4" />
              Sign In
            </Button>
            <Button
              variant={isSignUp ? 'neon' : 'neon-ghost'}
              size="sm"
              className="flex-1"
              onClick={() => {
                setIsSignUp(true);
                setErrors({});
              }}
            >
              <Zap className="w-4 h-4" />
              Sign Up
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username (Sign Up Only) */}
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleInputChange('username')}
                    className={`pl-10 ${errors.username ? 'border-destructive' : ''}`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.username && (
                  <p className="text-destructive text-sm animate-fade-in">{errors.username}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <p className="text-destructive text-sm animate-fade-in">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="neon-ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-destructive text-sm animate-fade-in">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="neon"
              size="lg"
              className="w-full hover-glow click-scale"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                <>
                  {isSignUp ? <Zap className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-muted-foreground">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Button
              variant="link"
              className="p-0 h-auto text-neon-cyan hover:text-neon-purple story-link"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
              }}
              disabled={isSubmitting}
            >
              {isSignUp ? 'Sign in here' : 'Sign up here'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}