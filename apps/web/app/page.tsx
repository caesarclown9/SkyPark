'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { 
  MapPin, 
  Star, 
  Clock, 
  Shield, 
  Smartphone, 
  Gift,
  PlayCircle,
  Users,
  Heart,
  ChevronRight,
  Zap,
  Trophy,
  Camera,
  Music,
  Gamepad2,
  Sparkles,
  Quote,
  Calendar,
  Phone,
  Mail,
  MessageCircle,
  ArrowRight,
  CheckCircle,
  Map,
  CalendarDays,
  Navigation,
  PartyPopper,
  ImageIcon,
  ChevronLeft
} from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-50 to-sky-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
          <p className="text-purple-600 font-medium">Загрузка магии...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-sky-50">
      {/* Animated Header */}
      <header className="bg-white shadow-lg border-b-4 border-gradient-to-r from-pink-400 to-purple-500 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center group">
                <div className="relative">
                  <PlayCircle className="h-10 w-10 text-purple-600 group-hover:text-pink-500 transition-colors duration-300" />
                  <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  Sky Park
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                    👤 Личный кабинет
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/login">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                    🎈 Вход
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Floating Elements */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Floating Animation Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-16 h-16 bg-yellow-300 rounded-full opacity-70 animate-bounce" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-32 right-20 w-12 h-12 bg-pink-300 rounded-full opacity-60 animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-48 left-1/4 w-8 h-8 bg-purple-300 rounded-full opacity-50 animate-bounce" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-32 right-10 w-20 h-20 bg-blue-300 rounded-full opacity-40 animate-bounce" style={{animationDelay: '0.5s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <span className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold rounded-full text-lg shadow-lg transform rotate-2">
              🎪 Самые крутые парки в городе! 🎠
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8">
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent">
              Волшебные
            </span>
            <br />
            <span className="text-gray-800">детские</span>
            <br />
            <span className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              приключения! 🚀
            </span>
          </h1>

          <p className="text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed">
            🎈 Безопасные игровые зоны, захватывающие аттракционы и море веселья! 
            <br />
            <span className="text-purple-600 font-semibold">Каждый день - новое приключение для ваших малышей!</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xl px-12 py-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 font-bold">
                  👤 Мой кабинет
                  <ChevronRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth/login">
                <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xl px-12 py-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 font-bold">
                  🎪 Начать приключение!
                  <Sparkles className="ml-2 h-6 w-6" />
                </Button>
              </Link>
            )}
            <Link href="/parks">
              <Button variant="outline" size="lg" className="border-3 border-purple-400 text-purple-600 hover:bg-purple-50 text-xl px-12 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-bold">
                🗺️ Найти парки рядом
                <MapPin className="ml-2 h-6 w-6" />
              </Button>
            </Link>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-xl border-2 border-yellow-200 hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold text-purple-600">15+</div>
              <div className="text-gray-600 font-medium">🏰 Парков</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-xl border-2 border-pink-200 hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold text-pink-600">50K+</div>
              <div className="text-gray-600 font-medium">👨‍👩‍👧‍👦 Счастливых семей</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-xl border-2 border-blue-200 hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold text-blue-600">100+</div>
              <div className="text-gray-600 font-medium">🎠 Аттракционов</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-xl border-2 border-green-200 hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold text-green-600">4.9</div>
              <div className="text-gray-600 font-medium">⭐ Рейтинг</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Features Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-full text-lg mb-6">
              ✨ Почему мы особенные?
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                Родители выбирают нас, потому что...
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Мы создали волшебный мир, где каждый ребенок чувствует себя героем сказки! 🧚‍♀️
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "100% Безопасность",
                description: "🛡️ Все аттракционы сертифицированы, зоны под видеонаблюдением 24/7",
                color: "from-green-400 to-blue-500",
                bgColor: "bg-green-50"
              },
              {
                icon: Smartphone,
                title: "Умное бронирование",
                description: "📱 Бронируйте в 3 клика через приложение - быстро и удобно!",
                color: "from-blue-400 to-purple-500",
                bgColor: "bg-blue-50"
              },
              {
                icon: Gift,
                title: "Программа лояльности",
                description: "🎁 Копите баллы, получайте подарки и бесплатные развлечения!",
                color: "from-purple-400 to-pink-500",
                bgColor: "bg-purple-50"
              },
              {
                icon: Users,
                title: "Возрастные зоны",
                description: "👶 От малышей до подростков - каждому возрасту свое веселье!",
                color: "from-pink-400 to-red-500",
                bgColor: "bg-pink-50"
              },
              {
                icon: Clock,
                title: "Работаем всегда",
                description: "⏰ 7 дней в неделю, удобные временные слоты для семей",
                color: "from-orange-400 to-red-500",
                bgColor: "bg-orange-50"
              },
              {
                icon: Heart,
                title: "Семейный уют",
                description: "💕 Комфортные зоны для родителей, детское кафе, дни рождения",
                color: "from-red-400 to-pink-500",
                bgColor: "bg-red-50"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className={`${feature.bgColor} rounded-3xl p-8 shadow-xl border-2 border-white hover:scale-105 transform transition-all duration-300 hover:shadow-2xl group cursor-pointer`}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">{feature.title}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Slider Section */}
      <section className="py-24 bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-yellow-500 text-white font-bold rounded-full text-lg mb-6">
              📸 Моменты счастья
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
                Смотрите, как дети радуются! 😄
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Каждый день мы создаём незабываемые моменты для тысяч детей! 🌟
            </p>
          </div>

          {/* Slider Container */}
          <div className="relative overflow-hidden rounded-3xl shadow-2xl">
            <div className="flex transition-transform duration-500 ease-in-out">
              {[
                { title: "Дети в игровой зоне", desc: "Безопасные и веселые игры для малышей", color: "from-pink-400 to-purple-500" },
                { title: "День рождения в парке", desc: "Незабываемые праздники с аниматорами", color: "from-blue-400 to-cyan-500" },
                { title: "Семейное веселье", desc: "Родители и дети играют вместе", color: "from-green-400 to-teal-500" },
                { title: "Аттракционы и горки", desc: "Захватывающие приключения для детей", color: "from-orange-400 to-red-500" }
              ].map((slide, index) => (
                <div key={index} className="min-w-full">
                  <div className={`h-96 bg-gradient-to-br ${slide.color} flex items-center justify-center relative overflow-hidden`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-bounce"></div>
                      <div className="absolute bottom-10 right-10 w-16 h-16 bg-yellow-300 rounded-full animate-pulse"></div>
                      <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-pink-300 rounded-full animate-ping"></div>
                    </div>
                    
                    <div className="text-center text-white z-10">
                      <ImageIcon className="h-24 w-24 mx-auto mb-6 opacity-80" />
                      <h3 className="text-3xl font-bold mb-4">{slide.title}</h3>
                      <p className="text-xl opacity-90">{slide.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Slider Controls */}
            <div className="absolute inset-y-0 left-0 flex items-center">
              <button className="bg-white/20 backdrop-blur hover:bg-white/30 text-white p-3 rounded-full ml-4 transition-all duration-200 hover:scale-110">
                <ChevronLeft className="h-6 w-6" />
              </button>
              </div>
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button className="bg-white/20 backdrop-blur hover:bg-white/30 text-white p-3 rounded-full mr-4 transition-all duration-200 hover:scale-110">
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {[0, 1, 2, 3].map((dot) => (
                <button
                  key={dot}
                  className="w-3 h-3 rounded-full bg-white/50 hover:bg-white transition-all duration-200"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-full text-lg mb-6">
              🗺️ Карта парков
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Найдите ближайший парк! 📍
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              15 современных детских парков по всему Бишкеку ждут ваших малышей! 🏰
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Map Area */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-3xl p-8 shadow-xl border-2 border-cyan-200 relative overflow-hidden h-96">
                {/* Interactive Map Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-200 to-blue-200 opacity-50"></div>
                <div className="relative z-10 h-full flex items-center justify-center">
                  <div className="text-center">
                    <Map className="h-20 w-20 text-cyan-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-cyan-800 mb-2">Интерактивная карта</h3>
                    <p className="text-cyan-700">Кликните на маркеры для подробной информации о парках</p>
                  </div>
                </div>
                
                {/* Map Markers */}
                <div className="absolute top-1/4 left-1/3 w-6 h-6 bg-red-500 rounded-full animate-pulse border-2 border-white shadow-lg"></div>
                <div className="absolute top-1/2 right-1/4 w-6 h-6 bg-red-500 rounded-full animate-pulse border-2 border-white shadow-lg"></div>
                <div className="absolute bottom-1/3 left-1/2 w-6 h-6 bg-red-500 rounded-full animate-pulse border-2 border-white shadow-lg"></div>
                <div className="absolute top-1/3 right-1/3 w-6 h-6 bg-red-500 rounded-full animate-pulse border-2 border-white shadow-lg"></div>
              </div>
            </div>

            {/* Parks List */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Navigation className="h-6 w-6 text-cyan-500 mr-3" />
                Наши парки
              </h3>
              
              {[
                { name: "Sky Park Центр", address: "ул. Чуй, 123", distance: "2.1 км", rating: "4.9" },
                { name: "Sky Park Восток", address: "мкр. Восток-5", distance: "3.7 км", rating: "4.8" },
                { name: "Sky Park Запад", address: "ул. Ахунбаева, 45", distance: "1.8 км", rating: "4.9" },
                { name: "Sky Park Юг", address: "мкр. Джал", distance: "5.2 км", rating: "4.7" }
              ].map((park, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 shadow-lg border border-cyan-100 hover:scale-105 transform transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-800">{park.name}</h4>
                      <p className="text-gray-600 text-sm">{park.address}</p>
                      <div className="flex items-center mt-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm text-gray-600">{park.rating}</span>
                        <span className="text-cyan-600 text-sm ml-4">📍 {park.distance}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-cyan-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Events Calendar Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-full text-lg mb-6">
              📅 События и мероприятия
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Что нас ждёт впереди? 🎪
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Каждую неделю у нас проходят особенные события и праздники! 🎉
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calendar */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-indigo-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <CalendarDays className="h-7 w-7 text-indigo-500 mr-3" />
                  Февраль 2024
                </h3>
                <div className="flex space-x-2">
                  <button className="p-2 hover:bg-indigo-50 rounded-full transition-colors">
                    <ChevronLeft className="h-5 w-5 text-indigo-500" />
                  </button>
                  <button className="p-2 hover:bg-indigo-50 rounded-full transition-colors">
                    <ChevronRight className="h-5 w-5 text-indigo-500" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-500 py-2">
                    {day}
                  </div>
                ))}
            </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({length: 35}, (_, i) => {
                  const day = i - 3; // Starting from Monday
                  const isToday = day === 15;
                  const hasEvent = [3, 10, 17, 24].includes(day);
                  
                  return (
                    <div 
                      key={i}
                      className={`
                        aspect-square flex items-center justify-center text-sm rounded-lg cursor-pointer transition-all duration-200
                        ${day < 1 || day > 29 ? 'text-gray-300' : 'text-gray-700 hover:bg-indigo-50'}
                        ${isToday ? 'bg-indigo-500 text-white font-bold' : ''}
                        ${hasEvent ? 'bg-purple-100 text-purple-700 font-semibold' : ''}
                      `}
                    >
                      {day > 0 && day <= 29 ? day : ''}
                      {hasEvent && (
                        <div className="absolute w-2 h-2 bg-purple-500 rounded-full mt-6"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <PartyPopper className="h-7 w-7 text-purple-500 mr-3" />
                Ближайшие события
              </h3>

              {[
                {
                  date: "3 февраля",
                  title: "🎭 Шоу аниматоров",
                  time: "15:00 - 17:00",
                  description: "Интерактивное представление с любимыми персонажами",
                  color: "from-pink-400 to-red-400"
                },
                {
                  date: "10 февраля",
                  title: "🎨 Мастер-класс по рисованию",
                  time: "14:00 - 16:00", 
                  description: "Творческая мастерская для детей 5-12 лет",
                  color: "from-blue-400 to-cyan-400"
                },
                {
                  date: "17 февраля",
                  title: "🏆 Спортивные соревнования",
                  time: "11:00 - 13:00",
                  description: "Весёлые эстафеты и игры для всей семьи",
                  color: "from-green-400 to-teal-400"
                },
                {
                  date: "24 февраля",
                  title: "🎂 День именинника",
                  time: "16:00 - 18:00",
                  description: "Особенный праздник для февральских именинников",
                  color: "from-purple-400 to-pink-400"
                }
              ].map((event, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:scale-105 transform transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${event.color} rounded-2xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {event.date.split(' ')[0]}
                      <br />
                      {event.date.split(' ')[1]}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 text-lg mb-1">{event.title}</h4>
                      <p className="text-purple-600 font-medium text-sm mb-2">⏰ {event.time}</p>
                      <p className="text-gray-600 text-sm leading-relaxed">{event.description}</p>
                      <button className="mt-3 text-purple-600 font-medium text-sm hover:text-purple-800 transition-colors">
                        Подробнее →
                      </button>
                    </div>
                  </div>
              </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Preview Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-full text-lg mb-6">
              📸 Наша галерея
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Посмотрите на счастье детей! 😊
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div 
                key={item}
                className="aspect-square bg-gradient-to-br from-pink-200 to-purple-300 rounded-2xl shadow-lg hover:scale-105 transform transition-all duration-300 flex items-center justify-center cursor-pointer group"
              >
                <Camera className="h-12 w-12 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/parks">
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                🎨 Посмотреть все фото
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-full text-lg mb-6">
              💬 Отзывы родителей
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Что говорят о нас семьи? 👨‍👩‍👧‍👦
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Айнура Алматова",
                role: "Мама двоих детей",
                text: "Мои дети просто в восторге! Безопасно, весело и всегда что-то новое. Теперь это наше любимое место для выходных! 🥰",
                rating: 5
              },
              {
                name: "Максат Токтосунов", 
                role: "Папа троих детей",
                text: "Отличная организация, чистота, вежливый персонал. Дети не хотят уходить! Рекомендую всем родителям! 👍",
                rating: 5
              },
              {
                name: "Гульмира Сатаева",
                role: "Бабушка пятерых внуков",
                text: "Здесь учитывают потребности детей разного возраста. Внуки довольны, а я спокойна за их безопасность! ❤️",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white rounded-3xl p-8 shadow-xl border-2 border-pink-100 hover:scale-105 transform transition-all duration-300 relative"
              >
                <Quote className="h-8 w-8 text-pink-400 mb-4" />
                <p className="text-gray-700 text-lg mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mr-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{testimonial.name}</div>
                    <div className="text-gray-500 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-full text-lg mb-6">
              ❓ Часто задаваемые вопросы
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Есть вопросы? Мы ответим! 🤔
              </span>
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "С какого возраста можно посещать парки?",
                answer: "Наши парки подходят для детей от 1 года до 14 лет. У нас есть специальные зоны для малышей и отдельные развлечения для подростков! 👶👧👦"
              },
              {
                question: "Безопасно ли в ваших парках?",
                answer: "Абсолютно! Все оборудование сертифицировано, регулярно проверяется. Работает видеонаблюдение 24/7 и квалифицированный персонал. 🛡️"
              },
              {
                question: "Можно ли проводить дни рождения?",
                answer: "Конечно! У нас есть специальные пакеты для празднования дней рождения с аниматорами, тортом и незабываемой программой! 🎂🎈"
              },
              {
                question: "Как забронировать билеты?",
                answer: "Очень просто! Через наше мобильное приложение в 3 клика, онлайн на сайте или по телефону. Оплата картой или наличными. 📱💳"
              }
            ].map((faq, index) => (
              <div 
                key={index}
                className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 shadow-lg border-2 border-blue-100 hover:scale-102 transform transition-all duration-300"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                  <CheckCircle className="h-6 w-6 text-blue-500 mr-3" />
                  {faq.question}
                </h3>
                <p className="text-gray-700 leading-relaxed pl-9">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-yellow-300 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-pink-300 rounded-full animate-ping"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-8">
            <Sparkles className="h-16 w-16 text-yellow-300 mx-auto animate-pulse" />
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Готовы подарить детям
            <br />
            <span className="text-yellow-300">магические моменты? ✨</span>
          </h2>
          
          <p className="text-2xl text-purple-100 mb-12">
            🎪 Присоединяйтесь к 50,000+ счастливых семей уже сегодня!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link href="/auth/login">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-xl px-12 py-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 font-bold">
                🚀 Начать бесплатно!
                <Sparkles className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <Link href="/parks">
              <Button variant="outline" size="lg" className="border-3 border-white text-white hover:bg-white hover:text-purple-600 text-xl px-12 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-bold">
                🗺️ Посмотреть парки
                <MapPin className="ml-2 h-6 w-6" />
            </Button>
          </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6">
                <PlayCircle className="h-10 w-10 text-purple-400" />
                <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Sky Park
                </span>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                🎪 Лучшие детские развлекательные центры в Бишкеке. 
                Безопасность, веселье и незабываемые впечатления для всей семьи.
              </p>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-purple-400" />
                <span className="text-gray-300">📍 Бишкек, Кыргызстан</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-6 text-purple-400">🔗 Быстрые ссылки</h3>
              <ul className="space-y-3">
                {['Наши парки', 'Цены', 'Акции', 'Контакты'].map((link) => (
                  <li key={link}>
                    <Link href="/auth/login" className="text-gray-300 hover:text-purple-400 transition-colors duration-200 flex items-center">
                      <ChevronRight className="h-4 w-4 mr-2" />
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-6 text-purple-400">🆘 Поддержка</h3>
              <ul className="space-y-3">
                {[
                  { name: 'Помощь', icon: MessageCircle },
                  { name: 'FAQ', icon: CheckCircle },
                  { name: 'Политика конфиденциальности', icon: Shield },
                  { name: 'Условия использования', icon: CheckCircle }
                ].map((link) => (
                  <li key={link.name}>
                    <Link href="/auth/login" className="text-gray-300 hover:text-purple-400 transition-colors duration-200 flex items-center">
                      <link.icon className="h-4 w-4 mr-2" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 mt-12 text-center">
            <p className="text-gray-400">
              © 2024 Sky Park. 🎈 Все права защищены. Создано с ❤️ для детей и их родителей.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 