import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

const PasswordRecovery = () => {
  const [step, setStep] = useState<'email' | 'code' | 'newPassword'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/d60c175c-a740-4017-a1cb-c8a0f5ae9e88', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_code', email })
      });

      const data = await response.json();

      if (response.ok) {
        setSentCode(data.code);
        setStep('code');
      } else {
        setError(data.error || 'Ошибка отправки кода');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/d60c175c-a740-4017-a1cb-c8a0f5ae9e88', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_code', code, sent_code: sentCode })
      });

      const data = await response.json();

      if (response.ok && data.verified) {
        setStep('newPassword');
      } else {
        setError('Неверный код подтверждения');
      }
    } catch (err) {
      setError('Ошибка проверки кода');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    localStorage.setItem('avt_password', newPassword);
    alert('Пароль успешно изменен!');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-4">
            <Icon name="KeyRound" size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Восстановление пароля</h1>
          <p className="text-muted-foreground">Следуйте инструкциям для восстановления доступа</p>
        </div>

        <Card className="p-8 backdrop-blur-sm bg-card/50 border-border/50 shadow-xl">
          {step === 'email' && (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email администратора
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="zakaz6377@yandex.ru"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-10 bg-muted/30"
                    disabled={loading}
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Icon name="Mail" size={18} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Код восстановления будет отправлен на указанный email
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <Icon name="AlertCircle" size={14} />
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                disabled={loading || !email}
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Icon name="Send" size={18} className="mr-2" />
                    Отправить код
                  </>
                )}
              </Button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium">
                  Код подтверждения
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Введите 6-значный код"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="text-center text-2xl tracking-widest bg-muted/30"
                  maxLength={6}
                  disabled={loading}
                  required
                />
                <p className="text-xs text-muted-foreground text-center">
                  Проверьте почту {email}
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <Icon name="AlertCircle" size={14} />
                  {error}
                </p>
              )}

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  disabled={loading || code.length !== 6}
                >
                  {loading ? (
                    <>
                      <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                      Проверка...
                    </>
                  ) : (
                    <>
                      <Icon name="CheckCircle" size={18} className="mr-2" />
                      Подтвердить код
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep('email')}
                >
                  <Icon name="ArrowLeft" size={18} className="mr-2" />
                  Отправить код повторно
                </Button>
              </div>
            </form>
          )}

          {step === 'newPassword' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium">
                    Новый пароль
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Минимум 6 символов"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-muted/30"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Подтверждение пароля
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Повторите пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-muted/30"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <Icon name="AlertCircle" size={14} />
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                disabled={!newPassword || !confirmPassword}
              >
                <Icon name="Key" size={18} className="mr-2" />
                Установить новый пароль
              </Button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-border/50 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 justify-center mx-auto"
            >
              <Icon name="ArrowLeft" size={14} />
              Вернуться ко входу
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PasswordRecovery;
