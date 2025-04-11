
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Home from './Home';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();
  
  console.log("Index component rendering, auth loading:", loading);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-md" />
            <Skeleton className="h-24 w-full rounded-md" />
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
        </div>
      </div>
    );
  }
  
  return <Home />;
};

export default Index;
