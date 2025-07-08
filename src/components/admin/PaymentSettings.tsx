
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Wallet, Plus, Edit, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Wallet address form schema
const walletFormSchema = z.object({
  currency_code: z.string().min(2, {
    message: "Currency code must be at least 2 characters",
  }),
  currency_name: z.string().min(2, {
    message: "Currency name must be at least 2 characters",
  }),
  wallet_address: z.string().min(10, {
    message: "Wallet address must be at least 10 characters",
  }),
  network: z.string().default("mainnet"),
  is_active: z.boolean().default(true),
});

interface WalletAddress {
  id: string;
  currency_code: string;
  currency_name: string;
  wallet_address: string;
  network?: string;
  is_active: boolean;
}

const PaymentSettings: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [walletAddresses, setWalletAddresses] = useState<WalletAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingWallet, setEditingWallet] = useState<WalletAddress | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Common cryptocurrency options
  const cryptoOptions = [
    { code: 'BTC', name: 'Bitcoin' },
    { code: 'ETH', name: 'Ethereum' },
    { code: 'USDT', name: 'Tether' },
    { code: 'USDC', name: 'USD Coin' },
    { code: 'BNB', name: 'Binance Coin' },
    { code: 'ADA', name: 'Cardano' },
    { code: 'DOT', name: 'Polkadot' },
    { code: 'MATIC', name: 'Polygon' },
  ];

  const networkOptions = [
    { value: 'mainnet', label: 'Mainnet' },
    { value: 'testnet', label: 'Testnet' },
    { value: 'polygon', label: 'Polygon' },
    { value: 'bsc', label: 'Binance Smart Chain' },
    { value: 'arbitrum', label: 'Arbitrum' },
    { value: 'optimism', label: 'Optimism' },
  ];

  const form = useForm<z.infer<typeof walletFormSchema>>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: {
      currency_code: "",
      currency_name: "",
      wallet_address: "",
      network: "mainnet",
      is_active: true,
    },
  });

  const fetchWalletAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_wallet_addresses')
        .select('*')
        .order('currency_code');

      if (error) throw error;
      setWalletAddresses(data || []);
    } catch (error) {
      console.error('Error fetching wallet addresses:', error);
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: t('admin.payments.failedToLoadWallets'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletAddresses();
  }, []);

  const onSubmit = async (data: z.infer<typeof walletFormSchema>) => {
    try {
      if (editingWallet) {
        // Update existing wallet
        const { error } = await supabase
          .from('admin_wallet_addresses')
          .update({
            currency_code: data.currency_code,
            currency_name: data.currency_name,
            wallet_address: data.wallet_address,
            network: data.network,
            is_active: data.is_active,
          })
          .eq('id', editingWallet.id);

        if (error) throw error;

        toast({
          title: t('admin.payments.walletUpdated'),
          description: t('admin.payments.walletUpdatedDescription'),
        });
      } else {
        // Create new wallet
        const { error } = await supabase
          .from('admin_wallet_addresses')
          .insert({
            currency_code: data.currency_code,
            currency_name: data.currency_name,
            wallet_address: data.wallet_address,
            network: data.network,
            is_active: data.is_active,
          });

        if (error) throw error;

        toast({
          title: t('admin.payments.walletAdded'),
          description: t('admin.payments.walletAddedDescription'),
        });
      }

      form.reset();
      setEditingWallet(null);
      setShowForm(false);
      fetchWalletAddresses();
    } catch (error: any) {
      console.error('Error saving wallet:', error);
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message || t('admin.payments.failedToSaveWallet'),
      });
    }
  };

  const handleEdit = (wallet: WalletAddress) => {
    setEditingWallet(wallet);
    form.reset({
      currency_code: wallet.currency_code,
      currency_name: wallet.currency_name,
      wallet_address: wallet.wallet_address,
      network: wallet.network || 'mainnet',
      is_active: wallet.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (walletId: string) => {
    try {
      const { error } = await supabase
        .from('admin_wallet_addresses')
        .delete()
        .eq('id', walletId);

      if (error) throw error;

      toast({
        title: t('admin.payments.walletDeleted'),
        description: t('admin.payments.walletDeletedDescription'),
      });

      fetchWalletAddresses();
    } catch (error: any) {
      console.error('Error deleting wallet:', error);
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message || t('admin.payments.failedToDeleteWallet'),
      });
    }
  };

  const handleCurrencySelect = (currencyCode: string) => {
    const crypto = cryptoOptions.find(c => c.code === currencyCode);
    if (crypto) {
      form.setValue('currency_code', crypto.code);
      form.setValue('currency_name', crypto.name);
    }
  };

  const cancelForm = () => {
    form.reset();
    setEditingWallet(null);
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2 text-white">
            <Wallet className="h-6 w-6" />
            {t('admin.payments.title')}
          </h2>
          <p className="text-muted-foreground mt-1 text-white">
            {t('admin.payments.description')}
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t('admin.payments.addWallet')}
        </Button>
      </div>

      {/* Wallet Address Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingWallet ? t('admin.payments.editWalletAddress') : t('admin.payments.addNewWalletAddress')}
            </CardTitle>
            <CardDescription>
              {t('admin.payments.walletFormDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="currency_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.payments.cryptocurrency')}</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={handleCurrencySelect}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('admin.payments.selectCryptocurrency')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cryptoOptions.map((crypto) => (
                              <SelectItem key={crypto.code} value={crypto.code}>
                                {crypto.code} - {crypto.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {t('admin.payments.selectCryptocurrencyDescription')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="network"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.payments.network')}</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('admin.payments.selectNetwork')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {networkOptions.map((network) => (
                              <SelectItem key={network.value} value={network.value}>
                                {network.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {t('admin.payments.selectNetworkDescription')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="wallet_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.payments.walletAddress')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('admin.payments.enterWalletAddress')}
                          {...field}
                          className="font-mono text-sm"
                        />
                      </FormControl>
                      <FormDescription>
                        {t('admin.payments.walletAddressDescription')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {t('admin.payments.activeWallet')}
                        </FormLabel>
                        <FormDescription>
                          {t('admin.payments.activeWalletDescription')}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-3">
                  <Button type="submit">
                    {editingWallet ? t('admin.payments.updateWallet') : t('admin.payments.addWallet')}
                  </Button>
                  <Button type="button" variant="outline" onClick={cancelForm}>
                    {t('common.cancel')}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Existing Wallet Addresses */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.payments.configuredWalletAddresses')}</CardTitle>
          <CardDescription>
            {t('admin.payments.manageWalletAddresses')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {walletAddresses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('admin.payments.noWalletAddressesConfigured')}</p>
              <p className="text-sm">{t('admin.payments.addFirstWalletAddress')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {walletAddresses.map((wallet) => (
                <div
                  key={wallet.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold">
                        {wallet.currency_code} - {wallet.currency_name}
                      </span>
                      {wallet.network && (
                        <span className="text-xs bg-secondary px-2 py-1 rounded">
                          {wallet.network}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded ${wallet.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                        {wallet.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono break-all">
                      {wallet.wallet_address}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(wallet)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(wallet.id)}
                      className="flex items-center gap-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default PaymentSettings;
