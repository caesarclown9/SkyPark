'use client';

import React from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Navigation from './Navigation';

interface PageWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonHref?: string;
  headerContent?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'hero' | 'minimal';
  showNavigation?: boolean;
}

/**
 * Компонент-обертка для единого дизайна всех страниц Sky Park
 */
export function PageWrapper({
  children,
  title,
  subtitle,
  showBackButton = false,
  backButtonText = 'Назад',
  backButtonHref = '/',
  headerContent,
  className = '',
  variant = 'default',
  showNavigation = true
}: PageWrapperProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'hero':
        return 'bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500';
      case 'minimal':
        return 'bg-white';
      default:
        return 'skypark-page';
    }
  };

  const getHeaderClasses = () => {
    switch (variant) {
      case 'hero':
        return 'text-white';
      case 'minimal':
        return 'text-gray-900';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <div className={`min-h-screen ${getVariantClasses()} ${className}`}>
      {/* Navigation */}
      {showNavigation && <Navigation />}
      
      {/* Floating Animation Elements */}
      {variant === 'default' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-8 h-8 bg-yellow-300 rounded-full opacity-30 skypark-float" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-32 right-20 w-6 h-6 bg-pink-300 rounded-full opacity-40 skypark-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-48 left-1/4 w-4 h-4 bg-purple-300 rounded-full opacity-50 skypark-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-32 right-10 w-10 h-10 bg-blue-300 rounded-full opacity-30 skypark-float" style={{animationDelay: '0.5s'}}></div>
        </div>
      )}

      <div className="relative z-10">
        {/* Header Section */}
        <div className="skypark-container pt-4 pb-8">
          {/* Back Button */}
          {showBackButton && (
            <div className="mb-6">
              <Link 
                href={backButtonHref}
                className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200 group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform duration-200" />
                {backButtonText}
              </Link>
            </div>
          )}

          {/* Page Title */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-semibold rounded-full text-sm border border-purple-200">
                <Sparkles className="w-4 h-4 mr-2" />
                Sky Park
              </span>
            </div>
            
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${getHeaderClasses()}`}>
              {variant === 'hero' ? (
                title
              ) : (
                <span className="text-skypark-gradient">{title}</span>
              )}
            </h1>
            
            {subtitle && (
              <p className={`text-xl max-w-3xl mx-auto ${getHeaderClasses()} ${variant === 'hero' ? 'text-white/90' : 'text-gray-600'}`}>
                {subtitle}
              </p>
            )}
            
            {headerContent && (
              <div className="mt-6">
                {headerContent}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="skypark-container">
          {children}
        </div>
      </div>
    </div>
  );
}

export default PageWrapper; 