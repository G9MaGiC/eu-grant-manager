import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, User, Building2, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const { signUp, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the terms of service');
      return;
    }

    setIsSubmitting(true);
    const { error } = await signUp(email, password, {
      full_name: fullName,
      organization: organization || undefined,
    });
    setIsSubmitting(false);
    
    if (!error) {
      onSwitchToLogin();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-accent/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-accent font-bold text-2xl">EU</span>
        </div>
        <h1 className="text-2xl font-semibold text-primary mb-2">Create account</h1>
        <p className="text-secondary">Start managing your grants today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-secondary text-sm mb-2 block">Full Name *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-tertiary border border-theme rounded-xl pl-10 pr-4 py-3 text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-secondary text-sm mb-2 block">Organization</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Municipality of..."
              className="w-full bg-tertiary border border-theme rounded-xl pl-10 pr-4 py-3 text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-secondary text-sm mb-2 block">Email *</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-tertiary border border-theme rounded-xl pl-10 pr-4 py-3 text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-secondary text-sm mb-2 block">Password *</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-tertiary border border-theme rounded-xl pl-10 pr-12 py-3 text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-muted text-xs mt-1">Must be at least 6 characters</p>
        </div>

        <div>
          <label className="text-secondary text-sm mb-2 block">Confirm Password *</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-tertiary border border-theme rounded-xl pl-10 pr-4 py-3 text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              required
            />
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 rounded border-theme bg-tertiary text-accent focus:ring-accent"
          />
          <span className="text-secondary text-sm">
            I agree to the{' '}
            <button type="button" onClick={() => toast.info('Terms coming soon')} className="text-accent hover:underline">
              Terms of Service
            </button>{' '}
            and{' '}
            <button type="button" onClick={() => toast.info('Privacy Policy coming soon')} className="text-accent hover:underline">
              Privacy Policy
            </button>
          </span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting || loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-secondary">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-accent hover:text-accent-hover font-medium transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
