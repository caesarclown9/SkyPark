import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  phone: string
  first_name?: string
  last_name?: string
  email?: string
  full_name?: string
  loyalty_tier: 'beginner' | 'friend' | 'vip'
  loyalty_points: number
  status: 'active' | 'inactive' | 'suspended' | 'pending' | 'deleted'
  created_at: string
  last_login_at?: string
  phone_verified_at?: string
  email_verified_at?: string
}

export interface AdminUser extends User {
  admin_id: string
  organization_id: string
  role: string
  permissions: string[]
  is_active: boolean
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

interface AuthState {
  user: User | null
  adminUser: AdminUser | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  setUser: (user: User) => void
  setAdminUser: (adminUser: AdminUser) => void
  setTokens: (tokens: AuthTokens) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  sendSMSCode: (phone: string) => Promise<void>
  verifyAndLogin: (phone: string, code: string, userData?: Partial<User>) => Promise<void>
  adminLogin: (phone: string, code: string) => Promise<void>
  refreshTokens: () => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
  clearError: () => void
}

const API_BASE_URL = '/api' // Используем Next.js API routes
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      adminUser: null,
      tokens: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: true, isAdmin: false }),
      setAdminUser: (adminUser) => set({ 
        user: adminUser, 
        adminUser, 
        isAuthenticated: true, 
        isAdmin: true 
      }),
      setTokens: (tokens) => set({ tokens }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Send SMS verification code
      sendSMSCode: async (phone: string) => {
        set({ isLoading: true, error: null })
        
        if (DEMO_MODE) {
          // В demo режиме просто имитируем отправку SMS
          await new Promise(resolve => setTimeout(resolve, 1500))
          set({ isLoading: false })
          return
        }

        try {
          const response = await fetch(`${API_BASE_URL}/auth/send-sms`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error?.message || 'Failed to send SMS code')
          }

          set({ isLoading: false })
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to send SMS code' 
          })
          throw error
        }
      },

      // Verify SMS code and login/register
      verifyAndLogin: async (phone: string, code: string, userData = {}) => {
        set({ isLoading: true, error: null })

        if (DEMO_MODE) {
          // В demo режиме любой код работает
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const demoUser: User = {
            id: 'demo-user-001',
            phone: phone,
            first_name: userData.first_name || 'Айгуль',
            last_name: userData.last_name || 'Мамбетова',
            full_name: userData.first_name && userData.last_name ? `${userData.first_name} ${userData.last_name}` : 'Айгуль Мамбетова',
            email: userData.email || 'demo@skypark.kg',
            loyalty_tier: 'friend',
            loyalty_points: 1250,
            status: 'active',
            created_at: new Date().toISOString(),
            last_login_at: new Date().toISOString(),
            phone_verified_at: new Date().toISOString()
          }

          const demoTokens: AuthTokens = {
            access_token: 'demo_access_token_' + Date.now(),
            refresh_token: 'demo_refresh_token_' + Date.now(),
            token_type: 'Bearer'
          }

          set({
            user: demoUser,
            tokens: demoTokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          return
        }

        try {
          const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phone,
              code,
              userData,
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error?.message || 'Authentication failed')
          }

          const { user, tokens } = data.data
          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Authentication failed' 
          })
          throw error
        }
      },

      // Admin login with SMS code
      adminLogin: async (phone: string, code: string) => {
        set({ isLoading: true, error: null })

        if (DEMO_MODE) {
          // В demo режиме проверяем админский номер
          if (phone !== '+996700123456') {
            set({ isLoading: false, error: 'Номер телефона не найден в системе администраторов' })
            throw new Error('Номер телефона не найден в системе администраторов')
          }

          await new Promise(resolve => setTimeout(resolve, 1500))
          
          const demoAdminUser: AdminUser = {
            id: 'b1c2d3e4-f5a6-7890-bcde-f01234567890',
            phone: phone,
            first_name: 'Админ',
            last_name: 'Системы',
            full_name: 'Админ Системы',
            email: 'admin@skypark.kg',
            loyalty_tier: 'vip',
            loyalty_points: 0,
            status: 'active',
            created_at: new Date().toISOString(),
            last_login_at: new Date().toISOString(),
            phone_verified_at: new Date().toISOString(),
            admin_id: 'admin_001',
            organization_id: 'org_skypark_main',
            role: 'super_admin',
            permissions: [
              'users.read',
              'users.write',
              'bookings.read',
              'bookings.write',
              'parks.read',
              'parks.write',
              'analytics.read',
              'system.admin'
            ],
            is_active: true,
          }

          const demoTokens: AuthTokens = {
            access_token: 'demo_admin_access_token_' + Date.now(),
            refresh_token: 'demo_admin_refresh_token_' + Date.now(),
            token_type: 'Bearer'
          }

          set({
            user: demoAdminUser,
            adminUser: demoAdminUser,
            tokens: demoTokens,
            isAuthenticated: true,
            isAdmin: true,
            isLoading: false,
            error: null,
          })
          return
        }

        try {
          const response = await fetch(`${API_BASE_URL}/auth/admin-verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phone,
              code,
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error?.message || 'Admin authentication failed')
          }

          const { user, tokens } = data.data
          const adminUser: AdminUser = user

          set({
            user: adminUser,
            adminUser: adminUser,
            tokens,
            isAuthenticated: true,
            isAdmin: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Admin authentication failed' 
          })
          throw error
        }
      },

      // Refresh access token
      refreshTokens: async () => {
        const { tokens } = get()
        if (!tokens?.refresh_token) {
          throw new Error('No refresh token available')
        }

        try {
          const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              refresh_token: tokens.refresh_token,
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error?.message || 'Token refresh failed')
          }

          const newTokens = data.data
          set({ tokens: newTokens })
          return newTokens
        } catch (error) {
          // If refresh fails, logout user
          get().logout()
          throw error
        }
      },

      // Update user profile
      updateProfile: async (profileData: Partial<User>) => {
        const { tokens } = get()
        if (!tokens?.access_token) {
          throw new Error('Not authenticated')
        }

        set({ isLoading: true, error: null })

        try {
          const response = await fetch(`${API_BASE_URL}/user/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${tokens.access_token}`,
            },
            body: JSON.stringify(profileData),
          })

          const data = await response.json()

          if (!response.ok) {
            if (response.status === 401) {
              // Try to refresh token and retry
              await get().refreshTokens()
              return get().updateProfile(profileData)
            }
            throw new Error(data.error?.message || 'Failed to update profile')
          }

          set({ user: data.data, isLoading: false })
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to update profile' 
          })
          throw error
        }
      },

      // Logout user
      logout: () => {
        set({
          user: null,
          adminUser: null,
          tokens: null,
          isAuthenticated: false,
          isAdmin: false,
          isLoading: false,
          error: null,
        })
      },
    }),
    {
      name: 'skypark-auth-storage',
      partialize: (state) => ({
        user: state.user,
        adminUser: state.adminUser,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  )
)

// API helper with automatic token refresh
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const { tokens, refreshTokens, logout } = useAuthStore.getState()
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (tokens?.access_token) {
    headers['Authorization'] = `Bearer ${tokens.access_token}`
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // If token expired, try to refresh and retry
  if (response.status === 401 && tokens?.refresh_token) {
    try {
      await refreshTokens()
      const newTokens = useAuthStore.getState().tokens
      
      if (newTokens?.access_token) {
        headers['Authorization'] = `Bearer ${newTokens.access_token}`
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
        })
      }
    } catch (error) {
      logout()
      throw new Error('Session expired. Please login again.')
    }
  }

  return response
} 
 