import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

const PAYMENT_API_URL = 'https://functions.poehali.dev/904921a5-febc-4136-9455-b12df8b051ea';

interface SubscriptionSettingsProps {
  subscription: {
    id: number;
    plan_type: string;
    auto_renew: boolean;
    end_date: string;
  } | null;
  onUpdate: () => void;
}

export const SubscriptionSettings = ({ subscription, onUpdate }: SubscriptionSettingsProps) => {
  const [autoRenew, setAutoRenew] = useState(subscription?.auto_renew ?? false);
  const [updating, setUpdating] = useState(false);

  const handleToggleAutoRenew = async (enabled: boolean) => {
    try {
      setUpdating(true);
      const authData = localStorage.getItem('avt_auth');
      if (!authData) return;

      const { user_id } = JSON.parse(authData);

      const response = await fetch(`${PAYMENT_API_URL}?path=update_auto_renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id,
          auto_renew: enabled
        })
      });

      if (response.ok) {
        setAutoRenew(enabled);
        onUpdate();
        alert(enabled ? 'Автопродление включено' : 'Автопродление отключено');
      }
    } catch (error) {
      console.error('Error updating auto-renew:', error);
      alert('Ошибка обновления настроек');
    } finally {
      setUpdating(false);
    }
  };

  if (!subscription) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const daysUntilExpiration = Math.ceil(
    (new Date(subscription.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Icon name="Settings" size={20} />
        Настройки подписки
      </h3>

      <div className="space-y-6">
        <div className="flex items-start justify-between p-4 rounded-lg bg-muted/30">
          <div className="space-y-1">
            <Label className="text-base font-semibold">Автоматическое продление</Label>
            <p className="text-sm text-muted-foreground">
              {autoRenew 
                ? 'Подписка будет автоматически продлена после окончания срока действия'
                : 'Вам нужно будет продлить подписку вручную до истечения срока'}
            </p>
          </div>
          <Switch
            checked={autoRenew}
            onCheckedChange={handleToggleAutoRenew}
            disabled={updating}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Окончание подписки</span>
            <span className="font-semibold">{formatDate(subscription.end_date)}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">До окончания</span>
            <Badge className={
              daysUntilExpiration <= 3 
                ? 'bg-red-500/20 text-red-600 border-red-500/30'
                : daysUntilExpiration <= 7
                ? 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30'
                : 'bg-green-500/20 text-green-600 border-green-500/30'
            }>
              {daysUntilExpiration} дн.
            </Badge>
          </div>
        </div>

        {daysUntilExpiration <= 7 && !autoRenew && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <Icon name="AlertTriangle" size={20} className="text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-900 dark:text-yellow-100">
              <strong>Внимание!</strong> Ваша подписка скоро закончится. 
              Включите автопродление или продлите подписку вручную, 
              чтобы не потерять доступ к функциям.
            </div>
          </div>
        )}

        {autoRenew && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <Icon name="CheckCircle2" size={20} className="text-green-600 mt-0.5" />
            <div className="text-sm text-green-900 dark:text-green-100">
              <strong>Автопродление активно.</strong> Мы автоматически продлим вашу подписку 
              за 3 дня до окончания срока. Вы получите email с подтверждением.
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
