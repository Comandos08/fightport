
-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Schools
CREATE TABLE public.schools (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  martial_art   TEXT NOT NULL DEFAULT 'Jiu-Jitsu',
  city          TEXT,
  state         TEXT,
  logo_url      TEXT,
  email         TEXT UNIQUE NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Head Coaches
CREATE TABLE public.head_coaches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  graduation    TEXT NOT NULL DEFAULT 'Faixa Preta 1° Grau',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Practitioners
CREATE TABLE public.practitioners (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  fp_id           TEXT UNIQUE NOT NULL,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  birth_date      DATE,
  gender          TEXT CHECK (gender IN ('Masculino', 'Feminino', 'Outro')),
  cpf             TEXT,
  photo_url       TEXT,
  father_name     TEXT,
  mother_name     TEXT,
  martial_art     TEXT NOT NULL DEFAULT 'Jiu-Jitsu',
  current_belt    TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_practitioners_name ON public.practitioners(first_name, last_name);
CREATE INDEX idx_practitioners_school ON public.practitioners(school_id);
CREATE INDEX idx_practitioners_fp_id ON public.practitioners(fp_id);

-- Achievements
CREATE TABLE public.achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
  school_id       UUID NOT NULL REFERENCES public.schools(id),
  belt            TEXT NOT NULL,
  degree          INTEGER DEFAULT 0,
  graduation_date DATE NOT NULL,
  graduated_by    TEXT NOT NULL,
  notes           TEXT,
  hash            TEXT UNIQUE NOT NULL,
  credits_used    INTEGER DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_achievements_practitioner ON public.achievements(practitioner_id);
CREATE INDEX idx_achievements_school ON public.achievements(school_id);
CREATE INDEX idx_achievements_hash ON public.achievements(hash);

-- Credits
CREATE TABLE public.credits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   UUID UNIQUE NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  balance     INTEGER NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Credit Transactions
CREATE TABLE public.credit_transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus')),
  amount        INTEGER NOT NULL,
  package_name  TEXT,
  price_brl     NUMERIC(10,2),
  achievement_id UUID REFERENCES public.achievements(id),
  status        TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_school ON public.credit_transactions(school_id);

-- Function: generate FP_ID
CREATE OR REPLACE FUNCTION public.generate_fp_id()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  seq_part  TEXT;
  new_id    TEXT;
BEGIN
  LOOP
    seq_part := LPAD((FLOOR(RANDOM() * 999999) + 1)::TEXT, 6, '0');
    new_id := 'FP-' || year_part || '-' || seq_part;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.practitioners WHERE fp_id = new_id);
  END LOOP;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Function: generate achievement hash
CREATE OR REPLACE FUNCTION public.generate_achievement_hash(
  p_fp_id TEXT,
  p_belt TEXT,
  p_date DATE,
  p_school TEXT,
  p_professor TEXT
)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(
    digest(
      p_fp_id || '|' || p_belt || '|' || p_date::TEXT || '|' || p_school || '|' || p_professor || '|' || NOW()::TEXT,
      'sha256'
    ),
    'hex'
  );
END;
$$ LANGUAGE plpgsql;

-- Function: update current_belt trigger
CREATE OR REPLACE FUNCTION public.update_current_belt()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.practitioners
  SET current_belt = NEW.belt,
      updated_at = NOW()
  WHERE id = NEW.practitioner_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_belt
AFTER INSERT ON public.achievements
FOR EACH ROW EXECUTE FUNCTION public.update_current_belt();

-- Function: debit credit on achievement
CREATE OR REPLACE FUNCTION public.debit_credit_on_achievement()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT balance FROM public.credits WHERE school_id = NEW.school_id) < 1 THEN
    RAISE EXCEPTION 'Saldo de créditos insuficiente';
  END IF;

  UPDATE public.credits
  SET balance = balance - 1,
      updated_at = NOW()
  WHERE school_id = NEW.school_id;

  INSERT INTO public.credit_transactions (school_id, type, amount, achievement_id)
  VALUES (NEW.school_id, 'usage', -1, NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_debit_credit
BEFORE INSERT ON public.achievements
FOR EACH ROW EXECUTE FUNCTION public.debit_credit_on_achievement();

-- RLS
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.head_coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Schools: owner access
CREATE POLICY "school_own_data" ON public.schools
  FOR ALL USING (id = auth.uid());

-- Head coaches: school owner access
CREATE POLICY "head_coaches_school_access" ON public.head_coaches
  FOR ALL USING (school_id = auth.uid());

-- Practitioners: school can manage; public can read
CREATE POLICY "practitioners_school_access" ON public.practitioners
  FOR ALL USING (school_id = auth.uid());

CREATE POLICY "practitioners_public_read" ON public.practitioners
  FOR SELECT USING (true);

-- Achievements: school can insert; public can read
CREATE POLICY "achievements_school_write" ON public.achievements
  FOR INSERT WITH CHECK (school_id = auth.uid());

CREATE POLICY "achievements_public_read" ON public.achievements
  FOR SELECT USING (true);

-- Credits: school owner only
CREATE POLICY "credits_own" ON public.credits
  FOR ALL USING (school_id = auth.uid());

-- Credit transactions: school owner only
CREATE POLICY "transactions_own" ON public.credit_transactions
  FOR ALL USING (school_id = auth.uid());
