export type SupportTicket = {
  id: string;
  school_id: string;
  school_name: string;
  subject: string;
  preview: string | null;
  status: string;
  category: string;
  unread_for_admin: number;
  last_message_at: string;
};

export type SupportMessage = {
  id: string;
  ticket_id: string;
  author_type: 'admin' | 'school' | string;
  author_id: string;
  content: string;
  created_at: string;
};

export const SUPPORT_STATUS_LABEL_KEYS: Record<string, string> = {
  open: 'dash.support.status.open',
  awaiting_admin: 'dash.support.status.awaitingAdmin',
  awaiting_school: 'dash.support.status.awaitingSchool',
  resolved: 'dash.support.status.resolved',
  closed: 'dash.support.status.closed',
};

export const SUPPORT_STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  open:            { bg: '#fde68a', fg: '#92400e' },
  awaiting_admin:  { bg: '#fde68a', fg: '#92400e' },
  awaiting_school: { bg: '#bfdbfe', fg: '#1e40af' },
  resolved:        { bg: '#bbf7d0', fg: '#166534' },
  closed:          { bg: '#e5e7eb', fg: '#374151' },
};
