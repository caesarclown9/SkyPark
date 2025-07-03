# Sky Park Frontend Specification

## 1. Design System Overview

### 1.1 Color Palette - "Rainbow of Joy"
```css
:root {
  /* Primary Colors */
  --sky-blue: #87CEEB;          /* Primary brand color */
  --sunshine-yellow: #FFD700;    /* Secondary bright accent */
  --soft-pink: #FFB6C1;         /* Tertiary feminine touch */
  
  /* Status Colors */
  --success-green: #32CD32;     /* Success states, confirmations */
  --warning-orange: #FFA500;    /* Warnings, capacity alerts */
  --error-red: #FF6B6B;         /* Errors, critical alerts */
  
  /* Neutral Colors */
  --white: #FFFFFF;
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-200: #E5E7EB;
  --gray-300: #D1D5DB;
  --gray-500: #6B7280;
  --gray-700: #374151;
  --gray-900: #111827;
  
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, var(--sky-blue), var(--soft-pink));
  --gradient-button: linear-gradient(45deg, var(--sky-blue), var(--sunshine-yellow));
}
```

### 1.2 Typography
```css
/* Font Families */
--font-heading: 'Nunito', sans-serif;    /* Playful but readable headers */
--font-body: 'Open Sans', sans-serif;    /* Clean, readable body text */

/* Font Sizes (Mobile First) */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
```

### 1.3 Spacing & Layout
```css
/* Spacing Scale */
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */

/* Border Radius */
--radius-sm: 8px;      /* Small elements */
--radius-md: 12px;     /* Cards, inputs */
--radius-lg: 16px;     /* Cards, panels */
--radius-xl: 24px;     /* Buttons, prominent elements */
--radius-full: 9999px; /* Pills, avatars */

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

## 2. Component Library

### 2.1 Button Components

#### Primary Button
```tsx
interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  size = 'md',
  fullWidth = false,
}) => {
  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-sky-blue focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-95 transform',
        
        // Gradient background
        'bg-gradient-to-r from-sky-blue to-sunshine-yellow text-white',
        'hover:from-sky-600 hover:to-yellow-500',
        
        // Size variants
        {
          'px-3 py-2 text-sm min-h-[32px]': size === 'sm',
          'px-4 py-3 text-base min-h-[44px]': size === 'md',
          'px-6 py-4 text-lg min-h-[52px]': size === 'lg',
        },
        
        // Full width
        { 'w-full': fullWidth }
      )}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <LoadingSpinner className="mr-2" />}
      {children}
    </button>
  );
};
```

#### Secondary Button
```tsx
const SecondaryButton: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-xl',
        'border-2 border-sky-blue text-sky-blue bg-white',
        'hover:bg-sky-50 focus:ring-2 focus:ring-sky-blue',
        'active:scale-95 transform transition-all duration-200',
        // Size variants same as primary
      )}
      {...props}
    >
      {children}
    </button>
  );
};
```

### 2.2 Input Components

#### Text Input
```tsx
interface TextInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'tel' | 'password';
  icon?: React.ReactNode;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  type = 'text',
  icon,
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-error-red ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full px-4 py-3 rounded-lg border border-gray-200',
            'focus:border-sky-blue focus:ring-2 focus:ring-sky-blue/20',
            'transition-colors duration-200',
            { 'pl-10': icon },
            { 'border-error-red focus:border-error-red': error }
          )}
        />
      </div>
      
      {error && (
        <p className="text-sm text-error-red">{error}</p>
      )}
    </div>
  );
};
```

### 2.3 Card Components

#### Ticket Card
```tsx
interface TicketCardProps {
  ticket: {
    id: string;
    parkName: string;
    visitDate: string;
    children: Array<{ name: string; age: number }>;
    qrCode: string;
    status: 'active' | 'used' | 'expired';
  };
  onShowQR: () => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onShowQR }) => {
  const statusColors = {
    active: 'bg-success-green',
    used: 'bg-gray-400',
    expired: 'bg-error-red',
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      {/* Header with park image */}
      <div className="relative h-24 bg-gradient-to-r from-sky-blue to-soft-pink">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-2 left-4 text-white">
          <h3 className="font-heading font-bold text-lg">{ticket.parkName}</h3>
          <p className="text-sm opacity-90">{formatDate(ticket.visitDate)}</p>
        </div>
        
        {/* Status badge */}
        <div className={cn(
          'absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium text-white',
          statusColors[ticket.status]
        )}>
          {ticket.status === 'active' ? 'Активный' : 
           ticket.status === 'used' ? 'Использован' : 'Истек'}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-600">Детей: {ticket.children.length}</p>
            <p className="text-xs text-gray-500">
              {ticket.children.map(child => `${child.name} (${child.age})`).join(', ')}
            </p>
          </div>
        </div>
        
        {ticket.status === 'active' && (
          <PrimaryButton 
            onClick={onShowQR}
            fullWidth
            size="sm"
          >
            <QRCodeIcon className="w-4 h-4 mr-2" />
            Показать QR код
          </PrimaryButton>
        )}
      </div>
    </div>
  );
};
```

### 2.4 Park Card Component
```tsx
interface ParkCardProps {
  park: {
    id: string;
    name: string;
    address: string;
    capacity: number;
    currentOccupancy: number;
    image: string;
    pricing: { under3: number; over3: number };
  };
  onSelect: () => void;
}

const ParkCard: React.FC<ParkCardProps> = ({ park, onSelect }) => {
  const occupancyPercentage = (park.currentOccupancy / park.capacity) * 100;
  const capacityStatus = occupancyPercentage < 70 ? 'low' : 
                        occupancyPercentage < 90 ? 'medium' : 'high';
  
  const statusColors = {
    low: 'bg-success-green',
    medium: 'bg-warning-orange', 
    high: 'bg-error-red',
  };
  
  const statusText = {
    low: 'Свободно',
    medium: 'Умеренно',
    high: 'Заполнено',
  };
  
  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transform transition-transform hover:scale-105"
      onClick={onSelect}
    >
      {/* Image */}
      <div className="relative h-40">
        <img 
          src={park.image} 
          alt={park.name}
          className="w-full h-full object-cover"
        />
        
        {/* Capacity indicator */}
        <div className="absolute top-3 right-3">
          <div className={cn(
            'px-2 py-1 rounded-full text-xs font-medium text-white',
            statusColors[capacityStatus]
          )}>
            {statusText[capacityStatus]}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-heading font-bold text-lg text-gray-900 mb-1">
          {park.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3">{park.address}</p>
        
        {/* Pricing */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-xs text-gray-500">До 3 лет</p>
            <p className="font-semibold text-sky-blue">{park.pricing.under3} сом</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">3+ лет</p>
            <p className="font-semibold text-sky-blue">{park.pricing.over3} сом</p>
          </div>
        </div>
        
        {/* Occupancy bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Заполненность</span>
            <span>{Math.round(occupancyPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={cn('h-2 rounded-full transition-all', statusColors[capacityStatus])}
              style={{ width: `${occupancyPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
```

## 3. Layout Components

### 3.1 Main Layout
```tsx
interface MainLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  title?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  showBottomNav = true,
  title 
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="font-heading font-bold text-xl text-gray-900">
            {title || 'Sky Park'}
          </h1>
        </div>
      </header>
      
      {/* Main Content */}
      <main className={cn(
        'max-w-lg mx-auto px-4 py-6',
        { 'pb-20': showBottomNav } // Space for bottom nav
      )}>
        {children}
      </main>
      
      {/* Bottom Navigation */}
      {showBottomNav && <BottomNavigation />}
    </div>
  );
};
```

### 3.2 Bottom Navigation
```tsx
const BottomNavigation: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  
  const navItems = [
    { 
      id: 'home', 
      label: 'Главная', 
      icon: HomeIcon, 
      path: '/' 
    },
    { 
      id: 'parks', 
      label: 'Парки', 
      icon: MapIcon, 
      path: '/parks' 
    },
    { 
      id: 'buy', 
      label: 'Купить', 
      icon: PlusIcon, 
      path: '/tickets/buy',
      primary: true 
    },
    { 
      id: 'tickets', 
      label: 'Билеты', 
      icon: QRCodeIcon, 
      path: '/my-tickets' 
    },
    { 
      id: 'profile', 
      label: 'Профиль', 
      icon: UserIcon, 
      path: '/profile' 
    },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-lg mx-auto">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={cn(
                  'flex flex-col items-center justify-center py-2 px-1 transition-colors',
                  {
                    'text-sky-blue': isActive && !item.primary,
                    'text-gray-500': !isActive && !item.primary,
                  }
                )}
              >
                {item.primary ? (
                  <div className="bg-gradient-to-r from-sky-blue to-sunshine-yellow p-2 rounded-full mb-1">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <Icon className={cn('w-6 h-6 mb-1', {
                    'text-sky-blue': isActive,
                    'text-gray-500': !isActive,
                  })} />
                )}
                
                <span className={cn('text-xs font-medium', {
                  'text-sky-blue': isActive && !item.primary,
                  'text-gray-500': !isActive && !item.primary,
                  'text-gray-600': item.primary,
                })}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
```

## 4. Page Components

### 4.1 Home Page
```tsx
const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { activeTickets } = useTickets();
  const { parks } = useParks();
  
  return (
    <MainLayout title="Добро пожаловать!">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="text-center">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2">
            Привет, {user?.name}! 👋
          </h2>
          <p className="text-gray-600">
            Готовы к новым приключениям в Sky Park?
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-sky-blue mb-1">
              {user?.loyaltyPoints || 0}
            </div>
            <div className="text-sm text-gray-600">баллов</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-soft-pink mb-1">
              {activeTickets.length}
            </div>
            <div className="text-sm text-gray-600">активных билетов</div>
          </div>
        </div>
        
        {/* Main CTA */}
        <PrimaryButton 
          fullWidth 
          size="lg"
          onClick={() => router.push('/tickets/buy')}
        >
          <TicketIcon className="w-6 h-6 mr-2" />
          Купить билет
        </PrimaryButton>
        
        {/* Parks Carousel */}
        <div>
          <h3 className="font-heading text-lg font-semibold mb-3">
            Наши парки
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {parks.map((park) => (
              <div key={park.id} className="flex-none w-64">
                <ParkCard 
                  park={park} 
                  onSelect={() => router.push(`/parks/${park.id}`)}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Active Tickets */}
        {activeTickets.length > 0 && (
          <div>
            <h3 className="font-heading text-lg font-semibold mb-3">
              Ваши билеты
            </h3>
            <div className="space-y-3">
              {activeTickets.slice(0, 2).map((ticket) => (
                <TicketCard 
                  key={ticket.id}
                  ticket={ticket}
                  onShowQR={() => router.push(`/my-tickets/${ticket.id}`)}
                />
              ))}
            </div>
            
            {activeTickets.length > 2 && (
              <button 
                className="w-full mt-3 text-sky-blue text-sm font-medium"
                onClick={() => router.push('/my-tickets')}
              >
                Показать все билеты ({activeTickets.length})
              </button>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};
```

### 4.2 QR Code Display Page
```tsx
const QRDisplayPage: React.FC<{ ticketId: string }> = ({ ticketId }) => {
  const { ticket } = useTicket(ticketId);
  const [brightness, setBrightness] = useState(100);
  
  useEffect(() => {
    // Maximize screen brightness for better scanning
    setBrightness(100);
    
    return () => {
      // Restore original brightness
      setBrightness(50);
    };
  }, []);
  
  if (!ticket) {
    return <div>Загрузка...</div>;
  }
  
  return (
    <MainLayout showBottomNav={false} title="QR код билета">
      <div className="flex flex-col items-center space-y-6">
        {/* Ticket Info */}
        <div className="text-center">
          <h2 className="font-heading text-xl font-bold text-gray-900 mb-1">
            {ticket.parkName}
          </h2>
          <p className="text-gray-600">{formatDate(ticket.visitDate)}</p>
          <p className="text-sm text-gray-500">
            {ticket.children.length} детей
          </p>
        </div>
        
        {/* QR Code */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <QRCodeSVG
            value={ticket.qrCode}
            size={280}
            level="M"
            includeMargin={true}
            className="block"
          />
        </div>
        
        {/* Backup Code */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Резервный код (если QR не сканируется):
          </p>
          <div className="bg-gray-100 px-4 py-2 rounded-lg">
            <code className="font-mono text-lg tracking-wider">
              {ticket.qrCode.slice(-8).toUpperCase()}
            </code>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="bg-sky-50 p-4 rounded-lg">
          <h4 className="font-semibold text-sky-900 mb-2">
            Инструкция для входа:
          </h4>
          <ol className="text-sm text-sky-800 space-y-1">
            <li>1. Покажите QR код на входе</li>
            <li>2. Дождитесь звукового сигнала</li>
            <li>3. Проходите, когда загорится зеленый свет</li>
          </ol>
        </div>
        
        {/* Share Button */}
        <SecondaryButton 
          onClick={() => shareTicket(ticket)}
          fullWidth
        >
          <ShareIcon className="w-5 h-5 mr-2" />
          Поделиться билетом
        </SecondaryButton>
      </div>
    </MainLayout>
  );
};
```

## 5. Mobile Responsive Guidelines

### 5.1 Breakpoints
```css
/* Mobile First Approach */
/* Default: 320px+ (small phones) */

@media (min-width: 375px) {
  /* Standard phones (iPhone SE, etc.) */
}

@media (min-width: 414px) {
  /* Large phones (iPhone Pro Max, etc.) */
}

@media (min-width: 768px) {
  /* Tablets (iPad, etc.) */
}

@media (min-width: 1024px) {
  /* Desktop (for admin/staff usage) */
}
```

### 5.2 Touch Targets
- **Minimum touch target**: 48x48px for all interactive elements
- **Preferred touch target**: 56x56px for primary actions
- **Spacing between targets**: Minimum 8px to prevent accidental taps

### 5.3 Accessibility
```tsx
// WCAG 2.1 AA Compliance
const AccessibleButton: React.FC = ({ children, ...props }) => {
  return (
    <button
      {...props}
      // Minimum contrast ratio 4.5:1
      className="focus:ring-2 focus:ring-offset-2 focus:outline-none"
      // Screen reader support
      aria-label={props['aria-label']}
      // Keyboard navigation
      tabIndex={0}
    >
      {children}
    </button>
  );
};
```

## 6. Animation & Micro-interactions

### 6.1 Button Interactions
```css
.button-primary {
  @apply transform transition-all duration-200 ease-out;
}

.button-primary:active {
  @apply scale-95;
}

.button-primary:hover {
  @apply shadow-lg;
}
```

### 6.2 Loading States
```tsx
const LoadingSpinner: React.FC = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
);

const SkeletonCard: React.FC = () => (
  <div className="animate-pulse bg-white rounded-xl p-4 space-y-3">
    <div className="h-4 bg-gray-200 rounded w-3/4" />
    <div className="h-3 bg-gray-200 rounded w-1/2" />
    <div className="h-8 bg-gray-200 rounded" />
  </div>
);
```

### 6.3 Success Animations
```tsx
const ConfettiSuccess: React.FC = () => {
  useEffect(() => {
    // Trigger confetti animation on successful ticket purchase
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);
  
  return (
    <div className="text-center space-y-4">
      <div className="text-6xl">🎉</div>
      <h2 className="text-2xl font-bold text-success-green">
        Билет успешно приобретен!
      </h2>
    </div>
  );
};
```

## 7. Performance Optimization

### 7.1 Image Optimization
```tsx
import Image from 'next/image';

const OptimizedImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
  <Image
    src={src}
    alt={alt}
    width={400}
    height={300}
    className="rounded-lg"
    loading="lazy"
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
  />
);
```

### 7.2 Code Splitting
```tsx
// Lazy load non-critical components
const QRGenerator = lazy(() => import('../components/QRGenerator'));
const PaymentForm = lazy(() => import('../components/PaymentForm'));

// Use Suspense for loading states
<Suspense fallback={<SkeletonCard />}>
  <QRGenerator />
</Suspense>
```

### 7.3 Bundle Size Targets
- **Initial JS bundle**: <200KB gzipped
- **Total page weight**: <1MB for main pages
- **Time to Interactive**: <3 seconds on 3G
- **Largest Contentful Paint**: <2.5 seconds

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Owner**: Frontend Team 
 