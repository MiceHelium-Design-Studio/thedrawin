
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Ticket as TicketIcon, Users, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface AdminTicket {
  id: string;
  draw_id: string;
  ticket_number: string;
  price: number;
  purchased_at: string;
  user_name?: string;
  user_email?: string;
  draw_title?: string;
  draw_status?: string;
}

const TicketsOverview: React.FC = () => {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedDraw, setSelectedDraw] = useState<string>('all');
  const [draws, setDraws] = useState<Array<{id: string, title: string}>>([]);

  useEffect(() => {
    const fetchTicketsAndDraws = async () => {
      try {
        // Fetch draws for filter
        const { data: drawsData, error: drawsError } = await supabase
          .from('draws')
          .select('id, title')
          .order('created_at', { ascending: false });

        if (drawsError) throw drawsError;
        setDraws(drawsData || []);

        // Fetch tickets with related data - using separate queries to avoid relation issues
        const { data: ticketsData, error: ticketsError } = await supabase
          .from('tickets')
          .select(`
            id,
            draw_id,
            ticket_number,
            price,
            purchased_at,
            user_id
          `)
          .order('purchased_at', { ascending: false });

        if (ticketsError) throw ticketsError;

        // Fetch user profiles separately
        const userIds = [...new Set(ticketsData?.map(t => t.user_id).filter(Boolean))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', userIds);

        if (profilesError) {
          console.warn('Could not fetch profiles:', profilesError);
        }

        // Fetch draws data separately
        const drawIds = [...new Set(ticketsData?.map(t => t.draw_id).filter(Boolean))];
        const { data: drawsDetailsData, error: drawsDetailsError } = await supabase
          .from('draws')
          .select('id, title, status')
          .in('id', drawIds);

        if (drawsDetailsError) {
          console.warn('Could not fetch draw details:', drawsDetailsError);
        }

        // Combine the data
        const formattedTickets = ticketsData?.map(ticket => {
          const profile = profilesData?.find(p => p.id === ticket.user_id);
          const draw = drawsDetailsData?.find(d => d.id === ticket.draw_id);
          
          return {
            id: ticket.id,
            draw_id: ticket.draw_id,
            ticket_number: ticket.ticket_number,
            price: ticket.price,
            purchased_at: ticket.purchased_at,
            user_name: profile?.name || t('admin.tickets.unknownUser'),
            user_email: profile?.email || t('admin.tickets.noEmail'),
            draw_title: draw?.title || t('admin.tickets.unknownDraw'),
            draw_status: draw?.status || 'unknown'
          };
        }) || [];

        setTickets(formattedTickets);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        toast({
          variant: 'destructive',
          title: t('admin.tickets.errorLoadingTickets'),
          description: t('admin.tickets.failedToLoadTickets')
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTicketsAndDraws();
  }, []);

  const filteredTickets = selectedDraw === 'all' 
    ? tickets 
    : tickets.filter(ticket => ticket.draw_id === selectedDraw);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="default">{t('admin.tickets.status.active')}</Badge>;
      case 'announced':
        return <Badge variant="secondary">{t('admin.tickets.status.completed')}</Badge>;
      case 'closed':
        return <Badge variant="destructive">{t('admin.tickets.status.closed')}</Badge>;
      default:
        return <Badge variant="outline">{t('admin.tickets.status.unknown')}</Badge>;
    }
  };

  const totalRevenue = filteredTickets.reduce((sum, ticket) => sum + ticket.price, 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TicketIcon className="h-5 w-5" />
            {t('admin.tickets.title')}
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TicketIcon className="h-5 w-5" />
            {t('admin.tickets.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <TicketIcon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-white">{t('admin.tickets.totalTickets')}</span>
              </div>
              <p className="text-2xl font-bold text-white">{filteredTickets.length}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-white">{t('admin.tickets.uniquePlayers')}</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {new Set(filteredTickets.map(t => t.user_email)).size}
              </p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{t('admin.tickets.totalRevenue')}</span>
              </div>
              <p className="text-2xl font-bold text-white">${totalRevenue}</p>
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            <select
              value={selectedDraw}
              onChange={(e) => setSelectedDraw(e.target.value)}
              className="px-3 py-2 border rounded-md bg-[#1F1D36] text-white border-white/20"
            >
              <option value="all">{t('admin.tickets.allDraws')}</option>
              {draws.map(draw => (
                <option key={draw.id} value={draw.id}>
                  {draw.title}
                </option>
              ))}
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUserDetails(!showUserDetails)}
              className="flex items-center gap-2"
            >
              {showUserDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showUserDetails ? t('admin.tickets.hide') : t('admin.tickets.show')} {t('admin.tickets.userDetails')}
            </Button>
          </div>

          <div className="space-y-2">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-8">
                <TicketIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-white">{t('admin.tickets.noTicketsFound')}</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 border border-white/20 rounded-lg bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
                      <span className="font-bold text-primary">#{ticket.ticket_number}</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{ticket.draw_title}</p>
                      {showUserDetails && (
                        <div className="text-sm text-white/70">
                          <p>{ticket.user_name}</p>
                          <p>{ticket.user_email}</p>
                        </div>
                      )}
                      <p className="text-xs text-white/50">
                        {new Date(ticket.purchased_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(ticket.draw_status || 'unknown')}
                      <span className="font-medium text-white">${ticket.price}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketsOverview;
