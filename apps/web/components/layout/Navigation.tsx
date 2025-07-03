'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlayCircle, Sparkles, Menu, X, Home, MapPin, Ticket, User, Settings, Bell, Shield } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

interface NavigationProps {
  className?: string;
}

export default function Navigation({ className = '' }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, isAdmin, logout } = useAuthStore();

  const navigationItems = [
    {
      href: '/',
      label: 'Главная',
      icon: Home,
      show: true
    },
    {
      href: '/parks',
      label: 'Парки',
      icon: MapPin,
      show: true
    },
    {
      href: '/dashboard',
      label: 'Кабинет',
      icon: User,
      show: isAuthenticated
    },
    {
      href: '/tickets',
      label: 'Билеты',
      icon: Ticket,
      show: isAuthenticated
    },
    {
      href: '/notifications',
      label: 'Уведомления',
      icon: Bell,
      show: isAuthenticated
    },
    {
      href: '/admin',
      label: 'Админ-панель',
      icon: Shield,
      show: isAuthenticated && isAdmin
    }
  ];

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`bg-white shadow-lg border-b-4 border-gradient-to-r from-pink-400 to-purple-500 sticky top-0 z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="relative">
                <PlayCircle className="h-10 w-10 text-purple-600 group-hover:text-pink-500 transition-colors duration-300" />
                <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                Sky Park
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigationItems.filter(item => item.show).map((item) => {
                const IconComponent = item.icon;
                const isActive = isActiveLink(item.href);
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link href="/settings/notifications">
                  <button className="p-2 rounded-full text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors">
                    <Settings className="w-5 h-5" />
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-skypark-outline px-4 py-2 text-sm"
                >
                  Выйти
                </button>
              </div>
            ) : (
              <Link href="/auth/login">
                <button className="btn-skypark-primary px-6 py-2 text-sm">
                  🎈 Войти
                </button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="bg-purple-100 inline-flex items-center justify-center p-2 rounded-md text-purple-600 hover:text-purple-500 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navigationItems.filter(item => item.show).map((item) => {
              const IconComponent = item.icon;
              const isActive = isActiveLink(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
            
            {/* Mobile user actions */}
            <div className="border-t border-gray-200 pt-4">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/settings/notifications"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <Settings className="w-5 h-5" />
                      <span>Настройки</span>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-500 hover:bg-red-50"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  🎈 Войти
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 