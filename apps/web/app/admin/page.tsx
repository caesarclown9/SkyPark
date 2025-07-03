'use client';

import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/auth/admin');
  };

  // Демо админ-пользователь для тестирования
  const demoAdminUser = {
    id: 'demo-admin-1',
    email: 'admin@skypark.kg',
    first_name: 'Демо',
    last_name: 'Администратор',
    role: 'super_admin' as const,
    permissions: ['parks_manage', 'bookings_manage', 'payments_view', 'users_manage', 'settings_manage', 'reports_view'] as const,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: new Date().toISOString(),
  };

  return <AdminDashboard adminUser={demoAdminUser} onLogout={handleLogout} />;
}

 
 