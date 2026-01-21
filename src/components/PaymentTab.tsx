import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

const PAYMENT_API = 'https://functions.poehali.dev/2ef13e90-2d73-467b-b7b7-aeb711fedb33';

export const PaymentTab = () => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Оплата услуг AVT');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    // Проверяем, есть ли выбранный тариф
    const selectedPlan = localStorage.getItem('selected_plan');
    if (selectedPlan) {
      try {
        const plan = JSON.parse(selectedPlan);
        setAmount(plan.amount.toString());
        setDescription(`Оплата тарифа "${plan.plan}" - AVT Platform`);
        // Очищаем после загрузки
        localStorage.removeItem('selected_plan');
      } catch (e) {
        console.error('Ошибка загрузки тарифа:', e);
      }
    }
  }, []);

  const handleCreatePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Введите корректную сумму');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');

      const response = await fetch(PAYMENT_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'create_payment',
          amount: parseFloat(amount),
          description: description
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setQrCode(data.qr_code);
        setPaymentId(data.payment_id);
        setShowQR(true);
      } else {
        alert(data.error || 'Ошибка создания платежа');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPayment = () => {
    setShowQR(false);
    setQrCode('');
    setPaymentId('');
    setAmount('');
    setDescription('Оплата услуг AVT');
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `payment-${paymentId}.png`;
    link.click();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-4">
          <Icon name="Wallet" size={32} className="text-white" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Оплата через СБП</h2>
        <p className="text-muted-foreground">
          Быстрая и безопасная оплата через Систему Быстрых Платежей Сбербанка
        </p>
      </div>

      {!showQR ? (
        <Card className="p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Icon name="Info" size={20} className="text-blue-600" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Получатель:</strong> Сбербанк, тел. <strong>+7 927 748-68-68</strong>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Сумма платежа (₽)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg"
                min="1"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Назначение платежа</Label>
              <Input
                id="description"
                type="text"
                placeholder="За что платим"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <Button
              onClick={handleCreatePayment}
              disabled={loading || !amount}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 text-lg h-12"
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                  Создание QR-кода...
                </>
              ) : (
                <>
                  <Icon name="QrCode" size={20} className="mr-2" />
                  Создать QR для оплаты
                </>
              )}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-8">
          <div className="space-y-6 text-center">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Icon name="CheckCircle" size={24} />
              <h3 className="text-xl font-semibold">QR-код создан</h3>
            </div>

            <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 inline-block">
              <img 
                src={qrCode} 
                alt="QR код для оплаты" 
                className="w-64 h-64 mx-auto"
              />
            </div>

            <div className="space-y-2 text-left bg-muted/50 p-4 rounded-lg">
              <p className="text-sm">
                <strong>Сумма:</strong> {amount} ₽
              </p>
              <p className="text-sm">
                <strong>Назначение:</strong> {description}
              </p>
              <p className="text-sm">
                <strong>ID платежа:</strong> {paymentId}
              </p>
              <p className="text-sm">
                <strong>Получатель:</strong> +7 927 748-68-68 (Сбербанк)
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-left">
                <Icon name="AlertCircle" size={20} className="text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-900 dark:text-yellow-100">
                  <strong>Как оплатить:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Откройте приложение банка с поддержкой СБП</li>
                    <li>Отсканируйте QR-код камерой</li>
                    <li>Подтвердите платеж</li>
                  </ol>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleDownloadQR}
                  variant="outline"
                  className="flex-1"
                >
                  <Icon name="Download" size={16} className="mr-2" />
                  Скачать QR-код
                </Button>
                <Button
                  onClick={handleNewPayment}
                  variant="default"
                  className="flex-1 bg-gradient-to-r from-primary to-secondary"
                >
                  <Icon name="Plus" size={16} className="mr-2" />
                  Новый платеж
                </Button>
              </div>
            </div>
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