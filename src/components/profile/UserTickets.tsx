
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Ticket as TicketIcon, Trophy, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserTicket {
  id: string;
  draw_id: string;
  ticket_number: string;
  price: number;
  purchased_at: string;
  draw_title?: string;
  draw_status?: string;
}

const UserTickets: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchUserTickets = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('tickets')
          .select(`
            id,
            draw_id,
            ticket_number,
            price,
            purchased_at,
            draws:draw_id (
              title,
              status
            )
          `)
          .eq('user_id', user.id)
          .order('purchased_at', { ascending: false });

        if (error) throw error;

        const formattedTickets = data.map(ticket => ({
          id: ticket.id,
          draw_id: ticket.draw_id,
          ticket_number: ticket.ticket_number,
          price: ticket.price,
          purchased_at: ticket.purchased_at,
          draw_title: ticket.draws?.title || 'Unknown Draw',
          draw_status: ticket.draws?.status || 'unknown'
        }));

        setTickets(formattedTickets);
      } catch (error) {
        console.error('Error fetching user tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTickets();
  }, [user?.id]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="default">{t('profile.tickets.active')}</Badge>;
      case 'announced':
        return <Badge variant="secondary">{t('profile.tickets.completed')}</Badge>;
      case 'closed':
        return <Badge variant="destructive">{t('profile.tickets.closed')}</Badge>;
      default:
        return <Badge variant="outline">{t('profile.tickets.unknown')}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TicketIcon className="h-5 w-5" />
            {t('profile.tickets.myTickets')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TicketIcon className="h-5 w-5" />
            {t('profile.tickets.myTickets')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TicketIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{t('profile.tickets.noTicketsYet')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TicketIcon className="h-5 w-5" />
          {t('profile.tickets.ticketsCount', { count: tickets.length })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-card"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                  <span className="font-bold text-primary">#{ticket.ticket_number}</span>
                </div>
                <div>
                  <p className="font-medium">{ticket.draw_title}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(ticket.purchased_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  {getStatusBadge(ticket.draw_status || 'unknown')}
                  <span className="font-medium">${ticket.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserTickets;
