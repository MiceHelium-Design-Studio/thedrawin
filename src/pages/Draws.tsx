import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import DrawCard from '../components/draws/DrawCard';
import { useDraws } from '../context/DrawContext';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, ArrowLeft, Trophy, Target, CheckCircle, Clock } from 'lucide-react';

const Draws: React.FC = () => {
  const { draws, loading, error } = useDraws();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Filter and sort draws
  const filteredAndSortedDraws = useMemo(() => {
    if (!draws) return [];

    let filtered = draws.filter(draw => {
      const matchesSearch = draw.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        draw.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || draw.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort draws
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        case 'oldest':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'ending_soon':
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'price_high':
          return Math.max(...b.ticketPrices) - Math.max(...a.ticketPrices);
        case 'price_low':
          return Math.max(...a.ticketPrices) - Math.max(...b.ticketPrices);
        default:
          return 0;
      }
    });

    return filtered;
  }, [draws, searchTerm, statusFilter, sortBy]);

  // Get counts for different statuses
  const statusCounts = useMemo(() => {
    if (!draws) return { total: 0, active: 0, open: 0, completed: 0 };
    return {
      total: draws.length,
      active: draws.filter(d => d.status === 'active').length,
      open: draws.filter(d => d.status === 'open').length,
      completed: draws.filter(d => d.status === 'completed').length,
    };
  }, [draws]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] relative overflow-hidden">
        {/* Ambient effects */}
        <div className="fixed top-20 right-10 w-32 h-32 rounded-full blur-3xl animate-pulse opacity-20" style={{ background: 'rgba(243, 156, 10, 0.15)' }} />
        <div className="fixed bottom-40 left-20 w-40 h-40 rounded-full blur-3xl animate-pulse opacity-15" style={{ background: 'rgba(6, 182, 212, 0.12)', animationDelay: '2s' }} />

        <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-pulse space-y-8 w-full max-w-4xl">
              <div className="h-12 bg-gray-300 rounded-md dark:bg-gray-700 w-1/2 mx-auto"></div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-80 bg-gray-300 rounded-xl dark:bg-gray-700"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] relative overflow-hidden">
        <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="text-4xl">⚠️</div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Failed to Load Draws</h3>
            <p className="text-slate-400 mb-8">There was an error loading the draws. Please try again.</p>
            <Button onClick={() => window.location.reload()} className="luxury-button">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] relative overflow-hidden">
      {/* Enhanced ambient effects */}
      <div className="fixed top-20 right-10 w-32 h-32 rounded-full blur-3xl animate-pulse opacity-20" style={{ background: 'rgba(243, 156, 10, 0.15)' }} />
      <div className="fixed bottom-40 left-20 w-40 h-40 rounded-full blur-3xl animate-pulse opacity-15" style={{ background: 'rgba(6, 182, 212, 0.12)', animationDelay: '2s' }} />
      <div className="fixed top-1/2 left-10 w-24 h-24 rounded-full blur-2xl animate-pulse opacity-10" style={{ background: 'rgba(243, 156, 10, 0.08)', animationDelay: '4s' }} />

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Header Section */}
        <div className="mb-12">
          <Button
            variant="ghost"
            onClick={() => navigate('/home')}
            className="mb-6 pl-0 flex items-center text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F39C0A]/20 to-[#06B6D4]/10 rounded-xl flex items-center justify-center border border-[#F39C0A]/20">
                <Target className="h-6 w-6 text-[#F39C0A]" />
              </div>
              <h1 className="text-4xl font-bold text-white tracking-tight">
                All <span className="bg-gradient-to-r from-[#F39C0A] via-[#FFD700] to-[#F39C0A] bg-clip-text text-transparent">Draws</span>
              </h1>
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-[#F39C0A] to-[#06B6D4] rounded-full mx-auto mb-6" />
            <p className="text-slate-400 text-xl leading-relaxed max-w-2xl mx-auto">
              Discover all available draws and find your next opportunity to win
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="luxury-card">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Target className="h-6 w-6 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white">{statusCounts.total}</div>
                <div className="text-slate-400 text-sm">Total Draws</div>
              </CardContent>
            </Card>

            <Card className="luxury-card">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Trophy className="h-6 w-6 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-green-400">{statusCounts.active}</div>
                <div className="text-slate-400 text-sm">Active</div>
              </CardContent>
            </Card>

            <Card className="luxury-card">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-yellow-400">{statusCounts.open}</div>
                <div className="text-slate-400 text-sm">Open</div>
              </CardContent>
            </Card>

            <Card className="luxury-card">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-purple-400">{statusCounts.completed}</div>
                <div className="text-slate-400 text-sm">Completed</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="luxury-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-white mb-5">
              <Filter className="h-5 w-5 mr-2 text-[#F39C0A]" />
              Filter & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search draws..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="ending_soon">Ending Soon</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="price_high">Highest Prize</SelectItem>
                  <SelectItem value="price_low">Lowest Prize</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              {searchTerm && (
                <Badge variant="secondary" className="bg-[#F39C0A]/20 text-[#F39C0A] border-[#F39C0A]/30">
                  Search: "{searchTerm}"
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="secondary" className="bg-[#06B6D4]/20 text-[#06B6D4] border-[#06B6D4]/30">
                  Status: {statusFilter}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Draws Grid */}
        {filteredAndSortedDraws.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-[#F39C0A]/20 to-[#06B6D4]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#F39C0A]/20">
              <Search className="h-10 w-10 text-[#F39C0A]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No Draws Found</h3>
            <p className="text-slate-400 mb-8">
              {searchTerm || statusFilter !== 'all'
                ? "Try adjusting your search criteria or filters."
                : "No draws are currently available. Check back soon!"
              }
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="luxury-button"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-8 md:gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {filteredAndSortedDraws.map((draw, index) => (
              <div
                key={draw.id}
                className="luxury-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <DrawCard draw={draw} hideActions={true} />
              </div>
            ))}
          </div>
        )}

        {/* Results count */}
        {filteredAndSortedDraws.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-slate-400">
              Showing {filteredAndSortedDraws.length} of {draws?.length || 0} draws
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Draws; 