import { Suspense } from 'react';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import CRMDashboard from '@/components/crm/CRMDashboard';

export default function AdminCRMPage() {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              CRM & Маркетинг
            </h1>
            <p className="text-gray-600">
              Управление клиентами и маркетинговыми кампаниями
            </p>
          </div>

          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600 mb-2"></div>
                <p className="text-sm text-gray-600">Загрузка CRM данных...</p>
              </div>
            </div>
          }>
            <CRMDashboard />
          </Suspense>
        </div>
      </div>
    </AdminAuthGuard>
  );
}

export async function generateMetadata() {
  return {
    title: 'CRM & Маркетинг | Sky Park Admin',
    description: 'CRM система и управление маркетинговыми кампаниями',
    robots: 'noindex, nofollow',
  };
} 