import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Mail, X, Inbox } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DashPageHeader } from '@/components/dash/DashPageHeader';
import { DashSection } from '@/components/dash/DashSection';
import { DashTable, dashTd } from '@/components/dash/DashTable';

type ContactSubmission = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  organization: string | null;
  subject: string;
  message: string;
  status: string;
};

const fmtDateTime = (s: string) => {
  const d = new Date(s);
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
};

function StatusBadge({ status }: { status: string }) {
  const isNew = status === 'new' || status === 'pending';
  const bg = isNew ? '#FEF3C7' : '#E5E7EB';
  const color = isNew ? '#92400E' : '#374151';
  const label = isNew ? 'Novo' : 'Lido';
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 999,
        background: bg,
        color,
        fontFamily: 'var(--font-sans)',
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      {label}
    </span>
  );
}

export default function Contatos() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<ContactSubmission | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-contact-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ContactSubmission[];
    },
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ status: 'read' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-contact-submissions'] });
    },
  });

  const handleOpen = (item: ContactSubmission) => {
    setSelected(item);
    if (item.status !== 'read') markRead.mutate(item.id);
  };

  const headers = ['Data', 'Nome', 'Email', 'Organização', 'Assunto', 'Status'];

  return (
    <div>
      <DashPageHeader
        title="Contatos"
        subtitle={`${data.length} ${data.length === 1 ? 'mensagem recebida' : 'mensagens recebidas'}`}
      />

      <DashSection>
        <DashTable
          headers={headers}
          isLoading={isLoading}
          isEmpty={!isLoading && data.length === 0}
          emptyIcon={Inbox}
          emptyTitle="Nenhuma mensagem"
          emptyDescription="Quando alguém enviar uma mensagem pelo formulário de contato, ela aparecerá aqui."
        >
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => handleOpen(item)}
              style={{ cursor: 'pointer', transition: 'var(--transition)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-soft)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <td style={{ ...dashTd, whiteSpace: 'nowrap' }}>{fmtDateTime(item.created_at)}</td>
              <td style={{ ...dashTd, fontWeight: 500 }}>{item.name}</td>
              <td style={dashTd}>{item.email}</td>
              <td style={{ ...dashTd, color: 'var(--color-text-muted)' }}>{item.organization || '—'}</td>
              <td style={dashTd}>{item.subject}</td>
              <td style={dashTd}>
                <StatusBadge status={item.status} />
              </td>
            </tr>
          ))}
        </DashTable>
      </DashSection>

      {selected && (
        <>
          <div
            onClick={() => setSelected(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 50,
            }}
          />
          <aside
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              height: '100vh',
              width: '100%',
              maxWidth: 520,
              background: 'var(--color-bg)',
              borderLeft: '1px solid var(--color-border)',
              zIndex: 51,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Mail size={18} style={{ color: 'var(--color-text-muted)' }} />
                <h2
                  style={{
                    fontFamily: 'var(--font-display, var(--font-sans))',
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    margin: 0,
                  }}
                >
                  Detalhes do contato
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Fechar"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  color: 'var(--color-text-muted)',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              <Field label="Data" value={fmtDateTime(selected.created_at)} />
              <Field label="Status">
                <StatusBadge status={selected.status} />
              </Field>
              <Field label="Nome" value={selected.name} />
              <Field label="Email" value={selected.email} mono />
              <Field label="Organização" value={selected.organization || '—'} />
              <Field label="Assunto" value={selected.subject} />
              <div style={{ marginTop: 20 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--color-text-muted)',
                    marginBottom: 8,
                  }}
                >
                  Mensagem
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 14,
                    fontWeight: 300,
                    color: 'var(--color-text)',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    padding: 16,
                    background: 'var(--color-bg-soft)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  {selected.message}
                </div>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  mono,
  children,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--color-text-muted)',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      {children ?? (
        <div
          style={{
            fontFamily: mono ? 'var(--font-mono, monospace)' : 'var(--font-sans)',
            fontSize: 14,
            fontWeight: 400,
            color: 'var(--color-text)',
          }}
        >
          {value}
        </div>
      )}
    </div>
  );
}
