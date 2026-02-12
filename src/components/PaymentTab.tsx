import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { PricingPlans } from './PricingPlans';
import { Badge } from '@/components/ui/badge';

const PAYMENT_API_URL = 'https://functions.poehali.dev/904921a5-febc-4136-9455-b12df8b051ea';

export const PaymentTab = () => {
  const [currentSubscription, setCurrentSubscription] = useState<{
    plan_type: string;
    end_date: string;
    max_clients: number;
    max_calls_per_month: number;
    max_email_campaigns: number;
  } | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Array<{
    id: number;
    amount: string;
    currency: string;
    status: string;
    created_at: string;
    plan_type?: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const authData = localStorage.getItem('avt_auth');
      if (!authData) return;
      
      const { user_id } = JSON.parse(authData);
      
      const [subRes, historyRes] = await Promise.all([
        fetch(`${PAYMENT_API_URL}?path=subscription&user_id=${user_id}`),
        fetch(`${PAYMENT_API_URL}?path=payment_history&user_id=${user_id}`)
      ]);
      
      if (subRes.ok) {
        const data = await subRes.json();
        setCurrentSubscription(data.subscription);
      }
      
      if (historyRes.ok) {
        const data = await historyRes.json();
        setPaymentHistory(data.payments || []);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planType: string, billingPeriod: 'monthly' | 'yearly') => {
    try {
      setProcessingPayment(true);
      const authData = localStorage.getItem('avt_auth');
      if (!authData) {
        alert('Необходима авторизация');
        return;
      }
      
      const { user_id } = JSON.parse(authData);
      
      const response = await fetch(`${PAYMENT_API_URL}?path=create_payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id,
          plan_type: planType,
          billing_period: billingPeriod,
          return_url: window.location.href
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.confirmation_url) {
        window.location.href = data.confirmation_url;
      } else if (data.demo_mode) {
        alert('Демо-режим: ' + data.message);
        loadSubscriptionData();
      } else {
        alert(data.error || 'Ошибка создания платежа');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Ошибка подключения к серверу');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Вы уверены, что хотите отменить подписку?')) return;
    
    try {
      const authData = localStorage.getItem('avt_auth');
      if (!authData) return;
      
      const { user_id } = JSON.parse(authData);
      
      const response = await fetch(`${PAYMENT_API_URL}?path=cancel_subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id })
      });
      
      if (response.ok) {
        alert('Подписка отменена');
        loadSubscriptionData();
      }
    } catch (error) {
      console.error('Cancel error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Успешно</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">Ожидание</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-500/20 text-gray-600 border-gray-500/30">Отменен</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30">Ошибка</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary mb-4">
          <Icon name="CreditCard" size={32} className="text-white" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Управление подпиской</h2>
        <p className="text-muted-foreground">
          Выберите тарифный план и управляйте своей подпиской
        </p>
      </div>

      {currentSubscription && (
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Текущий план</h3>
              <div className="flex items-center gap-3">
                <Badge className="bg-primary text-primary-foreground">
                  {currentSubscription.plan_type === 'starter' ? 'Стартовый' : 
                   currentSubscription.plan_type === 'professional' ? 'Профессиональный' : 'Корпоративный'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Активен до {formatDate(currentSubscription.end_date)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Клиентов</p>
                  <p className="font-semibold">
                    {currentSubscription.max_clients === -1 ? '∞' : currentSubscription.max_clients}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Звонков/мес</p>
                  <p className="font-semibold">
                    {currentSubscription.max_calls_per_month === -1 ? '∞' : currentSubscription.max_calls_per_month}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Рассылок</p>
                  <p className="font-semibold">
                    {currentSubscription.max_email_campaigns === -1 ? '∞' : currentSubscription.max_email_campaigns}
                  </p>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={handleCancelSubscription} className="border-red-500/50 hover:bg-red-500/10">
              <Icon name="XCircle" size={16} className="mr-2" />
              Отменить
            </Button>
          </div>
        </Card>
      )}

      <div>
        <h3 className="text-2xl font-bold mb-6">Тарифные планы</h3>
        <PricingPlans 
          currentPlan={currentSubscription?.plan_type} 
          onPlanSelect={handleSelectPlan}
        />
      </div>

      {paymentHistory.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">История платежей</h3>
          <div className="space-y-3">
            {paymentHistory.slice(0, 10).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <p className="font-semibold">{payment.plan_type ? `Подписка: ${payment.plan_type}` : 'Платеж'}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(payment.created_at)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold">
                    {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: payment.currency }).format(parseFloat(payment.amount))}
                  </span>
                  {getStatusBadge(payment.status)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <Icon name="Shield" size={24} className="text-primary" />
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Безопасность платежа</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <Icon name="Check" size={14} className="text-green-600" />
                Официальная система СБП Банка России
              </li>
              <li className="flex items-center gap-2">
                <Icon name="Check" size={14} className="text-green-600" />
                Мгновенный перевод на счет получателя
              </li>
              <li className="flex items-center gap-2">
                <Icon name="Check" size={14} className="text-green-600" />
                Подтверждение в приложении вашего банка
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};