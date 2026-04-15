
DROP VIEW IF EXISTS public.practitioners_public;

CREATE VIEW public.practitioners_public AS
SELECT
  p.id,
  p.fp_id,
  p.first_name,
  p.last_name,
  p.current_belt,
  p.martial_art,
  p.school_id,
  p.photo_url,
  p.created_at,
  p.updated_at,
  s.name AS school_name,
  s.martial_art AS school_martial_art
FROM public.practitioners p
LEFT JOIN public.schools s ON s.id = p.school_id;

GRANT SELECT ON public.practitioners_public TO anon;
GRANT SELECT ON public.practitioners_public TO authenticated;
