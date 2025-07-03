'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Park } from '@skypark/shared/types';
import { parkService, ParkFilters, BishkekDistrict } from '../../services/parkService';
import { ParkCard } from './ParkCard';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { EmptyState, EmptyStates } from '../ui/EmptyState';
import { useAsyncData, useDebounce } from '@/hooks';
import { logApiError, logUserAction } from '@/lib/logger';

interface ParkListProps {
  initialParks?: Park[];
  showFilters?: boolean;
  showSearch?: boolean;
  showDistanceFilter?: boolean;
  itemsPerPage?: number;
  className?: string;
}

export const ParkList: React.FC<ParkListProps> = ({
  initialParks = [],
  showFilters = true,
  showSearch = true,
  showDistanceFilter = true,
  itemsPerPage = 12,
  className = '',
}) => {
  const [filters, setFilters] = useState<ParkFilters>({
    page: 1,
    limit: itemsPerPage,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Используем initialParks если они переданы, иначе загружаем данные
  const shouldLoadData = initialParks.length === 0;
  
  // Создаем стабильную функцию загрузки
  const loadAllParks = useCallback(async () => {
    return parkService.getParks({ 
      limit: 1000, // Загружаем все парки сразу для клиентской фильтрации
      page: 1,
      status: 'active'
    });
  }, []);

  // Загружаем все данные одним запросом
  const { 
    data: allParksData, 
    loading: parksLoading, 
    error: parksError,
    refetch: refetchParks 
  } = useAsyncData(
    loadAllParks,
    { 
      dependencies: [],
      enabled: shouldLoadData 
    }
  );

  // Создаем стабильные функции загрузки
  const loadDistricts = useCallback(async () => {
    return parkService.getBishkekDistricts();
  }, []);

  const loadUserLocation = useCallback(async () => {
    return showDistanceFilter ? parkService.getCurrentLocation() : Promise.resolve(null);
  }, [showDistanceFilter]);

  // Загружаем районы
  const { data: districtsResponse } = useAsyncData(
    loadDistricts,
    { dependencies: [] }
  );

  // Загружаем геолокацию только если нужно
  const { data: userLocation } = useAsyncData(
    loadUserLocation,
    { 
      dependencies: [showDistanceFilter],
      enabled: showDistanceFilter 
    }
  );

  const districts = districtsResponse?.success ? districtsResponse.data : [];
  const allParks = shouldLoadData && allParksData?.success ? allParksData.data : initialParks;

  // Клиентская фильтрация и поиск
  const filteredParks = useMemo(() => {
    let result = [...allParks];

    // Поиск
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      result = result.filter(park => 
        park.name.toLowerCase().includes(searchLower) ||
        park.description?.toLowerCase().includes(searchLower) ||
        park.address?.toLowerCase().includes(searchLower)
      );
    }

    // Фильтр по району
    if (filters.district) {
      result = result.filter(park => {
        // Простая проверка по адресу (можно улучшить)
        return park.address?.toLowerCase().includes(filters.district!.toLowerCase());
      });
    }

    // Фильтр по статусу
    if (filters.status) {
      result = result.filter(park => park.status === filters.status);
    }

    // Фильтр по удобствам
    if (filters.amenity) {
      result = result.filter(park => 
        park.amenities?.includes(filters.amenity!)
      );
    }

    return result;
  }, [allParks, debouncedSearchTerm, filters.district, filters.status, filters.amenity]);

  // Пагинация на клиенте
  const paginatedParks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredParks.slice(startIndex, endIndex);
  }, [filteredParks, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredParks.length / itemsPerPage);

  const handleFilterChange = (key: keyof ParkFilters, value: string | undefined) => {
    logUserAction('park_filter_change', { filter: key, value });
    
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1); // Сбрасываем на первую страницу
  };

  const handlePageChange = (page: number) => {
    logUserAction('park_page_change', { page });
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    logUserAction('clear_park_filters');
    setSearchTerm('');
    setFilters({
      page: 1,
      limit: itemsPerPage,
    });
    setCurrentPage(1);
  };

  // Определяем популярные удобства для фильтра
  const popularAmenities = useMemo(() => {
    if (!allParks.length) return [];
    
    const amenityCount: Record<string, number> = {};
    
    allParks.forEach(park => {
      park.amenities?.forEach(amenity => {
        amenityCount[amenity] = (amenityCount[amenity] || 0) + 1;
      });
    });

    return Object.entries(amenityCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([amenity]) => amenity);
  }, [allParks]);

  const hasActiveFilters = filters.district || filters.amenity || debouncedSearchTerm || filters.status;
  const loading = shouldLoadData && parksLoading;
  const error = shouldLoadData && parksError;

  // Skeleton loader
  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {(showSearch || showFilters) && (
          <Card className="p-6">
            <div className="space-y-4">
              {showSearch && (
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              )}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyStates.Error
        action={{
          label: 'Попробовать снова',
          onClick: refetchParks,
        }}
      />
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Поиск и фильтры */}
      {(showSearch || showFilters) && (
        <Card className="p-6">
          <div className="space-y-4">
            {/* Поиск */}
            {showSearch && (
              <div>
                <Input
                  type="text"
                  placeholder="Поиск парков по названию или описанию..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            )}

            {/* Фильтры */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Район */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Район
                  </label>
                  <select
                    value={filters.district || ''}
                    onChange={(e) => handleFilterChange('district', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Все районы</option>
                    {districts?.map(district => (
                      <option key={district.name} value={district.name}>
                        {district.name_ru}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Статус */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Статус
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Все парки</option>
                    <option value="active">Активные</option>
                    <option value="maintenance">На обслуживании</option>
                    <option value="closed">Закрытые</option>
                  </select>
                </div>

                {/* Удобства */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Удобства
                  </label>
                  <select
                    value={filters.amenity || ''}
                    onChange={(e) => handleFilterChange('amenity', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Все удобства</option>
                    {popularAmenities.map(amenity => (
                      <option key={amenity} value={amenity}>
                        {amenity}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Кнопка сброса фильтров */}
                <div className="flex items-end">
                  {hasActiveFilters && (
                    <Button
                      variant="secondary"
                      onClick={clearFilters}
                      className="w-full"
                    >
                      Сбросить фильтры
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Информация о результатах */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Найдено: <span className="font-medium">{filteredParks.length}</span> парков
          {hasActiveFilters && (
            <span className="ml-2 text-blue-600">(фильтры применены)</span>
          )}
        </p>
      </div>

             {/* Список парков */}
       {paginatedParks.length === 0 ? (
         <EmptyState
           emoji="🎠"
           title="Парки не найдены"
           description={hasActiveFilters 
             ? "Попробуйте изменить фильтры поиска" 
             : "В данный момент нет доступных парков"
           }
           action={hasActiveFilters ? {
             label: 'Сбросить фильтры',
             onClick: clearFilters,
           } : undefined}
         />
       ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedParks.map(park => (
              <ParkCard
                key={park.id}
                park={park}
                userLocation={userLocation}
                showDistance={!!userLocation}
                className="h-full"
              />
            ))}
          </div>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <Button
                variant="secondary"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2"
              >
                ←
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "primary" : "secondary"}
                    onClick={() => handlePageChange(pageNum)}
                    className="px-3 py-2 min-w-[40px]"
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                variant="secondary"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2"
              >
                →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}; 
 