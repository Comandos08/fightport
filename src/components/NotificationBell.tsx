import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface NotificationRow {
  id: string;
  recipient_id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: notifications = [] } = useQuery<NotificationRow[]>({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as NotificationRow[];
    },
    enabled: !!user,
  });

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // Realtime: escuta inserts para o usuário
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ['notifications', user.id] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, qc]);

  const handleClickItem = async (n: NotificationRow) => {
    // Marca como lida (otimista) e navega
    if (!n.read) {
      qc.setQueryData<NotificationRow[]>(['notifications', user?.id], (prev) =>
        (prev ?? []).map((it) => (it.id === n.id ? { ...it, read: true } : it))
      );
      supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', n.id)
        .then(({ error }) => {
          if (error) console.warn('[notifications] mark read failed:', error.message);
        });
    }
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const handleMarkAllRead = async () => {
    if (!user || unreadCount === 0) return;
    qc.setQueryData<NotificationRow[]>(['notifications', user.id], (prev) =>
      (prev ?? []).map((it) => ({ ...it, read: true }))
    );
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('recipient_id', user.id)
      .eq('read', false);
    if (error) {
      console.warn('[notifications] mark all read failed:', error.message);
      qc.invalidateQueries({ queryKey: ['notifications', user.id] });
    }
  };

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Notificações"
          style={{
            position: 'relative',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            padding: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 6,
          }}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                minWidth: 16,
                height: 16,
                padding: '0 4px',
                borderRadius: 999,
                background: '#D8421A',
                color: '#FFFFFF',
                fontFamily: 'var(--font-sans)',
                fontSize: 10,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="p-0"
        style={{ width: 360, maxWidth: 'calc(100vw - 24px)' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--color-text)',
            }}
          >
            Notificações
          </span>
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              color: unreadCount === 0 ? 'var(--color-text-muted)' : 'var(--color-text)',
              background: 'none',
              border: 'none',
              cursor: unreadCount === 0 ? 'default' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: 4,
            }}
          >
            <CheckCheck className="h-3 w-3" />
            Marcar todas como lidas
          </button>
        </div>
        <div style={{ maxHeight: 420, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <div
              style={{
                padding: 24,
                textAlign: 'center',
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                color: 'var(--color-text-muted)',
              }}
            >
              Nenhuma notificação
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClickItem(n)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  border: 'none',
                  borderBottom: '1px solid var(--color-border)',
                  background: n.read ? 'transparent' : 'var(--color-bg-soft)',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 13,
                    fontWeight: n.read ? 500 : 600,
                    color: 'var(--color-text)',
                    marginBottom: 2,
                  }}
                >
                  {n.title}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12,
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.4,
                    marginBottom: 4,
                  }}
                >
                  {n.body}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 10,
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {formatDistanceToNow(new Date(n.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationBell;
