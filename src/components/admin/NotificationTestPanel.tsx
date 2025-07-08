
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NotificationTest from '../test/NotificationTest';
import { useTranslation } from 'react-i18next';

const NotificationTestPanel: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.notificationTest.developmentTools')}</CardTitle>
      </CardHeader>
      <CardContent>
        <NotificationTest />
      </CardContent>
    </Card>
  );
};

export default NotificationTestPanel;
