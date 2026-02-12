import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const PAYMENT_API_URL = 'https://functions.poehali.dev/904921a5-febc-4136-9455-b12df8b051ea';

interface Plan {
  plan_type: string;
  max_clients: number;
  max_calls_per_month: number;
  max_email_campaigns: number;
  ai_analysis_enabled: boolean;
  ai_suggestions_enabled: boolean;
  priority_support: boolean;
  price_monthly: string;
  price_yearly: string;
}

interface PricingPlansProps {
  currentPlan?: string;
  onPlanSelect?: (planType: string, billingPeriod: 'monthly' | 'yearly') => void;
}

export const PricingPlans = ({ currentPlan, onPlanSelect }: PricingPlansProps) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await fetch(`${PAYMENT_API_URL}?path=plans`);
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planType: string) => {
    if (onPlanSelect) {
      setProcessingPlan(planType);
      try {
        await onPlanSelect(planType, billingPeriod);
      } finally {
        setProcessingPlan(null);
      }
    }
  };

  const getPlanName = (planType: string) => {
    switch (planType) {
      case 'starter': return 'Стартовый';
      case 'professional': return 'Профессиональный';
      case 'enterprise': return 'Корпоративный';
      default: return planType;
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'starter': return 'Rocket';
      case 'professional': return 'Zap';
      case 'enterprise': return 'Crown';
      default: return 'Package';
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'starter': return 'from-blue-500 to-cyan-500';
      case 'professional': return 'from-purple-500 to-pink-500';
      case 'enterprise': return 'from-amber-500 to-orange-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(parseFloat(price));
  };

  const getMonthlyPrice = (plan: Plan) => {
    if (billingPeriod === 'yearly') {
      return Math.round(parseFloat(plan.price_yearly) / 12);
    }
    return parseFloat(plan.price_monthly);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center gap-4">
        <Label className="text-sm font-medium">Ежемесячно</Label>
        <Switch
          checked={billingPeriod === 'yearly'}
          onCheckedChange={(checked) => setBillingPeriod(checked ? 'yearly' : 'monthly')}
        />
        <Label className="text-sm font-medium">
          Ежегодно
          <Badge className="ml-2 bg-green-500/20 text-green-600 border-green-500/30">
            Скидка до 17%
          </Badge>
        </Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.plan_type;
          const isPopular = plan.plan_type === 'professional';

          return (
            <Card
              key={plan.plan_type}
              className={`relative p-6 transition-all hover:scale-105 ${
                isPopular ? 'border-2 border-primary shadow-xl' : 'border-border/50'
              } ${isCurrentPlan ? 'ring-2 ring-primary/50' : ''}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-primary to-secondary text-white border-0">
                    ⭐ Популярный
                  </Badge>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 right-6">
                  <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                    ✓ Текущий план
                  </Badge>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`inline-flex w-16 h-16 items-center justify-center rounded-full bg-gradient-to-br ${getPlanColor(plan.plan_type)} mb-4`}>
                  <Icon name={getPlanIcon(plan.plan_type)} size={28} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{getPlanName(plan.plan_type)}</h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-bold">{formatPrice(String(getMonthlyPrice(plan)))}</span>
                  <span className="text-muted-foreground">/мес</span>
                </div>
                {billingPeriod === 'yearly' && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {formatPrice(plan.price_yearly)} в год
                  </p>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Users" size={16} className="text-primary" />
                  <span>
                    {plan.max_clients === -1 ? 'Безлимитно' : `До ${plan.max_clients}`} клиентов
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Phone" size={16} className="text-primary" />
                  <span>
                    {plan.max_calls_per_month === -1 ? 'Безлимитно' : `До ${plan.max_calls_per_month}`} звонков/мес
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Mail" size={16} className="text-primary" />
                  <span>
                    {plan.max_email_campaigns === -1 ? 'Безлимитно' : `До ${plan.max_email_campaigns}`} рассылок
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icon name={plan.ai_analysis_enabled ? "CheckCircle2" : "Circle"} size={16} className={plan.ai_analysis_enabled ? "text-green-500" : "text-muted-foreground"} />
                  <span className={!plan.ai_analysis_enabled ? 'text-muted-foreground' : ''}>
                    ИИ-анализ звонков
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icon name={plan.ai_suggestions_enabled ? "CheckCircle2" : "Circle"} size={16} className={plan.ai_suggestions_enabled ? "text-green-500" : "text-muted-foreground"} />
                  <span className={!plan.ai_suggestions_enabled ? 'text-muted-foreground' : ''}>
                    ИИ-рекомендации
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icon name={plan.priority_support ? "CheckCircle2" : "Circle"} size={16} className={plan.priority_support ? "text-green-500" : "text-muted-foreground"} />
                  <span className={!plan.priority_support ? 'text-muted-foreground' : ''}>
                    Приоритетная поддержка
                  </span>
                </div>
              </div>

              <Button
                className={`w-full ${
                  isPopular
                    ? 'bg-gradient-to-r from-primary to-secondary hover:opacity-90'
                    : 'bg-muted hover:bg-muted/80'
                }`}
                onClick={() => handleSelectPlan(plan.plan_type)}
                disabled={isCurrentPlan || processingPlan === plan.plan_type}
              >
                {processingPlan === plan.plan_type ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Обработка...
                  </>
                ) : isCurrentPlan ? (
                  'Активный план'
                ) : (
                  <>
                    <Icon name="ArrowRight" size={16} className="mr-2" />
                    Выбрать план
                  </>
                )}
              </Button>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Все планы включают 14 дней бесплатного пробного периода</p>
        <p>Безопасная оплата через ЮKassa</p>
      </div>
    </div>
  );
};