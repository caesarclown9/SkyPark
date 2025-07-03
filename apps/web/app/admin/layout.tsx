import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Админ-панель | Sky Park',
  description: 'Панель управления Sky Park - аналитика, бронирования, пользователи',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 