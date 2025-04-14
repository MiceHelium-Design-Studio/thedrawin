
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import AvatarWrapper from '@/components/ui/avatar-wrapper';
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
  Link as LinkIcon,
  Loader2
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
import { Textarea } from "@/components/ui/textarea";
import { uploadToS3 } from '@/utils/s3Utils';

const uploadMedia = async (file: File) => {
  try {
    console.log("Uploading file to S3:", file.name);
    // Use s3Utils to upload the file
    const { url } = await uploadToS3(file);
    console.log("Upload successful, URL:", url);
    return { url, name: file.name };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

const uploadFromUrl = async (url: string) => {
  try {
    console.log("Loading image from URL:", url);
    // For URL uploads, we'll just return the URL directly
    return { url, name: 'From URL' };
  } catch (error) {
    console.error("Error uploading from URL:", error);
    throw error;
  }
};

type PaymentMethod = 'regular' | 'card' | 'whish' | 'western-union';

const Profile: React.FC = () => {
  const { user, logout, updateProfile, addFunds, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [amount, setAmount] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('regular');
  const [uploadLoading, setUploadLoading] = useState(false);
  
  // Initialize form values from user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatarUrl(user.avatar || '');
      console.log("Profile initialized with user data:", { name: user.name, avatar: user.avatar });
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
      console.log("Updating profile with:", { name, avatar: avatarUrl });
      await updateProfile({ name, avatar: avatarUrl });
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

  const handleLoadImageFromUrl = async () => {
    if (!imageUrlInput || !imageUrlInput.trim().startsWith('http')) {
      toast({
        variant: 'destructive',
        title: 'Invalid URL',
        description: 'Please enter a valid URL starting with http:// or https://',
      });
      return;
    }
    
    setUploadLoading(true);
    try {
      const uploadedItem = await uploadFromUrl(imageUrlInput);
      setAvatarUrl(uploadedItem.url);
      
      toast({
        title: 'Image loaded',
        description: 'Image URL has been loaded successfully.',
      });
      
      setImageUrlInput('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Load failed',
        description: 'There was an error loading the image from URL.',
      });
      console.error(error);
    } finally {
      setUploadLoading(false);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadLoading(true);
    try {
      console.log("Starting file upload:", files[0].name);
      const uploadedItem = await uploadMedia(files[0]);
      console.log("Setting avatar URL to:", uploadedItem.url);
      setAvatarUrl(uploadedItem.url);
      
      toast({
        title: 'Image uploaded',
        description: `${uploadedItem.name} has been uploaded successfully.`,
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
      setUploadLoading(false);
    }
  };
  
  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    switch (method) {
      case 'card':
        return 'Credit/Debit Card';
      case 'whish':
        return 'Whish Money Transfer';
      case 'western-union':
        return 'Western Union / OMT';
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
      default:
        return <Banknote className="h-5 w-5 text-gold" />;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <div className="relative">
              <AvatarWrapper 
                src={avatarUrl} 
                alt={name || user.email}
                className="h-24 w-24"
                fallback={name?.slice(0, 2) || user.email.slice(0, 2).toUpperCase() || 'U'}
              />
              {isEditing && (
                <div className="absolute -bottom-2 -right-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="rounded-full w-8 h-8 p-0 bg-background border-gold/30"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadLoading}
                  >
                    {uploadLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gold" />
                    ) : (
                      <Upload className="h-4 w-4 text-gold" />
                    )}
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
                        disabled={uploadLoading}
                      >
                        {uploadLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        Upload
                      </Button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploadLoading}
                      />
                    </div>
                    
                    <div className="mt-2 flex gap-2">
                      <Input
                        placeholder="Enter image URL"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        className="border-gold/30 focus:border-gold"
                        disabled={uploadLoading}
                      />
                      <Button
                        variant="outline"
                        className="border-gold/30 text-gold hover:text-gold-dark whitespace-nowrap"
                        onClick={handleLoadImageFromUrl}
                        disabled={uploadLoading}
                      >
                        {uploadLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <LinkIcon className="h-4 w-4 mr-2" />
                        )}
                        Load URL
                      </Button>
                    </div>
                    
                    {avatarUrl && isEditing && (
                      <div className="mt-2 w-full max-h-40 overflow-hidden rounded border border-gray-200">
                        <img src={avatarUrl} alt="Avatar preview" className="w-full object-cover" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={loading || uploadLoading}
                      className="bg-gold hover:bg-gold-dark text-black"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        // Reset to original values
                        setName(user.name || '');
                        setAvatarUrl(user.avatar || '');
                      }}
                      className="border-gold/30 text-gold hover:text-gold-dark"
                      disabled={loading || uploadLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{user.name || 'Not set'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  
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
