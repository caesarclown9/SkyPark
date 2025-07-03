'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Park } from '@/types';
import { parkService } from '../../services/parkService';
import { ParkCard } from './ParkCard';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface RecommendedParksProps {
  parks?: Park[];
  title?: string;
  subtitle?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export const RecommendedParks: React.FC<RecommendedParksProps> = ({
  parks = [],
  title = "Рекомендованные парки",
  subtitle = "",
  loading = false,
  error = null,
  onRetry
}) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const location = await parkService.getCurrentLocation();
      setUserLocation(location);
    } catch (error) {
      console.warn('Could not get user location:', error);
    }
  };

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="p-6 animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
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
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {title}
        </h2>
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-red-800 font-medium">Ошибка загрузки</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
          {onRetry && (
            <Button
              variant="secondary"
              onClick={onRetry}
              className="mt-4"
            >
              Попробовать снова
            </Button>
          )}
        </Card>
      </div>
    );
  }

  if (parks.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {title}
        </h2>
        <Card className="p-8 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Парки скоро появятся
          </h3>
          <p className="text-gray-600 mb-4">
            Мы работаем над добавлением новых развлекательных центров
          </p>
          <Link href="/parks">
            <Button variant="primary">
              Посмотреть все парки
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {title && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {title}
            </h2>
            {subtitle && (
              <p className="text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          <Link href="/parks">
            <Button variant="secondary" className="text-sm">
              Посмотреть все
            </Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {parks.map(park => (
          <ParkCard
            key={park.id}
            park={park}
            userLocation={userLocation}
            showDistance={!!userLocation}
            className="h-full"
          />
        ))}
      </div>

      {/* Призыв к действию */}
      <div className="mt-8 text-center">
        <Card className="p-8 bg-gradient-to-r from-sky-50 to-blue-50 border-sky-200">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Готовы к приключениям?
            </h3>
            <p className="text-gray-600 mb-4">
              Забронируйте место в любимом парке прямо сейчас и подарите детям незабываемые моменты!
            </p>
            <Link href="/parks">
              <Button variant="primary" className="inline-flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Выбрать парк
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}; 
 