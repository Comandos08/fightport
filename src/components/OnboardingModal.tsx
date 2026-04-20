import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/hooks/useAuth';

const MODAL_KEY = (sid: string) => `fp_onboarding_modal_seen_${sid}`;

export function OnboardingModal() {
  const { user } = useAuth();
  const { steps, hidden, loading } = useOnboarding();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading || hidden || !user) return;
    const seen = localStorage.getItem(MODAL_KEY(user.id));
    if (!seen) {
      localStorage.setItem(MODAL_KEY(user.id), '1');
      setOpen(true);
    }
  }, [loading, hidden, user?.id]);

  if (!user) return null;

  const handleStart = () => {
    setOpen(false);
    setTimeout(() => window.dispatchEvent(new Event('fp:onboarding:open')), 200);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md" style={{ fontFamily: 'var(--font-sans)' }}>
        <DialogHeader>
          <div className="text-5xl text-center mb-2">🥋</div>
          <DialogTitle className="text-center text-xl">Bem-vindo ao FightPort!</DialogTitle>
          <DialogDescription className="text-center">
            Siga os primeiros passos para certificar suas primeiras graduações.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 my-2">
          {steps.map((s, i) => (
            <li key={s.id} className="flex items-center gap-3 text-sm text-[var(--color-text)]">
              <span className="w-6 h-6 rounded-full bg-[var(--color-bg-soft)] flex items-center justify-center text-xs font-medium">
                {i + 1}
              </span>
              {s.label}
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2 mt-2">
          <Button onClick={handleStart}>Começar agora</Button>
          <button
            onClick={() => setOpen(false)}
            className="text-sm text-[var(--color-text-muted)] hover:underline"
          >
            Pular por enquanto
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
