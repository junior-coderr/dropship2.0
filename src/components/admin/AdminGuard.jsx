'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoadingState } from './LoadingState';

export function AdminGuard({ children }) {
  const { user } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (user === null) {
      // Still loading
      return;
    }
    
    if (!user || user.role !== 'admin') {
      router.push('/');
    } else {
      setIsChecking(false);
    }
  }, [user, router]);

  if (isChecking) {
    return <LoadingState />;
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return children;
}
