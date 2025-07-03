'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Park } from '@/types';
import { parkService } from '@/services/parkService';
import BookingForm from '@/components/booking/BookingForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const [park, setPark] = useState<Park | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPark = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const parkId = params.id as string;
        const response = await parkService.getParkById(parkId);
        
        if (response.success && response.data) {
          setPark(response.data);
        } else {
          setError('Парк не найден');
        }
      } catch (err) {
        console.error('Ошибка загрузки парка:', err);
        setError('Ошибка загрузки данных парка');
      } finally {
        setLoading(false);
      }
    };

    loadPark();
  }, [params.id]);

  const handleBookingSuccess = (bookingId: string) => {
    // Перенаправляем в дашборд с подсветкой созданного бронирования
    router.push(`/dashboard?tab=bookings&booking=${bookingId}`);
  };

  const handleBookingCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mb-4"></div>
          <p className="text-gray-600">Загрузка формы бронирования...</p>
        </div>
      </div>
    );
  }

  if (error || !park) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl text-gray-300 mb-4">🎪</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Парк не найден</h1>
          <p className="text-gray-600 mb-4">{error || 'Запрашиваемый парк не существует'}</p>
          <button
            onClick={() => router.push('/parks')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Вернуться к списку парков
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/parks/${park.id}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Назад к парку
                </Link>
              </Button>
              <div className="hidden sm:block">
                <h1 className="text-xl font-semibold text-gray-900">
                  Бронирование: {park.name}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Контент */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BookingForm 
            park={park}
            onSuccess={handleBookingSuccess}
            onCancel={handleBookingCancel}
          />
        </div>
      </div>
    </div>
  );
} 
 