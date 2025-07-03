import { NextRequest, NextResponse } from 'next/server';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || process.env.DEMO_MODE === 'true';

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

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
      
      // Только специальный админский номер
      if (phone !== '+996700123456') {
        return NextResponse.json(
          { error: { message: 'Номер не найден в системе администраторов' } },
          { status: 404 }
        );
      }

      // В demo режиме любой 6-значный код подходит для админа
      const adminUser = {
        id: 'b1c2d3e4-f5a6-7890-bcde-f01234567890',
        phone,
        first_name: 'Админ',
        last_name: 'Системы',
        full_name: 'Админ Системы',
        email: 'admin@skypark.kg',
        loyalty_tier: 'vip',
        loyalty_points: 0,
        status: 'active',
        created_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
        phone_verified_at: new Date().toISOString(),
        // Админские поля
        admin_id: 'admin_001',
        organization_id: 'org_skypark_main',
        role: 'super_admin',
        permissions: [
          'users.read',
          'users.write',
          'bookings.read',
          'bookings.write',
          'parks.read',
          'parks.write',
          'analytics.read',
          'system.admin'
        ],
        is_active: true,
      };

      const tokens = {
        access_token: 'demo_admin_access_token_' + Date.now(),
        refresh_token: 'demo_admin_refresh_token_' + Date.now(),
        token_type: 'Bearer'
      };

      return NextResponse.json({
        success: true,
        message: 'Администратор авторизован',
        data: {
          user: adminUser,
          tokens,
          is_admin: true
        }
      });
    }

    // Здесь будет реальная проверка администратора в базе данных
    // Пока возвращаем ошибку для production режима
    return NextResponse.json(
      { error: { message: 'Функция доступна только в demo режиме' } },
      { status: 501 }
    );

  } catch (error) {
    console.error('Error verifying admin code:', error);
    return NextResponse.json(
      { error: { message: 'Ошибка проверки админского кода' } },
      { status: 500 }
    );
  }
} 