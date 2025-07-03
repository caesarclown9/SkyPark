'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Park } from '@skypark/shared/types';
import { parkService } from '../../services/parkService';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface ParkDetailsProps {
  park: Park;
}

export const ParkDetails: React.FC<ParkDetailsProps> = ({ park }) => {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    getUserLocation();
  }, []);

  const fetchParkDetails = async () => {
    // Не нужно, так как park передается как пропс
  };

  const getUserLocation = async () => {
    try {
      const location = await parkService.getCurrentLocation();
      setUserLocation(location);
    } catch (error) {
      console.warn('Could not get user location:', error);
    }
  };



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

  const entranceFee = park.pricing_info?.entrance_fee;
  const attractions = park.pricing_info?.attractions;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Навигация */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">Главная</Link>
        <span>/</span>
        <Link href="/parks" className="hover:text-gray-700">Парки</Link>
        <span>/</span>
        <span className="text-gray-900">{park.name}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          {/* Фотогалерея */}
          <Card className="p-0 overflow-hidden">
            <div className="relative h-96">
              {park.images && park.images.length > 0 ? (
                <>
                  <img
                    src={park.images[selectedImageIndex]}
                    alt={`${park.name} - фото ${selectedImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/parks/placeholder.jpg';
                    }}
                  />
                  
                  {/* Статус работы */}
                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
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
                    <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-3 py-1 rounded-full">
                      <div className="flex items-center space-x-1">
                        <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-lg font-medium text-gray-700">
                          {park.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Миниатюры фотографий */}
                  {park.images.length > 1 && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex space-x-2 overflow-x-auto">
                        {park.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`flex-shrink-0 w-16 h-12 rounded border-2 overflow-hidden ${
                              index === selectedImageIndex
                                ? 'border-white'
                                : 'border-gray-300 opacity-70'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`Миниатюра ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                  <div className="text-center">
                    <svg className="w-24 h-24 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <p>Фотографии парка</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Описание */}
          <Card className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {park.name}
            </h1>
            <p className="text-gray-700 text-lg leading-relaxed">
              {park.description}
            </p>
          </Card>

          {/* Удобства и услуги */}
          {park.amenities && park.amenities.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Удобства и услуги
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {park.amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg"
                  >
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-blue-800 font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Цены */}
          {(entranceFee || attractions) && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Цены
              </h2>
              
              {entranceFee && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    Входной билет
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {entranceFee.weekday && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">Будние дни</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {entranceFee.weekday} KGS
                        </div>
                      </div>
                    )}
                    {entranceFee.weekend && (
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <div className="text-sm text-yellow-700">Выходные</div>
                        <div className="text-2xl font-bold text-yellow-800">
                          {entranceFee.weekend} KGS
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {attractions && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    Дополнительные услуги
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(attractions).map(([service, price]) => (
                      <div key={service} className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-700 capitalize">
                          {service.replace(/_/g, ' ')}
                        </span>
                        <span className="font-medium text-gray-900">
                          {price} KGS
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Быстрые действия */}
          <Card className="p-6">
            <div className="space-y-4">
              <Link href={`/booking/${park.id}`}>
                <Button variant="primary" className="w-full text-lg py-3">
                  Забронировать
                </Button>
              </Link>
              
              {park.phone && (
                <a href={`tel:${park.phone}`}>
                  <Button variant="secondary" className="w-full">
                    Позвонить
                  </Button>
                </a>
              )}
            </div>
          </Card>

          {/* Информация о парке */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Информация
            </h3>
            
            <div className="space-y-4">
              {/* Адрес */}
              <div>
                <div className="flex items-center text-gray-600 mb-1">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Адрес</span>
                </div>
                <p className="text-gray-800 pl-7">
                  {park.address_street}, {park.address_district}, {park.address_city}
                </p>
                {distance && (
                  <p className="text-sm text-blue-600 pl-7">
                    {distance < 1 
                      ? `${Math.round(distance * 1000)} м от вас`
                      : `${distance.toFixed(1)} км от вас`
                    }
                  </p>
                )}
              </div>

              {/* Часы работы */}
              <div>
                <div className="flex items-center text-gray-600 mb-1">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Часы работы</span>
                </div>
                <p className="text-gray-800 pl-7">{workingHours}</p>
                {park.weekend_opening_time && park.weekend_closing_time && (
                  <p className="text-sm text-gray-600 pl-7">
                    Выходные: {park.weekend_opening_time} - {park.weekend_closing_time}
                  </p>
                )}
              </div>

              {/* Контакты */}
              {park.phone && (
                <div>
                  <div className="flex items-center text-gray-600 mb-1">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span className="font-medium">Телефон</span>
                  </div>
                  <p className="text-gray-800 pl-7">{park.phone}</p>
                </div>
              )}

              {park.email && (
                <div>
                  <div className="flex items-center text-gray-600 mb-1">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span className="font-medium">Email</span>
                  </div>
                  <p className="text-gray-800 pl-7">{park.email}</p>
                </div>
              )}

              {park.website && (
                <div>
                  <div className="flex items-center text-gray-600 mb-1">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.148.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Сайт</span>
                  </div>
                  <a 
                    href={park.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 pl-7"
                  >
                    Перейти на сайт
                  </a>
                </div>
              )}

              {/* Возрастные группы */}
              {park.age_groups && park.age_groups.length > 0 && (
                <div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Возрастные группы</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-7">
                    {park.age_groups.map((age, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded"
                      >
                        {age}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Карта */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Расположение
            </h3>
            <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm">Карта будет добавлена</p>
                <p className="text-xs mt-1">
                  {park.latitude.toFixed(4)}, {park.longitude.toFixed(4)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}; 
 