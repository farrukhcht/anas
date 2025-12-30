'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Permission, hasPermission } from '@/app/lib/permissions';

interface WithPermissionProps {
  requiredPermission: Permission;
  children: React.ReactNode;
}

export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermission: Permission
) {
  return function WithPermissionComponent(props: P) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === 'unauthenticated') {
        router.push('/login');
      }
    }, [status, router]);

    if (status === 'unauthenticated') {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
} 