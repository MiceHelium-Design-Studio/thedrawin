
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface IndexUsageData {
  id: string;
  schema_name: string;
  table_name: string;
  index_name: string;
  idx_scan: number;
  idx_tup_read: number;
  idx_tup_fetch: number;
  log_time: string;
}

const AdminIndexUsage: React.FC = () => {
  const [data, setData] = useState<IndexUsageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchIndexUsageData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: indexData, error: fetchError } = await supabase
        .from('index_usage_log')
        .select('*')
        .order('log_time', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setData(indexData || []);
    } catch (err) {
      console.error('Error fetching index usage data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch index usage data'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndexUsageData();
  }, []);

  const getScanCountHighlight = (scanCount: number): string => {
    if (scanCount === 0) return 'bg-red-50 text-red-900';
    if (scanCount < 100) return 'bg-yellow-50 text-yellow-900';
    if (scanCount < 1000) return 'bg-blue-50 text-blue-900';
    return 'bg-green-50 text-green-900';
  };

  const getUnusedIndexes = (): IndexUsageData[] => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return data.filter(row => 
      row.idx_scan === 0 && new Date(row.log_time) < thirtyDaysAgo
    );
  };

  const exportToCSV = () => {
    if (data.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Data',
        description: 'No data available to export'
      });
      return;
    }

    const headers = ['Schema', 'Table', 'Index', 'Scan Count', 'Tuples Read', 'Tuples Fetched', 'Log Time'];
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        row.schema_name,
        row.table_name,
        row.index_name,
        row.idx_scan,
        row.idx_tup_read,
        row.idx_tup_fetch,
        new Date(row.log_time).toLocaleString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `index_usage_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Export Successful',
      description: 'Index usage data has been exported to CSV'
    });
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const formatDateTime = (dateTime: string): string => {
    return new Date(dateTime).toLocaleString();
  };

  const unusedIndexes = getUnusedIndexes();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse space-y-4 w-full max-w-4xl">
          <div className="h-8 bg-gray-300 rounded-md dark:bg-gray-700 w-1/3"></div>
          <div className="h-64 bg-gray-300 rounded-lg dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gold">Database Index Usage Statistics</h1>
          <div className="flex gap-2">
            <Button
              onClick={fetchIndexUsageData}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={exportToCSV}
              variant="default"
              size="sm"
              disabled={loading || data.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {unusedIndexes.length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Unused Indexes Detected</AlertTitle>
            <AlertDescription>
              {unusedIndexes.length} index(es) haven't been used and were last logged more than 30 days ago:
              <ul className="mt-2 ml-4 list-disc">
                {unusedIndexes.map(index => (
                  <li key={index.id}>
                    {index.schema_name}.{index.table_name}.{index.index_name}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="backdrop-blur-sm bg-card/90 shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl text-gold-light">
              Index Usage Data ({data.length} records)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No index usage data available
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Schema</TableHead>
                      <TableHead className="font-semibold">Table</TableHead>
                      <TableHead className="font-semibold">Index</TableHead>
                      <TableHead className="font-semibold text-right">Scan Count</TableHead>
                      <TableHead className="font-semibold text-right">Tuples Read</TableHead>
                      <TableHead className="font-semibold text-right">Tuples Fetched</TableHead>
                      <TableHead className="font-semibold">Log Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row) => (
                      <TableRow 
                        key={row.id} 
                        className={getScanCountHighlight(row.idx_scan)}
                      >
                        <TableCell className="font-medium">{row.schema_name}</TableCell>
                        <TableCell>{row.table_name}</TableCell>
                        <TableCell className="font-mono text-sm">{row.index_name}</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(row.idx_scan)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(row.idx_tup_read)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(row.idx_tup_fetch)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {formatDateTime(row.log_time)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-sm text-muted-foreground">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
              <span>0 scans (unused)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded"></div>
              <span>1-99 scans (low usage)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
              <span>100-999 scans (moderate usage)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
              <span>1000+ scans (high usage)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminIndexUsage;
