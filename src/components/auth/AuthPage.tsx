import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen bg-primary flex">
      {/* Left side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {mode === 'login' ? (
            <LoginForm onSwitchToSignup={() => setMode('signup')} />
          ) : (
            <SignupForm onSwitchToLogin={() => setMode('login')} />
          )}
        </div>
      </div>

      {/* Right side - Visual/Info */}
      <div className="hidden lg:flex flex-1 bg-secondary items-center justify-center p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-lg">
          <blockquote className="text-2xl font-medium text-primary leading-relaxed mb-6">
            "Fundamenta has transformed how we manage EU grants. We've increased our success rate by 40% and saved countless hours on administration."
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
              <span className="text-accent font-semibold">AK</span>
            </div>
            <div>
              <p className="text-primary font-medium">Anna Kowalski</p>
              <p className="text-secondary text-sm">Grant Coordinator, Kraków</p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">€2.4B+</p>
              <p className="text-secondary text-sm mt-1">Funds Managed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">500+</p>
              <p className="text-secondary text-sm mt-1">Municipalities</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">95%</p>
              <p className="text-secondary text-sm mt-1">Satisfaction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
