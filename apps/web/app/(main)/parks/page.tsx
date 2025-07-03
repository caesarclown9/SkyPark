'use client';

import { useState, useEffect, useCallback } from 'react';
import { ParkList } from '@/components/parks/ParkList';
import { RecommendedParks } from '@/components/parks/RecommendedParks';
import PageWrapper from '@/components/layout/PageWrapper';
import { parkService } from '@/services/parkService';
import { Park } from '@skypark/shared/types';
import { MapPin, Search, Filter, Star, Clock, Shield } from 'lucide-react';
import { useAsyncData } from '@/hooks';

export default function ParksPage() {
  // Создаем стабильную функцию загрузки данных
  const loadParks = useCallback(async () => {
    return parkService.getParks({ 
      limit: 1000, // Загружаем все парки
      status: 'active'
    });
  }, []);

  // Загружаем все данные одним запросом
  const { 
    data: allParksResponse, 
    loading, 
    error,
    refetch 
  } = useAsyncData(loadParks, { dependencies: [] });

  const allParks = allParksResponse?.success ? allParksResponse.data : [];
  const featuredParks = allParks
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  const headerFeatures = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <div className="skypark-card-compact text-center">
        <MapPin className="w-8 h-8 text-purple-600 mx-auto mb-3" />
        <h3 className="font-bold text-gray-900 mb-1">15+ Локаций</h3>
        <p className="text-sm text-gray-600">Парки по всему Бишкеку</p>
      </div>
      <div className="skypark-card-compact text-center">
        <Star className="w-8 h-8 text-pink-600 mx-auto mb-3" />
        <h3 className="font-bold text-gray-900 mb-1">Высокий рейтинг</h3>
        <p className="text-sm text-gray-600">Проверенные отзывы родителей</p>
      </div>
      <div className="skypark-card-compact text-center">
        <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
        <h3 className="font-bold text-gray-900 mb-1">100% Безопасность</h3>
        <p className="text-sm text-gray-600">Сертифицированные аттракционы</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <PageWrapper title="Детские парки Бишкека" subtitle="Загружаем лучшие места для ваших малышей...">
        <div className="space-y-12">
          {/* Skeleton для рекомендуемых парков */}
          <div className="skypark-card-highlight">
            <div className="text-center mb-8">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skeleton для всех парков */}
          <div className="skypark-card">
            <div className="text-center mb-8">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-80 mx-auto animate-pulse"></div>
            </div>
            <div className="space-y-6">
              <div className="p-6 border rounded-lg">
                <div className="space-y-4">
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper title="Детские парки Бишкека" subtitle="Произошла ошибка при загрузке">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ошибка загрузки</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper 
      title="Детские парки Бишкека" 
      subtitle="🎪 Найдите идеальное место для отдыха с детьми. Безопасные зоны, современные аттракционы и незабываемые впечатления ждут вас!"
      headerContent={headerFeatures}
    >
      {/* Рекомендуемые парки */}
      {featuredParks.length > 0 && (
        <div className="skypark-card-highlight mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-skypark-gradient mb-2">
              ⭐ Рекомендуемые парки
            </h2>
            <p className="text-gray-600">Популярные детские центры с высокими оценками</p>
          </div>
          <RecommendedParks 
            parks={featuredParks}
            title=""
            subtitle=""
            loading={false}
            error=""
          />
        </div>
      )}

      {/* Все парки с фильтрами */}
      <div className="skypark-card">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-skypark-gradient mb-2">
            🗺️ Все парки развлечений
          </h2>
          <p className="text-gray-600">Исследуйте все доступные варианты</p>
        </div>
        
        <ParkList 
          initialParks={allParks}
          showFilters={true}
          showSearch={true}
          showDistanceFilter={true}
          itemsPerPage={12}
        />
      </div>
    </PageWrapper>
  );
} 