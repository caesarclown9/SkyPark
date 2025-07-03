'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/useAuthStore'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  requiresAdmin?: boolean
  fallbackPath?: string
}

export function ProtectedRoute({ 
  children, 
  requiresAdmin = false,
  fallbackPath = '/auth/login'
}: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, isAdmin, user, adminUser, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(fallbackPath)
      return
    }

    if (!isLoading && requiresAdmin) {
      if (!isAdmin || !adminUser) {
        router.push('/auth/admin')
        return
      }

      if (adminUser && !adminUser.is_active) {
        router.push('/unauthorized')
        return
      }
    }
  }, [isAuthenticated, isAdmin, user, adminUser, isLoading, requiresAdmin, router, fallbackPath])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-sky-600" />
          <p className="mt-2 text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiresAdmin && (!isAdmin || !adminUser)) {
    return null
  }

  if (requiresAdmin && adminUser && !adminUser.is_active) {
    return null
  }

  return <>{children}</>
}

// HOC version for easier usage
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiresAdmin = false
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute requiresAdmin={requiresAdmin}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
} 
 