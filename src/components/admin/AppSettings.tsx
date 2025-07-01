import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from '@/hooks/use-toast';
import { Paintbrush, Type, Palette, Globe, Wallet } from 'lucide-react';
import PaymentSettings from './PaymentSettings';

// Color Scheme Form Schema
const colorSchemeFormSchema = z.object({
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Please enter a valid hex color code (e.g. #FF5733)",
  }),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Please enter a valid hex color code (e.g. #FF5733)",
  }),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Please enter a valid hex color code (e.g. #FF5733)",
  }),
  backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Please enter a valid hex color code (e.g. #FF5733)",
  }),
});

// Font Settings Form Schema
const fontSettingsFormSchema = z.object({
  primaryFont: z.string().min(2, {
    message: "Please enter a valid font name",
  }),
  headingFont: z.string().min(2, {
    message: "Please enter a valid font name",
  }),
  fontSize: z.string().min(1, {
    message: "Please select a base font size",
  }),
});

// App Settings Form Schema
const appSettingsFormSchema = z.object({
  siteName: z.string().min(2, {
    message: "Site name must be at least 2 characters",
  }),
  siteDescription: z.string().min(10, {
    message: "Site description must be at least 10 characters",
  }),
  contactEmail: z.string().email({
    message: "Please enter a valid email address",
  }),
});

const AppSettings: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('colors');

  // Color scheme form
  const colorSchemeForm = useForm<z.infer<typeof colorSchemeFormSchema>>({
    resolver: zodResolver(colorSchemeFormSchema),
    defaultValues: {
      primaryColor: "#8B5CF6", // Vivid Purple
      secondaryColor: "#D946EF", // Magenta Pink
      accentColor: "#F97316", // Bright Orange
      backgroundColor: "#FFFFFF", // White
    },
  });

  // Font settings form
  const fontSettingsForm = useForm<z.infer<typeof fontSettingsFormSchema>>({
    resolver: zodResolver(fontSettingsFormSchema),
    defaultValues: {
      primaryFont: "Inter",
      headingFont: "Poppins",
      fontSize: "16px",
    },
  });

  // App settings form
  const appSettingsForm = useForm<z.infer<typeof appSettingsFormSchema>>({
    resolver: zodResolver(appSettingsFormSchema),
    defaultValues: {
      siteName: "Gold Drawin",
      siteDescription: "Participate in exclusive gold coin draws and win big prizes!",
      contactEmail: "support@golddrawin.com",
    },
  });

  const onColorSchemeSubmit = (data: z.infer<typeof colorSchemeFormSchema>) => {
    console.log('Color scheme settings:', data);
    // Here you would save these settings to a database or local storage

    // Apply colors dynamically (this is a simple example, you would likely use a more robust approach)
    document.documentElement.style.setProperty('--primary', data.primaryColor);
    document.documentElement.style.setProperty('--secondary', data.secondaryColor);
    document.documentElement.style.setProperty('--accent', data.accentColor);
    document.documentElement.style.setProperty('--background', data.backgroundColor);

    toast({
      title: "Colors updated",
      description: "The color scheme has been successfully updated.",
    });
  };

  const onFontSettingsSubmit = (data: z.infer<typeof fontSettingsFormSchema>) => {
    console.log('Font settings:', data);
    // Here you would save font settings and potentially add font links to the document head

    toast({
      title: "Fonts updated",
      description: "The font settings have been successfully updated.",
    });
  };

  const onAppSettingsSubmit = (data: z.infer<typeof appSettingsFormSchema>) => {
    console.log('App settings:', data);
    // Here you would save app settings

    toast({
      title: "App settings updated",
      description: "The application settings have been successfully updated.",
    });
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">App Settings</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="colors" className="flex items-center gap-2 text-white">
            <Palette className="h-4 w-4" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="fonts" className="flex items-center gap-2 text-white">
            <Type className="h-4 w-4" />
            Fonts
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2 text-white">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2 text-white">
            <Wallet className="h-4 w-4" />
            Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors">
          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
              <CardDescription>
                Customize the application's color scheme. Changes will be applied site-wide.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...colorSchemeForm}>
                <form onSubmit={colorSchemeForm.handleSubmit(onColorSchemeSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={colorSchemeForm.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Color</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input type="text" placeholder="#8B5CF6" {...field} />
                            </FormControl>
                            <Input
                              type="color"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="w-12 h-10 p-1 cursor-pointer"
                            />
                          </div>
                          <FormDescription>
                            Used for primary buttons and key UI elements
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={colorSchemeForm.control}
                      name="secondaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secondary Color</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input type="text" placeholder="#D946EF" {...field} />
                            </FormControl>
                            <Input
                              type="color"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="w-12 h-10 p-1 cursor-pointer"
                            />
                          </div>
                          <FormDescription>
                            Used for secondary buttons and accents
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={colorSchemeForm.control}
                      name="accentColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Accent Color</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input type="text" placeholder="#F97316" {...field} />
                            </FormControl>
                            <Input
                              type="color"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="w-12 h-10 p-1 cursor-pointer"
                            />
                          </div>
                          <FormDescription>
                            Used for highlights and important notifications
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={colorSchemeForm.control}
                      name="backgroundColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Background Color</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input type="text" placeholder="#FFFFFF" {...field} />
                            </FormControl>
                            <Input
                              type="color"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="w-12 h-10 p-1 cursor-pointer"
                            />
                          </div>
                          <FormDescription>
                            Main background color for the application
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Color Preview</h4>
                    <div className="grid grid-cols-4 gap-2">
                      <div
                        className="h-16 rounded-md flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: colorSchemeForm.getValues().primaryColor }}
                      >
                        Primary
                      </div>
                      <div
                        className="h-16 rounded-md flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: colorSchemeForm.getValues().secondaryColor }}
                      >
                        Secondary
                      </div>
                      <div
                        className="h-16 rounded-md flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: colorSchemeForm.getValues().accentColor }}
                      >
                        Accent
                      </div>
                      <div
                        className="h-16 rounded-md flex items-center justify-center border font-medium"
                        style={{ backgroundColor: colorSchemeForm.getValues().backgroundColor }}
                      >
                        Background
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full">Save Color Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fonts">
          <Card>
            <CardHeader>
              <CardTitle>Font Settings</CardTitle>
              <CardDescription>
                Configure the typography settings for the application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...fontSettingsForm}>
                <form onSubmit={fontSettingsForm.handleSubmit(onFontSettingsSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={fontSettingsForm.control}
                      name="primaryFont"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Font</FormLabel>
                          <FormControl>
                            <Input placeholder="Inter" {...field} />
                          </FormControl>
                          <FormDescription>
                            Main font for body text
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={fontSettingsForm.control}
                      name="headingFont"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Heading Font</FormLabel>
                          <FormControl>
                            <Input placeholder="Poppins" {...field} />
                          </FormControl>
                          <FormDescription>
                            Font used for headings and titles
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={fontSettingsForm.control}
                      name="fontSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base Font Size</FormLabel>
                          <FormControl>
                            <Input placeholder="16px" {...field} />
                          </FormControl>
                          <FormDescription>
                            Default size for body text (e.g. 16px)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Typography Preview</h4>
                    <div className="space-y-4 border p-4 rounded-md">
                      <h1
                        className="text-2xl font-bold"
                        style={{ fontFamily: fontSettingsForm.getValues().headingFont }}
                      >
                        Heading Text Example
                      </h1>
                      <p
                        style={{
                          fontFamily: fontSettingsForm.getValues().primaryFont,
                          fontSize: fontSettingsForm.getValues().fontSize,
                        }}
                      >
                        This is an example of body text using the selected font settings. The quick brown fox jumps over the lazy dog.
                      </p>
                    </div>
                  </div>

                  <Button type="submit" className="w-full">Save Font Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general application settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...appSettingsForm}>
                <form onSubmit={appSettingsForm.handleSubmit(onAppSettingsSubmit)} className="space-y-6">
                  <FormField
                    control={appSettingsForm.control}
                    name="siteName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Gold Drawin" {...field} />
                        </FormControl>
                        <FormDescription>
                          The name of your application
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={appSettingsForm.control}
                    name="siteDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Participate in exclusive gold coin draws and win big prizes!" {...field} />
                        </FormControl>
                        <FormDescription>
                          A brief description of your application
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={appSettingsForm.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="support@golddrawin.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Main contact email for support inquiries
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">Save General Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <PaymentSettings />
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default AppSettings;
