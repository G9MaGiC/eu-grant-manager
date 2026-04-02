import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { X, ChevronRight, ChevronLeft, Sparkles, CheckCircle2, Target, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface WelcomeTourProps {
  onClose: () => void;
}

const tourSteps = [
  {
    id: 'welcome',
    title: 'Welcome to EU Grant Manager',
    description: 'Your all-in-one platform for finding, applying, and winning EU funding. Let\'s take a quick tour of the key features.',
    icon: Sparkles,
    color: 'from-accent to-purple-600',
  },
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    description: 'Track your funding pipeline, monitor deadlines, and get a quick snapshot of your grant portfolio performance.',
    icon: Target,
    color: 'from-[#22C55E] to-[#16A34A]',
  },
  {
    id: 'pipeline',
    title: 'Grant Pipeline',
    description: 'Manage all your grant opportunities in one place. Filter by program, track status, and never miss a deadline.',
    icon: Zap,
    color: 'from-[#F59E0B] to-[#D97706]',
  },
  {
    id: 'builder',
    title: 'AI-Powered Builder',
    description: 'Draft compelling applications with AI assistance. Get suggestions, improve clarity, and ensure compliance.',
    icon: Sparkles,
    color: 'from-[#8B5CF6] to-[#7C3AED]',
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    description: 'Generate submission-ready documents, track your success rate, and export data for stakeholders.',
    icon: CheckCircle2,
    color: 'from-[#EC4899] to-[#DB2777]',
  },
];

export function WelcomeTour({ onClose }: WelcomeTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem('grantManager_seenTour');
    if (hasSeenTour) {
      setIsVisible(false);
      // Defer onClose to avoid calling during render phase
      const timer = setTimeout(() => onClose(), 0);
      return () => clearTimeout(timer);
    }
  }, [onClose]);

  useEffect(() => {
    if (isVisible) {
      gsap.fromTo('.tour-modal',
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [isVisible]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      gsap.to('.tour-content', {
        opacity: 0,
        x: -20,
        duration: 0.2,
        onComplete: () => {
          setCurrentStep(currentStep + 1);
          gsap.fromTo('.tour-content',
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.2 }
          );
        }
      });
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      gsap.to('.tour-content', {
        opacity: 0,
        x: 20,
        duration: 0.2,
        onComplete: () => {
          setCurrentStep(currentStep - 1);
          gsap.fromTo('.tour-content',
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.2 }
          );
        }
      });
    }
  };

  const handleSkip = () => {
    try {
      localStorage.setItem('grantManager_seenTour', 'true');
    } catch (e) {
      console.warn('Failed to save tour state');
    }
    gsap.to('.tour-modal', {
      opacity: 0,
      scale: 0.95,
      y: 20,
      duration: 0.3,
      onComplete: () => {
        setIsVisible(false);
        onClose();
      }
    });
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('grantManager_seenTour', 'true');
    } catch (e) {
      console.warn('Failed to save tour state');
    }
    toast.success('Tour completed!', {
      description: 'You\'re ready to start managing your grants.',
    });
    gsap.to('.tour-modal', {
      opacity: 0,
      scale: 0.95,
      y: 20,
      duration: 0.3,
      onComplete: () => {
        setIsVisible(false);
        onClose();
      }
    });
  };

  if (!isVisible) return null;

  const step = tourSteps[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="tour-modal bg-secondary border border-border rounded-2xl w-[500px] max-w-[90vw] overflow-hidden shadow-2xl">
        {/* Progress bar */}
        <div className="h-1 bg-tertiary">
          <div 
            className="h-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className={`w-14 h-14 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center shadow-lg`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
            <button 
              onClick={handleSkip}
              className="text-secondary hover:text-primary p-2 hover:bg-tertiary rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="tour-content">
            <span className="text-accent text-sm font-medium mb-2 block">
              Step {currentStep + 1} of {tourSteps.length}
            </span>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {step.title}
            </h2>
            <p className="text-secondary leading-relaxed mb-8">
              {step.description}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 text-secondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex gap-1">
              {tourSteps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentStep ? 'bg-accent' : 'bg-[#273155]'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#4F46E5] hover:bg-accent-hover text-white rounded-xl font-medium transition-colors"
            >
              {currentStep === tourSteps.length - 1 ? 'Get Started' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Skip option */}
        <div className="px-8 pb-4 text-center">
          <button 
            onClick={handleSkip}
            className="text-secondary hover:text-primary text-sm transition-colors"
          >
            Skip tour
          </button>
        </div>
      </div>
    </div>
  );
}
