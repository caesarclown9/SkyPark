import { NextRequest, NextResponse } from 'next/server';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || process.env.DEMO_MODE === 'true';

export async function POST(request: NextRequest) {
  try {
    const { phone, code, userData } = await request.json();

    if (!phone || !code) {
      return NextResponse.json(
        { error: { message: 'Номер телефона и код обязательны' } },
        { status: 400 }
      );
    }

    // Валидация кода (6 цифр)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: { message: 'Код должен содержать 6 цифр' } },
        { status: 400 }
      );
    }

    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Имитация задержки
      
      // В demo режиме любой 6-значный код подходит
      const isNewUser = userData !== undefined;
      const userId = phone === '+996700654321' ? 'c2d3e4f5-a6b7-8901-cdef-012345678901' : 'demo_user_' + Date.now();
      
      const user = {
        id: userId,
        phone,
        first_name: userData?.first_name || (phone === '+996700654321' ? 'Айгуль' : 'Demo'),
        last_name: userData?.last_name || (phone === '+996700654321' ? 'Мамбетова' : 'User'),
        full_name: userData ? `${userData.first_name} ${userData.last_name}` : (phone === '+996700654321' ? 'Айгуль Мамбетова' : 'Demo User'),
        email: userData?.email || (phone === '+996700654321' ? 'user@example.com' : null),
        loyalty_tier: 'friend',
        loyalty_points: 0,
        status: 'active',
        created_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
        phone_verified_at: new Date().toISOString(),
      };

      const tokens = {
        access_token: 'demo_access_token_' + Date.now(),
        refresh_token: 'demo_refresh_token_' + Date.now(),
        token_type: 'Bearer'
      };

      return NextResponse.json({
        success: true,
        message: isNewUser ? 'Пользователь зарегистрирован' : 'Вход выполнен',
        data: {
          user,
          tokens,
          is_new_user: isNewUser
        }
      });
    }

    // Здесь будет реальная проверка кода и взаимодействие с базой данных
    // Пока возвращаем ошибку для production режима
    return NextResponse.json(
      { error: { message: 'Функция доступна только в demo режиме' } },
      { status: 501 }
    );

  } catch (error) {
    console.error('Error verifying code:', error);
    return NextResponse.json(
      { error: { message: 'Ошибка проверки кода' } },
      { status: 500 }
    );
  }
} 