'use client';

import React from 'react';
import Link from 'next/link';
import { Park } from '@skypark/shared/types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { parkService } from '../../services/parkService';

interface ParkCardProps {
  park: Park;
  userLocation?: { lat: number; lon: number };
  showDistance?: boolean;
  className?: string;
}

export const ParkCard: React.FC<ParkCardProps> = ({
  park,
  userLocation,
  showDistance = false,
  className = '',
}) => {
  const isOpen = parkService.isOpenNow(park);
  const workingHours = parkService.formatWorkingHours(park);
  
  const distance = userLocation
    ? parkService.calculateDistance(
        userLocation.lat,
        userLocation.lon,
        park.latitude,
        park.longitude
      )
    : null;

  // Используем base_price из новой структуры данных
  const basePrice = park.base_price;

  return (
    <Card className={`p-6 hover:shadow-lg transition-shadow duration-200 ${className}`}>
      {/* Изображение */}
      <div className="relative h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
        {park.images && park.images.length > 0 ? (
          <img
            src={park.images[0]}
            alt={park.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/parks/placeholder.jpg';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
        
        {/* Статус работы */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isOpen
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {isOpen ? 'Открыто' : 'Закрыто'}
          </span>
        </div>

        {/* Рейтинг */}
        {park.rating > 0 && (
          <div className="absolute top-3 right-3 bg-white bg-opacity-90 px-2 py-1 rounded-full">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                {park.rating.toFixed(1)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Информация о парке */}
      <div className="space-y-3">
        {/* Заголовок */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {park.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {park.description}
          </p>
        </div>

        {/* Адрес и расстояние */}
        <div className="space-y-1">
          <p className="text-sm text-gray-600 flex items-center">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {park.address}
          </p>
          
          {showDistance && distance && (
            <p className="text-sm text-blue-600">
              📍 {distance < 1 
                ? `${Math.round(distance * 1000)} м от вас`
                : `${distance.toFixed(1)} км от вас`
              }
            </p>
          )}
        </div>

        {/* Часы работы */}
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          {workingHours}
        </div>

        {/* Цены */}
        {basePrice && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700">Входной билет:</p>
            <div className="flex space-x-4 text-sm">
                <span className="text-gray-600">
                от <span className="font-medium text-gray-900">{basePrice} сом</span>
                </span>
            </div>
          </div>
        )}

        {/* Удобства */}
        {park.amenities && park.amenities.length > 0 && (
          <div>
            <div className="flex flex-wrap gap-1 mt-2">
              {park.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                >
                  {amenity}
                </span>
              ))}
              {park.amenities.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{park.amenities.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Возрастные ограничения */}
        {park.age_restrictions && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Возраст:</span>
            <span className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded">
              {park.age_restrictions.min_age}-{park.age_restrictions.max_age} лет
            </span>
            {park.age_restrictions.adult_supervision_required && (
              <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded">
                Под присмотром
                </span>
            )}
          </div>
        )}
      </div>

      {/* Действия */}
      <div className="mt-6 flex space-x-3">
        <Link href={`/parks/${park.id}`} className="flex-1">
          <Button variant="primary" className="w-full">
            Подробнее
          </Button>
        </Link>
        
        <Link href={`/booking/${park.id}`} className="flex-1">
          <Button variant="secondary" className="w-full">
            Забронировать
          </Button>
        </Link>
      </div>

      {/* Телефон для быстрого звонка */}
      {park.phone && (
        <div className="mt-3">
          <a
            href={`tel:${park.phone}`}
            className="flex items-center justify-center w-full py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            {park.phone}
          </a>
        </div>
      )}
    </Card>
  );
}; 
 