import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { 
  Wallet, 
  LogOut, 
  User, 
  DollarSign, 
  Upload, 
  CreditCard, 
  ArrowLeftRight, 
  Building, 
  Banknote,
  Bitcoin,
  Image
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { uploadToS3 } from '@/utils/s3Utils';

const uploadMedia = async (file: File) => {
  return new Promise<{ url: string; name: string }>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      setTimeout(() => {
        resolve({
          url: reader.result as string,
          name: file.name
        });
      }, 500);
    };
    reader.readAsDataURL(file);
  });
};

type PaymentMethod = 'regular' | 'card' | 'whish' | 'western-union' | 'usdt';

const Profile: React.FC = () => {
  const { user, logout, updateProfile, addFunds, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const unsplashInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [unsplashUrl, setUnsplashUrl] = useState(user?.avatar_url || '');
  const [amount, setAmount] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('regular');
  const [isUploading, setIsUploading] = useState(false);
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [showCryptoDetails, setShowCryptoDetails] = useState(false);
  
  // Update local state when user data changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatarUrl(user.avatar || '');
      setUnsplashUrl(user.avatar_url || '');
    }
  }, [user]);
  
  const form = useForm({
    defaultValues: {
      paymentMethod: 'regular'
    }
  });
  
  if (!user) {
    navigate('/auth');
    return null;
  }
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Logout failed',
        description: 'There was an error logging out.',
      });
      console.error(error);
    }
  };
  
  const handleUpdateProfile = async () => {
    try {
      await updateProfile({ 
        name, 
        avatar: avatarUrl,
        avatar_url: unsplashUrl
      });
      setIsEditing(false);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'There was an error updating your profile.',
      });
      console.error(error);
    }
  };
  
  const handleAddFunds = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid amount',
        description: 'Please enter a valid amount.',
      });
      return;
    }
    
    if (paymentMethod === 'usdt') {
      setShowCryptoDetails(true);
      return;
    }
    
    try {
      await addFunds(Number(amount));
      setAmount('');
      toast({
        title: 'Funds added',
        description: `$${amount} has been added to your wallet using ${getPaymentMethodLabel(paymentMethod)}.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Transaction failed',
        description: 'There was an error adding funds.',
      });
      console.error(error);
    }
  };

  const handleCryptoPaymentConfirm = async () => {
    if (!cryptoAddress || cryptoAddress.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Invalid transaction hash',
        description: 'Please enter a valid transaction hash.',
      });
      return;
    }
    
    try {
      await addFunds(Number(amount));
      setAmount('');
      setCryptoAddress('');
      setShowCryptoDetails(false);
      
      toast({
        title: 'Crypto payment confirmed',
        description: `$${amount} has been added to your wallet using USDT.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Transaction verification failed',
        description: 'There was an error verifying your crypto transaction.',
      });
      console.error(error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      
      const { url, name } = await uploadToS3(files[0], 'profile_images');
      setAvatarUrl(url);
      
      toast({
        title: 'Image uploaded',
        description: `${name} has been uploaded successfully.`,
      });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'There was an error uploading your avatar.',
      });
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleUnsplashUrlUpdate = () => {
    if (!unsplashInputRef.current?.value) {
      toast({
        variant: 'destructive',
        title: 'Invalid URL',
        description: 'Please enter a valid Unsplash image URL.',
      });
      return;
    }
    
    setUnsplashUrl(unsplashInputRef.current.value);
    toast({
      title: 'Unsplash URL added',
      description: 'The Unsplash image URL has been saved.',
    });
  };
  
  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    switch (method) {
      case 'card':
        return 'Credit/Debit Card';
      case 'whish':
        return 'Whish Money Transfer';
      case 'western-union':
        return 'Western Union / OMT';
      case 'usdt':
        return 'USDT (Tether)';
      default:
        return 'Regular Payment';
    }
  };
  
  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'card':
        return <CreditCard className="h-5 w-5 text-gold" />;
      case 'whish':
        return <ArrowLeftRight className="h-5 w-5 text-gold" />;
      case 'western-union':
        return <Building className="h-5 w-5 text-gold" />;
      case 'usdt':
        return <Bitcoin className="h-5 w-5 text-gold" />;
      default:
        return <Banknote className="h-5 w-5 text-gold" />;
    }
  };
  
  const cryptoInstructions = (
    <div className="mt-4 p-4 border border-gold/30 rounded-md bg-black-light/20">
      <h3 className="font-semibold mb-2">USDT Payment Instructions</h3>
      <p className="text-sm mb-4">Send USDT to the following address:</p>
      
      <div className="bg-black-light/30 p-3 rounded-md mb-4 break-all font-mono text-xs">
        TUr9RRmcMSvEdrxZsXLjn5YhwTX5KKx2WD
      </div>
      
      <div className="space-y-4 mb-4">
        <div>
          <Label htmlFor="txhash" className="text-sm">Transaction Hash</Label>
          <Input
            id="txhash"
            value={cryptoAddress}
            onChange={(e) => setCryptoAddress(e.target.value)}
            placeholder="Enter your transaction hash"
            className="border-gold/30 focus:border-gold mt-1"
          />
          <p className="text-xs text-gray-400 mt-1">
            After sending the payment, paste the transaction hash here to verify your payment.
          </p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={handleCryptoPaymentConfirm}
          disabled={!cryptoAddress}
          className="bg-gold hover:bg-gold-dark text-black"
        >
          Confirm Payment
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowCryptoDetails(false)}
          className="border-gold/30 text-gold hover:text-gold-dark"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                {/* Show Unsplash avatar if available, otherwise fall back to uploaded avatar */}
                <AvatarImage src={unsplashUrl || user.avatar} alt={user.name} />
                <AvatarFallback className="text-lg bg-gold/20">
                  {user.name?.slice(0, 2) || 'U'}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="absolute -bottom-2 -right-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="rounded-full w-8 h-8 p-0 bg-background border-gold/30"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 text-gold" />
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border-gold/30 focus:border-gold"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="avatar">Avatar URL</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="avatar"
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          className="border-gold/30 focus:border-gold"
                          placeholder="URL will appear here after upload"
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        className="border-gold/30 text-gold hover:text-gold-dark"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>
                  
                  {/* New Unsplash URL input */}
                  <div>
                    <Label htmlFor="unsplashUrl">Unsplash Image URL</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="unsplashUrl"
                          ref={unsplashInputRef}
                          defaultValue={unsplashUrl}
                          className="border-gold/30 focus:border-gold"
                          placeholder="Enter Unsplash image URL"
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        className="border-gold/30 text-gold hover:text-gold-dark"
                        onClick={handleUnsplashUrlUpdate}
                      >
                        <Image className="h-4 w-4 mr-2" />
                        Add URL
                      </Button>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      Example: https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead
                    </p>
                  </div>
                  
                  {/* Preview section for both types of images */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {avatarUrl && (
                      <div className="mt-2 w-full overflow-hidden rounded border border-gray-200">
                        <p className="text-xs text-gray-400 p-1 bg-black-light/30">Uploaded Avatar</p>
                        <img src={avatarUrl} alt="Uploaded avatar preview" className="w-full object-cover max-h-40" />
                      </div>
                    )}
                    
                    {unsplashUrl && (
                      <div className="mt-2 w-full overflow-hidden rounded border border-gray-200">
                        <p className="text-xs text-gray-400 p-1 bg-black-light/30">Unsplash Avatar</p>
                        <img 
                          src={unsplashUrl} 
                          alt="Unsplash avatar preview" 
                          className="w-full object-cover max-h-40"
                          onError={(e) => {
                            toast({
                              variant: 'destructive',
                              title: 'Invalid image URL',
                              description: 'Could not load the Unsplash image. Please check the URL and try again.'
                            });
                            e.currentTarget.src = "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead";
                          }} 
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={loading}
                      className="bg-gold hover:bg-gold-dark text-black"
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="border-gold/30 text-gold hover:text-gold-dark"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  
                  {user.avatar_url && (
                    <div>
                      <p className="text-sm text-gray-500">Using Unsplash Avatar</p>
                      <p className="font-medium text-xs text-gold truncate">{user.avatar_url}</p>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-gold hover:bg-gold-dark text-black"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Wallet className="h-5 w-5 mr-2 text-gold" />
              Wallet Balance
            </h2>
            <div className="text-2xl font-bold text-gold">${user.wallet.toFixed(2)}</div>
          </div>
          
          {!showCryptoDetails ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Add Funds</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="pl-10 border-gold/30 focus:border-gold"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setAmount('5')}
                  className="border-gold/30 text-gold hover:text-gold-dark"
                >
                  $5
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setAmount('10')}
                  className="border-gold/30 text-gold hover:text-gold-dark"
                >
                  $10
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setAmount('20')}
                  className="border-gold/30 text-gold hover:text-gold-dark"
                >
                  $20
                </Button>
              </div>
              
              <div>
                <Label>Payment Method</Label>
                <Form {...form}>
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-3 mt-2">
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value: PaymentMethod) => {
                              setPaymentMethod(value);
                              field.onChange(value);
                            }}
                            value={paymentMethod}
                            className="grid grid-cols-1 md:grid-cols-2 gap-3"
                          >
                            <div className="border border-gold/30 rounded-md p-4 hover:bg-black-light/30 cursor-pointer transition-colors">
                              <FormLabel className="cursor-pointer flex items-center gap-2">
                                <RadioGroupItem value="regular" className="text-gold" />
                                <Banknote className="h-5 w-5 text-gold" />
                                <span>Bank Transfer</span>
                              </FormLabel>
                            </div>
                            
                            <div className="border border-gold/30 rounded-md p-4 hover:bg-black-light/30 cursor-pointer transition-colors">
                              <FormLabel className="cursor-pointer flex items-center gap-2">
                                <RadioGroupItem value="card" className="text-gold" />
                                <CreditCard className="h-5 w-5 text-gold" />
                                <span>Visa/Mastercard</span>
                              </FormLabel>
                            </div>
                            
                            <div className="border border-gold/30 rounded-md p-4 hover:bg-black-light/30 cursor-pointer transition-colors">
                              <FormLabel className="cursor-pointer flex items-center gap-2">
                                <RadioGroupItem value="whish" className="text-gold" />
                                <ArrowLeftRight className="h-5 w-5 text-gold" />
                                <span>Whish Money Transfer</span>
                              </FormLabel>
                            </div>
                            
                            <div className="border border-gold/30 rounded-md p-4 hover:bg-black-light/30 cursor-pointer transition-colors">
                              <FormLabel className="cursor-pointer flex items-center gap-2">
                                <RadioGroupItem value="western-union" className="text-gold" />
                                <Building className="h-5 w-5 text-gold" />
                                <span>Western Union / OMT</span>
                              </FormLabel>
                            </div>
                            
                            <div className="border border-gold/30 rounded-md p-4 hover:bg-black-light/30 cursor-pointer transition-colors col-span-1 md:col-span-2">
                              <FormLabel className="cursor-pointer flex items-center gap-2">
                                <RadioGroupItem value="usdt" className="text-gold" />
                                <Bitcoin className="h-5 w-5 text-gold" />
                                <span>USDT (Tether)</span>
                              </FormLabel>
                            </div>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </Form>
              </div>
              
              <Button
                onClick={handleAddFunds}
                disabled={loading || !amount}
                className="w-full bg-gold hover:bg-gold-dark text-black"
              >
                {getPaymentMethodIcon(paymentMethod)}
                Pay with {getPaymentMethodLabel(paymentMethod)}
              </Button>
            </div>
          ) : (
            cryptoInstructions
          )}
        </CardContent>
      </Card>
      
      <Button 
        variant="outline" 
        onClick={handleLogout}
        className="border-red-300 text-red-500 hover:text-red-700 w-full"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
};

export default Profile;
