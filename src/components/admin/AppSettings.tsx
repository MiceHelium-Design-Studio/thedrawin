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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
      title: t('admin.settings.colorsUpdated'),
      description: t('admin.settings.colorSchemeUpdated'),
    });
  };

  const onFontSettingsSubmit = (data: z.infer<typeof fontSettingsFormSchema>) => {
    console.log('Font settings:', data);
    // Here you would save font settings and potentially add font links to the document head

    toast({
      title: t('admin.settings.fontsUpdated'),
      description: t('admin.settings.fontSettingsUpdated'),
    });
  };

  const onAppSettingsSubmit = (data: z.infer<typeof appSettingsFormSchema>) => {
    console.log('App settings:', data);
    // Here you would save app settings

    toast({
      title: t('admin.settings.appSettingsUpdated'),
      description: t('admin.settings.applicationSettingsUpdated'),
    });
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">{t('admin.settings.title')}</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="colors" className="flex items-center gap-2 text-white">
            <Palette className="h-4 w-4" />
            {t('admin.settings.colors')}
          </TabsTrigger>
          <TabsTrigger value="fonts" className="flex items-center gap-2 text-white">
            <Type className="h-4 w-4" />
            {t('admin.settings.fonts')}
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2 text-white">
            <Globe className="h-4 w-4" />
            {t('admin.settings.general')}
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2 text-white">
            <Wallet className="h-4 w-4" />
            {t('admin.settings.payments')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.settings.colorScheme')}</CardTitle>
              <CardDescription>
                {t('admin.settings.colorSchemeDescription')}
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
                          <FormLabel>{t('admin.settings.primaryColor')}</FormLabel>
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
                            {t('admin.settings.primaryColorDescription')}
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
                          <FormLabel>{t('admin.settings.secondaryColor')}</FormLabel>
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
                            {t('admin.settings.secondaryColorDescription')}
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
                          <FormLabel>{t('admin.settings.accentColor')}</FormLabel>
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
                            {t('admin.settings.accentColorDescription')}
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
                          <FormLabel>{t('admin.settings.backgroundColor')}</FormLabel>
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
                            {t('admin.settings.backgroundColorDescription')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-2">{t('admin.settings.colorPreview')}</h4>
                    <div className="grid grid-cols-4 gap-2">
                      <div
                        className="h-16 rounded-md flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: colorSchemeForm.getValues().primaryColor }}
                      >
                        {t('admin.settings.primary')}
                      </div>
                      <div
                        className="h-16 rounded-md flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: colorSchemeForm.getValues().secondaryColor }}
                      >
                        {t('admin.settings.secondary')}
                      </div>
                      <div
                        className="h-16 rounded-md flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: colorSchemeForm.getValues().accentColor }}
                      >
                        {t('admin.settings.accent')}
                      </div>
                      <div
                        className="h-16 rounded-md flex items-center justify-center border font-medium"
                        style={{ backgroundColor: colorSchemeForm.getValues().backgroundColor }}
                      >
                        {t('admin.settings.background')}
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full">{t('admin.settings.saveColorSettings')}</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fonts">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.settings.fontSettings')}</CardTitle>
              <CardDescription>
                {t('admin.settings.fontSettingsDescription')}
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
                          <FormLabel>{t('admin.settings.primaryFont')}</FormLabel>
                          <FormControl>
                            <Input placeholder="Inter" {...field} />
                          </FormControl>
                          <FormDescription>
                            {t('admin.settings.primaryFontDescription')}
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
                          <FormLabel>{t('admin.settings.headingFont')}</FormLabel>
                          <FormControl>
                            <Input placeholder="Poppins" {...field} />
                          </FormControl>
                          <FormDescription>
                            {t('admin.settings.headingFontDescription')}
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
                          <FormLabel>{t('admin.settings.baseFontSize')}</FormLabel>
                          <FormControl>
                            <Input placeholder="16px" {...field} />
                          </FormControl>
                          <FormDescription>
                            {t('admin.settings.baseFontSizeDescription')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-2">{t('admin.settings.typographyPreview')}</h4>
                    <div className="space-y-4 border p-4 rounded-md">
                      <h1
                        className="text-2xl font-bold"
                        style={{ fontFamily: fontSettingsForm.getValues().headingFont }}
                      >
                        {t('admin.settings.headingTextExample')}
                      </h1>
                      <p
                        style={{
                          fontFamily: fontSettingsForm.getValues().primaryFont,
                          fontSize: fontSettingsForm.getValues().fontSize,
                        }}
                      >
                        {t('admin.settings.bodyTextExample')}
                      </p>
                    </div>
                  </div>

                  <Button type="submit" className="w-full">{t('admin.settings.saveFontSettings')}</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.settings.generalSettings')}</CardTitle>
              <CardDescription>
                {t('admin.settings.generalSettingsDescription')}
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
                        <FormLabel>{t('admin.settings.siteName')}</FormLabel>
                        <FormControl>
                          <Input placeholder="Gold Drawin" {...field} />
                        </FormControl>
                        <FormDescription>
                          {t('admin.settings.siteNameDescription')}
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
                        <FormLabel>{t('admin.settings.siteDescription')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('admin.settings.siteDescriptionPlaceholder')} {...field} />
                        </FormControl>
                        <FormDescription>
                          {t('admin.settings.siteDescriptionDescription')}
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
                        <FormLabel>{t('admin.settings.contactEmail')}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder={t('admin.settings.contactEmailPlaceholder')} {...field} />
                        </FormControl>
                        <FormDescription>
                          {t('admin.settings.contactEmailDescription')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">{t('admin.settings.saveGeneralSettings')}</Button>
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
