
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const LoadingSection: React.FC = () => {
  return (
    <div className="space-y-8">
      <Skeleton className="h-48 w-full rounded-lg bg-gray-800" />
      <div className="grid md:grid-cols-3 gap-6">
        <Skeleton className="h-32 w-full rounded-md bg-gray-800" />
        <Skeleton className="h-32 w-full rounded-md bg-gray-800" />
        <Skeleton className="h-32 w-full rounded-md bg-gray-800" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 rounded-md bg-gray-800" />
        <Skeleton className="h-24 w-full rounded-md bg-gray-800" />
        <Skeleton className="h-24 w-full rounded-md bg-gray-800" />
      </div>
    </div>
  );
};

export default LoadingSection;
