import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListChecks, X, CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

export function OnboardingChecklist() {
  const navigate = useNavigate();
  const { steps, allDone, hidden, dismiss, markPassportViewed } = useOnboarding();
  const [open, setOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [forceHide, setForceHide] = useState(false);

  // Listen for external trigger to expand (from modal)
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('fp:onboarding:open', handler);
    return () => window.removeEventListener('fp:onboarding:open', handler);
  }, []);

  // Celebrate when allDone becomes true
  useEffect(() => {
    if (allDone && !forceHide) {
      setCelebrate(true);
      const t = setTimeout(() => setForceHide(true), 3000);
      return () => clearTimeout(t);
    }
  }, [allDone, forceHide]);

  if (forceHide) return null;
  if (hidden && !celebrate) return null;

  const doneCount = steps.filter((s) => s.done).length;
  const remaining = steps.length - doneCount;
  const progress = (doneCount / steps.length) * 100;

  const handleStepClick = (step: typeof steps[0]) => {
    if (step.id === 'passport') markPassportViewed();
    navigate(step.link);
    setOpen(false);
  };

  if (celebrate) {
    return (
      <div className="fixed bottom-6 right-6 z-40 bg-white border border-[var(--color-border)] rounded-lg shadow-lg p-4 w-[280px]" style={{ fontFamily: 'var(--font-sans)' }}>
        <p className="text-sm font-medium text-[var(--color-text)]">Você está pronto! 🎉</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">Parabéns por completar todos os primeiros passos.</p>
      </div>
    );
  }

  if (!open) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setOpen(true)}
              className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[var(--color-text)] text-white shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
              aria-label="Primeiros passos"
            >
              <ListChecks className="w-6 h-6" />
              {remaining > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                  {remaining}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">Primeiros passos</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-[320px] bg-white border border-[var(--color-border)] rounded-lg shadow-xl" style={{ fontFamily: 'var(--font-sans)' }}>
      <div className="p-4 border-b border-[var(--color-border)]">
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-sm font-medium text-[var(--color-text)]">Primeiros passos 🥋</h3>
          <button onClick={() => setOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]" aria-label="Minimizar">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mb-2">{doneCount} de {steps.length} concluídos</p>
        <Progress value={progress} className="h-1.5" />
        <button onClick={dismiss} className="text-[11px] text-[var(--color-text-muted)] hover:underline mt-2">
          Dispensar
        </button>
      </div>
      <ul className="py-2 max-h-[360px] overflow-y-auto">
        {steps.map((step) => (
          <li key={step.id}>
            <button
              onClick={() => handleStepClick(step)}
              disabled={step.done}
              className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${step.done ? 'opacity-60 cursor-default' : 'hover:bg-[var(--color-bg-soft)]'}`}
            >
              {step.done ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-[var(--color-text-muted)] flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${step.done ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text)] font-medium'}`}>
                  {step.label}
                </p>
                {!step.done && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{step.description}</p>
                )}
              </div>
              {!step.done && <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0 mt-1" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
