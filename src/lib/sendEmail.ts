export async function sendEmail(args: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<void> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { error } = await supabase.functions.invoke('send-email', { body: args });
    if (error) console.warn('[sendEmail] invoke error:', error);
  } catch (e) {
    console.warn('[sendEmail] exception:', e);
  }
}
