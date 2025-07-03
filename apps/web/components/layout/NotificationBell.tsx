'use client';

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const NotificationBell: React.FC = () => {
  const [hasNotifications, setHasNotifications] = useState(true);

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" className="relative">
        <Bell className="h-5 w-5" />
        {hasNotifications && (
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
        )}
      </Button>
    </div>
  );
};

export default NotificationBell; 