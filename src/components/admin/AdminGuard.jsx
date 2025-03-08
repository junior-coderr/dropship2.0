'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoadingState } from './LoadingState';

export function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (loading) {
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token || !user || user.role !== 'admin') {
      router.push('/');
    } else {
      setIsChecking(false);
    }
  }, [user, loading, router]);

  if (loading || isChecking) {
    return <LoadingState />;
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return children;
}
