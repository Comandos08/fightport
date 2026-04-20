import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface OnboardingStep {
  id: string;
  labelKey: string;
  descriptionKey: string;
  link: string;
  done: boolean;
}

const PASSPORT_KEY = (sid: string) => `fp_onboarding_passport_viewed_${sid}`;

export function useOnboarding() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [passportViewed, setPassportViewed] = useState(false);

  useEffect(() => {
    if (!user) return;
    setPassportViewed(localStorage.getItem(PASSPORT_KEY(user.id)) === '1');
  }, [user?.id]);

  const { data, isLoading } = useQuery({
    queryKey: ['onboarding', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const [schoolRes, practRes, achRes, txRes, firstPract] = await Promise.all([
        supabase.from('schools').select('logo_url, onboarding_dismissed').eq('id', user.id).single(),
        supabase.from('practitioners').select('id', { count: 'exact', head: true }).eq('school_id', user.id),
        supabase.from('achievements').select('id', { count: 'exact', head: true }).eq('school_id', user.id),
        supabase.from('credit_transactions').select('id', { count: 'exact', head: true }).eq('school_id', user.id).eq('type', 'purchase'),
        supabase.from('practitioners').select('id').eq('school_id', user.id).limit(1).maybeSingle(),
      ]);
      return {
        hasLogo: !!schoolRes.data?.logo_url,
        dismissed: !!schoolRes.data?.onboarding_dismissed,
        practitionerCount: practRes.count ?? 0,
        achievementCount: achRes.count ?? 0,
        purchaseCount: txRes.count ?? 0,
        firstPractitionerId: firstPract.data?.id ?? null,
      };
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  const markPassportViewed = () => {
    if (!user) return;
    localStorage.setItem(PASSPORT_KEY(user.id), '1');
    setPassportViewed(true);
  };

  const dismiss = async () => {
    if (!user) return;
    await supabase.from('schools').update({ onboarding_dismissed: true }).eq('id', user.id);
    qc.invalidateQueries({ queryKey: ['onboarding', user.id] });
  };

  const passportLink = data?.firstPractitionerId ? `/p/${data.firstPractitionerId}` : '/painel/praticantes';

  const steps: OnboardingStep[] = [
    { id: 'school', labelKey: 'onboarding.steps.school.label', descriptionKey: 'onboarding.steps.school.description', link: '/painel/configuracoes', done: !!data?.hasLogo },
    { id: 'practitioner', labelKey: 'onboarding.steps.practitioner.label', descriptionKey: 'onboarding.steps.practitioner.description', link: '/painel/praticantes/novo', done: (data?.practitionerCount ?? 0) > 0 },
    { id: 'achievement', labelKey: 'onboarding.steps.achievement.label', descriptionKey: 'onboarding.steps.achievement.description', link: '/painel/praticantes', done: (data?.achievementCount ?? 0) > 0 },
    { id: 'passport', labelKey: 'onboarding.steps.passport.label', descriptionKey: 'onboarding.steps.passport.description', link: passportLink, done: passportViewed },
    { id: 'credits', labelKey: 'onboarding.steps.credits.label', descriptionKey: 'onboarding.steps.credits.description', link: '/painel/creditos', done: (data?.purchaseCount ?? 0) > 0 },
  ];

  const allDone = steps.every((s) => s.done);
  const dismissed = !!data?.dismissed;
  const hidden = isLoading || !user || dismissed || allDone;

  return { steps, allDone, dismissed, dismiss, markPassportViewed, hidden, loading: isLoading };
}
