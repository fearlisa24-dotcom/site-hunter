CREATE TABLE public.ai_research_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id TEXT NOT NULL UNIQUE,
  business_name TEXT,
  report JSONB NOT NULL,
  model TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ai_research_cache_place ON public.ai_research_cache(place_id);
GRANT SELECT, INSERT, UPDATE ON public.ai_research_cache TO authenticated;
GRANT ALL ON public.ai_research_cache TO service_role;
ALTER TABLE public.ai_research_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read cached research" ON public.ai_research_cache FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert cached research" ON public.ai_research_cache FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "update cached research" ON public.ai_research_cache FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE TRIGGER ai_research_cache_updated BEFORE UPDATE ON public.ai_research_cache FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();