
-- Foreign keys (only if not already present)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'practitioners_school_id_fkey') THEN
    ALTER TABLE public.practitioners ADD CONSTRAINT practitioners_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'achievements_practitioner_id_fkey') THEN
    ALTER TABLE public.achievements ADD CONSTRAINT achievements_practitioner_id_fkey FOREIGN KEY (practitioner_id) REFERENCES public.practitioners(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'achievements_school_id_fkey') THEN
    ALTER TABLE public.achievements ADD CONSTRAINT achievements_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'head_coaches_school_id_fkey') THEN
    ALTER TABLE public.head_coaches ADD CONSTRAINT head_coaches_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'credits_school_id_fkey') THEN
    ALTER TABLE public.credits ADD CONSTRAINT credits_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'credit_transactions_school_id_fkey') THEN
    ALTER TABLE public.credit_transactions ADD CONSTRAINT credit_transactions_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'credit_transactions_achievement_id_fkey') THEN
    ALTER TABLE public.credit_transactions ADD CONSTRAINT credit_transactions_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Triggers (drop if exist, then create)
DROP TRIGGER IF EXISTS trigger_debit_credit ON public.achievements;
CREATE TRIGGER trigger_debit_credit
  BEFORE INSERT ON public.achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.debit_credit_on_achievement();

DROP TRIGGER IF EXISTS trigger_update_belt ON public.achievements;
CREATE TRIGGER trigger_update_belt
  AFTER INSERT ON public.achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_current_belt();

-- Public read for schools (needed for public athlete profile)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'schools_public_read' AND tablename = 'schools') THEN
    CREATE POLICY "schools_public_read" ON public.schools FOR SELECT USING (true);
  END IF;
END $$;

-- Public read for head_coaches (needed for public athlete profile)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'head_coaches_public_read' AND tablename = 'head_coaches') THEN
    CREATE POLICY "head_coaches_public_read" ON public.head_coaches FOR SELECT USING (true);
  END IF;
END $$;

-- Unique constraint on fp_id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'practitioners_fp_id_key') THEN
    ALTER TABLE public.practitioners ADD CONSTRAINT practitioners_fp_id_key UNIQUE (fp_id);
  END IF;
END $$;

-- Unique constraint on credits.school_id (one row per school)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'credits_school_id_key') THEN
    ALTER TABLE public.credits ADD CONSTRAINT credits_school_id_key UNIQUE (school_id);
  END IF;
END $$;
