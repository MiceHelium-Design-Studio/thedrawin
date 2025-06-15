
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardProps {
  title: string;
  description: string;
  value: number | string;
  loading?: boolean;
  error?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  description,
  value,
  loading = false,
  error = false,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ color: '#FFFFFF' }}>{title}</CardTitle>
        <CardDescription style={{ color: '#FFFFFF' }}>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : error ? (
          <p className="text-3xl font-bold text-[rgb(var(--destructive))]" style={{ color: '#FF4C4C' }}>Error</p>
        ) : (
          <p className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>{value}</p>
        )}
      </CardContent>
    </Card>
  );
};
