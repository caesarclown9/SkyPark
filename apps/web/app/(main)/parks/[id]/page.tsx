'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Park } from '@/types';
import { parkService } from '@/services/parkService';
import { ParkDetails } from '@/components/parks/ParkDetails';

export default function ParkPage() {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Загрузка информации о парке...</p>
        </div>
      </div>
    );
  }

  if (error || !park) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  return <ParkDetails park={park} />;
} 