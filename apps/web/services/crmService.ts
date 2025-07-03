import { API_BASE_URL } from '@/lib/utils';

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    loyalty_tier?: string[];
    total_spent_min?: number;
    total_spent_max?: number;
    visit_frequency?: 'regular' | 'occasional' | 'rare';
    last_visit_days?: number;
    registration_days?: number;
  };
  user_count: number;
  growth_rate: number;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  type: 'email' | 'push' | 'sms';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  target_segment: string;
  subject: string;
  content: string;
  scheduled_at?: string;
  sent_at?: string;
  stats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  };
  created_at: string;
}

export interface CustomerJourney {
  stage: 'visitor' | 'lead' | 'customer' | 'loyal' | 'champion';
  triggers: string[];
  actions: string[];
  next_stage_criteria: string;
}

export interface CRMDashboard {
  total_customers: number;
  new_customers_today: number;
  active_campaigns: number;
  revenue_this_month: number;
  segments: CustomerSegment[];
  recent_campaigns: MarketingCampaign[];
  customer_journey_stats: Record<string, number>;
}

class CRMService {
  async getCRMDashboard(): Promise<CRMDashboard> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      total_customers: 15847,
      new_customers_today: 23,
      active_campaigns: 4,
      revenue_this_month: 2847500,
      segments: [
        {
          id: 'vip-customers',
          name: 'VIP клиенты',
          description: 'Клиенты со статусом Gold и Platinum',
          criteria: { loyalty_tier: ['gold', 'platinum'] },
          user_count: 234,
          growth_rate: 12.5
        },
        {
          id: 'regular-visitors',
          name: 'Постоянные посетители',
          description: 'Клиенты с частыми визитами',
          criteria: { visit_frequency: 'regular', last_visit_days: 30 },
          user_count: 1456,
          growth_rate: 8.3
        },
        {
          id: 'inactive-customers',
          name: 'Неактивные клиенты',
          description: 'Не посещали более 3 месяцев',
          criteria: { last_visit_days: 90 },
          user_count: 987,
          growth_rate: -5.2
        }
      ],
      recent_campaigns: [
        {
          id: 'camp-1',
          name: 'Весенние скидки',
          type: 'email',
          status: 'active',
          target_segment: 'regular-visitors',
          subject: 'Скидка 20% на весенние каникулы!',
          content: 'Специальное предложение для постоянных клиентов...',
          scheduled_at: '2025-03-01T10:00:00Z',
          stats: { sent: 1456, delivered: 1398, opened: 987, clicked: 234 },
          created_at: '2025-01-25T14:30:00Z'
        }
      ],
      customer_journey_stats: {
        visitor: 2456,
        lead: 1234,
        customer: 8567,
        loyal: 2890,
        champion: 700
      }
    };
  }

  async getCustomerSegments(): Promise<CustomerSegment[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: 'new-customers',
        name: 'Новые клиенты',
        description: 'Зарегистрированы менее месяца назад',
        criteria: { registration_days: 30 },
        user_count: 456,
        growth_rate: 25.3
      },
      {
        id: 'high-spenders',
        name: 'Высокие траты',
        description: 'Потратили более 5000 сом',
        criteria: { total_spent_min: 5000 },
        user_count: 789,
        growth_rate: 15.7
      },
      {
        id: 'family-visitors',
        name: 'Семейные клиенты',
        description: 'Часто приходят с детьми',
        criteria: {},
        user_count: 2345,
        growth_rate: 12.1
      }
    ];
  }

  async createMarketingCampaign(campaign: Partial<MarketingCampaign>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    console.log('Маркетинговая кампания создана:', campaign);
  }

  async sendTestCampaign(campaignId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log('Тестовая кампания отправлена:', campaignId);
  }

  async setupAutomation(trigger: string, action: string, segment: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 600));
    console.log('Автоматизация настроена:', { trigger, action, segment });
  }

  async getCustomerInsights(userId: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 900));
    
    return {
      total_visits: 12,
      favorite_parks: ['Fantasy World', 'Happy Land'],
      avg_spend_per_visit: 750,
      loyalty_tier: 'gold',
      next_predicted_visit: '2025-02-15',
      preferences: ['weekend_visits', 'family_activities'],
      marketing_response_rate: 45.6
    };
  }
}

export const crmService = new CRMService(); 