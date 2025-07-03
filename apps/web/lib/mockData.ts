import type { Park, User, Booking, Ticket, Payment, Review } from '@/types';

// Mock данные парков Sky Park в Бишкеке
export const mockParks: Park[] = [
  {
    id: 'park-001',
    organization_id: 'org-001',
    name: 'Sky Park Центр',
    description: 'Самый большой детский развлекательный центр в центре Бишкека! 🎪 Современные аттракционы, безопасные игровые зоны и море веселья для детей всех возрастов.',
    address: 'ул. Чуй, 123, Бишкек',
    city: 'Бишкек',
    latitude: 42.8746,
    longitude: 74.5698,
    phone: '+996 (312) 123-456',
    email: 'center@skypark.kg',
    website: 'https://skypark.kg',
    base_price: 350.00,
    capacity: 200,
    status: 'active' as const,
    rating: 4.9,
    review_count: 347,
    opening_hours: {
      monday: { open: '10:00', close: '22:00' },
      tuesday: { open: '10:00', close: '22:00' },
      wednesday: { open: '10:00', close: '22:00' },
      thursday: { open: '10:00', close: '22:00' },
      friday: { open: '10:00', close: '23:00' },
      saturday: { open: '09:00', close: '23:00' },
      sunday: { open: '09:00', close: '22:00' }
    },
    amenities: ['Кафе', 'Wi-Fi', 'Паркинг', 'Анимация', 'День рождения', 'Лабиринт', 'Батуты', 'Горки'],
    age_restrictions: {
      min_age: 1,
      max_age: 14,
      adult_supervision_required: true
    },
    images: [
      'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
      'https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?w=800'
    ],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T15:30:00Z'
  },
  {
    id: 'park-002',
    organization_id: 'org-001',
    name: 'Sky Park Восток',
    description: 'Уютный семейный парк в восточной части города 🌟 Специальные зоны для малышей, современные аттракционы и приятная атмосфера.',
    address: 'мкр. Восток-5, дом 12, Бишкек',
    city: 'Бишкек',
    latitude: 42.8856,
    longitude: 74.6298,
    phone: '+996 (312) 234-567',
    email: 'vostok@skypark.kg',
    website: 'https://skypark.kg/vostok',
    base_price: 300.00,
    capacity: 150,
    status: 'active' as const,
    rating: 4.8,
    review_count: 193,
    opening_hours: {
      monday: { open: '10:00', close: '21:00' },
      tuesday: { open: '10:00', close: '21:00' },
      wednesday: { open: '10:00', close: '21:00' },
      thursday: { open: '10:00', close: '21:00' },
      friday: { open: '10:00', close: '22:00' },
      saturday: { open: '09:00', close: '22:00' },
      sunday: { open: '09:00', close: '21:00' }
    },
    amenities: ['Кафе', 'Wi-Fi', 'Анимация', 'Лабиринт', 'Батуты', 'Бассейн с шариками', 'Автоматы'],
    age_restrictions: {
      min_age: 1,
      max_age: 12,
      adult_supervision_required: true
    },
    images: [
      'https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?w=800',
      'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800'
    ],
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-25T15:30:00Z'
  },
  {
    id: 'park-003',
    organization_id: 'org-001',
    name: 'Sky Park Запад',
    description: 'Новейший парк развлечений на западе города! 🚀 VIP-зоны, эксклюзивные аттракционы и премиум-сервис для особенных моментов.',
    address: 'ул. Ахунбаева, 45, Бишкек',
    city: 'Бишкек',
    latitude: 42.8646,
    longitude: 74.5298,
    phone: '+996 (312) 345-678',
    email: 'zapad@skypark.kg',
    website: 'https://skypark.kg/zapad',
    base_price: 400.00,
    capacity: 180,
    status: 'active' as const,
    rating: 4.9,
    review_count: 271,
    opening_hours: {
      monday: { open: '10:00', close: '22:00' },
      tuesday: { open: '10:00', close: '22:00' },
      wednesday: { open: '10:00', close: '22:00' },
      thursday: { open: '10:00', close: '22:00' },
      friday: { open: '10:00', close: '23:00' },
      saturday: { open: '09:00', close: '23:00' },
      sunday: { open: '09:00', close: '22:00' }
    },
    amenities: ['VIP-зона', 'Кафе', 'Wi-Fi', 'Паркинг', 'Анимация', 'День рождения', 'Лабиринт', 'Батуты', 'Горки', 'Автоматы', 'Фотозона'],
    age_restrictions: {
      min_age: 2,
      max_age: 16,
      adult_supervision_required: false
    },
    images: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
      'https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?w=800',
      'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800'
    ],
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-05T15:30:00Z'
  },
  {
    id: 'park-004',
    organization_id: 'org-001',
    name: 'Sky Park Юг',
    description: 'Семейный парк в уютном районе Джал 🌈 Идеальное место для спокойного отдыха с детьми в приятной атмосфере.',
    address: 'мкр. Джал, 23-микрорайон, Бишкек',
    city: 'Бишкек',
    latitude: 42.8246,
    longitude: 74.5898,
    phone: '+996 (312) 456-789',
    email: 'jug@skypark.kg',
    website: 'https://skypark.kg/jug',
    base_price: 280.00,
    capacity: 120,
    status: 'active' as const,
    rating: 4.7,
    review_count: 156,
    opening_hours: {
      monday: { open: '10:00', close: '21:00' },
      tuesday: { open: '10:00', close: '21:00' },
      wednesday: { open: '10:00', close: '21:00' },
      thursday: { open: '10:00', close: '21:00' },
      friday: { open: '10:00', close: '22:00' },
      saturday: { open: '09:00', close: '22:00' },
      sunday: { open: '09:00', close: '21:00' }
    },
    amenities: ['Кафе', 'Wi-Fi', 'Анимация', 'Лабиринт', 'Бассейн с шариками', 'Горки', 'Мягкие модули'],
    age_restrictions: {
      min_age: 1,
      max_age: 10,
      adult_supervision_required: true
    },
    images: [
      'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800',
      'https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?w=800'
    ],
    created_at: '2024-01-25T10:00:00Z',
    updated_at: '2024-01-30T15:30:00Z'
  },
  {
    id: 'park-005',
    organization_id: 'org-001',
    name: 'Sky Park Север',
    description: 'Современный парк с инновационными аттракционами 🎮 Интерактивные игры, VR-зоны и технологии будущего для продвинутых детей.',
    address: 'ул. Московская, 78, Бишкек',
    city: 'Бишкек',
    latitude: 42.9046,
    longitude: 74.5598,
    phone: '+996 (312) 567-890',
    email: 'sever@skypark.kg',
    website: 'https://skypark.kg/sever',
    base_price: 450.00,
    capacity: 160,
    status: 'active' as const,
    rating: 4.8,
    review_count: 89,
    opening_hours: {
      monday: { open: '11:00', close: '22:00' },
      tuesday: { open: '11:00', close: '22:00' },
      wednesday: { open: '11:00', close: '22:00' },
      thursday: { open: '11:00', close: '22:00' },
      friday: { open: '11:00', close: '23:00' },
      saturday: { open: '10:00', close: '23:00' },
      sunday: { open: '10:00', close: '22:00' }
    },
    amenities: ['VR-зона', 'Игровые автоматы', 'Кафе', 'Wi-Fi', 'Паркинг', 'Анимация', 'Квесты', 'Лазертаг', 'Симуляторы'],
    age_restrictions: {
      min_age: 5,
      max_age: 16,
      adult_supervision_required: false
    },
    images: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
      'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800'
    ],
    created_at: '2024-02-10T10:00:00Z',
    updated_at: '2024-02-15T15:30:00Z'
  },
  {
    id: 'park-006',
    organization_id: 'org-001',
    name: 'Sky Park Мега',
    description: 'Флагманский парк в ТРЦ "Мега" 🛍️ Огромное пространство, эксклюзивные аттракционы и незабываемые впечатления для всей семьи.',
    address: 'ТРЦ "Мега", 3-й этаж, Бишкек',
    city: 'Бишкек',
    latitude: 42.8546,
    longitude: 74.6098,
    phone: '+996 (312) 678-901',
    email: 'mega@skypark.kg',
    website: 'https://skypark.kg/mega',
    base_price: 500.00,
    capacity: 300,
    status: 'active' as const,
    rating: 4.9,
    review_count: 412,
    opening_hours: {
      monday: { open: '10:00', close: '22:00' },
      tuesday: { open: '10:00', close: '22:00' },
      wednesday: { open: '10:00', close: '22:00' },
      thursday: { open: '10:00', close: '22:00' },
      friday: { open: '10:00', close: '23:00' },
      saturday: { open: '09:00', close: '23:00' },
      sunday: { open: '09:00', close: '22:00' }
    },
    amenities: ['VIP-зона', 'Премиум кафе', 'Wi-Fi', 'Валет-паркинг', 'Персональная анимация', 'Эксклюзивные дни рождения', 'Лабиринт', 'Батуты', 'Горки', 'Автоматы', 'Фотозона', 'Кинотеатр', 'Боулинг'],
    age_restrictions: {
      min_age: 1,
      max_age: 16,
      adult_supervision_required: false
    },
    images: [
      'https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?w=800',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
      'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
    ],
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-02-20T15:30:00Z'
  }
];

// Mock районы Бишкека
export const mockDistricts = [
  {
    name: 'center',
    name_ru: 'Центр',
    name_ky: 'Борбор',
    center_lat: 42.8746,
    center_lon: 74.5698,
    description: 'Центральный район города'
  },
  {
    name: 'leninsky',
    name_ru: 'Ленинский',
    name_ky: 'Ленин району',
    center_lat: 42.8856,
    center_lon: 74.6298,
    description: 'Ленинский район'
  },
  {
    name: 'oktabrsky',
    name_ru: 'Октябрьский',
    name_ky: 'Октябрь району',
    center_lat: 42.8646,
    center_lon: 74.5298,
    description: 'Октябрьский район'
  },
  {
    name: 'pervomaisky',
    name_ru: 'Первомайский',
    name_ky: 'Биринчи май району',
    center_lat: 42.8246,
    center_lon: 74.5898,
    description: 'Первомайский район'
  },
  {
    name: 'sverdlovsky',
    name_ru: 'Свердловский',
    name_ky: 'Свердлов району',
    center_lat: 42.9046,
    center_lon: 74.5598,
    description: 'Свердловский район'
  }
];

// Mock пользователи
export const mockUsers: User[] = [
  {
    id: 'user-001',
    phone: '+996700123456',
    email: 'user@example.com',
    first_name: 'Айгуль',
    last_name: 'Мамбетова',
    date_of_birth: '1990-05-15',
    gender: 'female',
    status: 'active',
    loyalty_tier: 'gold',
    loyalty_points: 1250,
    total_spent: 12500.00,
    total_visits: 15,
    last_visit_at: '2024-01-15T10:00:00Z',
    notification_email: true,
    notification_sms: true,
    notification_push: true,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-15T15:30:00Z'
  }
];

// Mock отзывы
export const mockReviews: Review[] = [
  {
    id: 'review-001',
    user_id: 'user-001',
    park_id: 'park-001',
    booking_id: 'booking-001',
    rating: 5,
    comment: 'Потрясающий парк! Дети в восторге, всё очень безопасно и весело. Обязательно вернёмся! 🎈',
    created_at: '2024-01-16T10:00:00Z',
    updated_at: '2024-01-16T10:00:00Z'
  },
  {
    id: 'review-002',
    user_id: 'user-001',
    park_id: 'park-002',
    booking_id: 'booking-002',
    rating: 5,
    comment: 'Отличное место для детей! Персонал очень дружелюбный, чисто и организованно. Рекомендую всем родителям! 👍',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z'
  }
];

// Функция для добавления delay в mock запросы
export const mockDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Функция для имитации ошибок API
export const mockError = (message: string = 'Произошла ошибка') => 
  Promise.reject(new Error(message));

// Функция для поиска парков
export const searchParks = (parks: Park[], query: string): Park[] => {
  if (!query.trim()) return parks;
  
  const lowerQuery = query.toLowerCase();
  return parks.filter(park => 
    park.name.toLowerCase().includes(lowerQuery) ||
    park.description.toLowerCase().includes(lowerQuery) ||
    park.address.toLowerCase().includes(lowerQuery) ||
    park.amenities.some(amenity => amenity.toLowerCase().includes(lowerQuery))
  );
};

// Функция для фильтрации по району
export const filterByDistrict = (parks: Park[], district: string): Park[] => {
  if (!district) return parks;
  
  // Простая логика на основе координат
  const districtCenter = mockDistricts.find(d => d.name === district);
  if (!districtCenter) return parks;
  
  return parks.filter(park => {
    const distance = Math.sqrt(
      Math.pow(park.latitude - districtCenter.center_lat, 2) +
      Math.pow(park.longitude - districtCenter.center_lon, 2)
    );
    return distance < 0.05; // Примерно 5км в градусах
  });
};

// Функция для сортировки парков
export const sortParks = (parks: Park[], sort: string, order: string): Park[] => {
  const sortedParks = [...parks];
  
  switch (sort) {
    case 'name':
      sortedParks.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'rating':
      sortedParks.sort((a, b) => b.rating - a.rating);
      break;
    case 'created_at':
      sortedParks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
    default:
      return parks;
  }
  
  return order === 'desc' ? sortedParks.reverse() : sortedParks;
}; 