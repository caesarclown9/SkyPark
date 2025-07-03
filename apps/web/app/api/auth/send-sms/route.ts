import { NextRequest, NextResponse } from 'next/server';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || process.env.DEMO_MODE === 'true';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: { message: 'Номер телефона обязателен' } },
        { status: 400 }
      );
    }

    // Валидация номера телефона для Кыргызстана
    const phoneRegex = /^\+996[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: { message: 'Неверный формат номера телефона' } },
        { status: 400 }
      );
    }

    if (DEMO_MODE) {
      // В demo режиме всегда успешно
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация задержки
      
      return NextResponse.json({
        success: true,
        message: 'SMS код отправлен',
        data: {
          phone,
          code_sent: true,
          demo_mode: true
        }
      });
    }

    // Здесь будет реальная интеграция с SMS провайдером
    // Пока возвращаем успех для всех номеров
    return NextResponse.json({
      success: true,
      message: 'SMS код отправлен',
      data: {
        phone,
        code_sent: true
      }
    });

  } catch (error) {
    console.error('Error sending SMS:', error);
    return NextResponse.json(
      { error: { message: 'Ошибка отправки SMS' } },
      { status: 500 }
    );
  }
} 