
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NotificationTest from '../test/NotificationTest';

const NotificationTestPanel: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🧪 Development Tools</CardTitle>
      </CardHeader>
      <CardContent>
        <NotificationTest />
      </CardContent>
    </Card>
  );
};

export default NotificationTestPanel;
