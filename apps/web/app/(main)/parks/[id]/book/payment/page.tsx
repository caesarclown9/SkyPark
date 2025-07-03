import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import PaymentFlow from '@/components/payment/PaymentFlow';

interface PaymentPageProps {
  params: {
    id: string;
  };
  searchParams: {
    booking?: string;
  };
}

async function PaymentPageContent({ params, searchParams }: PaymentPageProps) {
  if (!searchParams.booking) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PaymentFlow bookingId={searchParams.booking} parkId={params.id} />
    </div>
  );
}

export default function PaymentPage(props: PaymentPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mb-4"></div>
          <p className="text-gray-600">Загрузка платежной формы...</p>
        </div>
      </div>
    }>
      <PaymentPageContent {...props} />
    </Suspense>
  );
}

export async function generateMetadata({ params }: PaymentPageProps) {
  return {
    title: 'Оплата бронирования | Sky Park',
    description: 'Безопасная оплата бронирования в детском парке',
  };
} 
 