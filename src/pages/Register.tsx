import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      setLoading(false);
      return;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setError('Пароль должен содержать хотя бы одну заглавную букву');
      setLoading(false);
      return;
    }

    if (!/[a-z]/.test(formData.password)) {
      setError('Пароль должен содержать хотя бы одну строчную букву');
      setLoading(false);
      return;
    }

    if (!/[0-9]/.test(formData.password)) {
      setError('Пароль должен содержать хотя бы одну цифру');
      setLoading(false);
      return;
    }

    if (formData.username.length < 3) {
      setError('Логин должен содержать минимум 3 символа');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/daf62ef7-d43d-4aae-9055-6da5a504ab7a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          username: formData.username,
          password: formData.password,
          email: formData.email,
          phone: formData.phone
        })
      });

      const data = await response.json();

      if (response.ok) {
        try {
          await fetch('https://functions.poehali.dev/18fc91cf-f81f-4a1d-9204-d70c0e98a563', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'send_verification',
              email: formData.email,
              username: formData.username,
              password: formData.password
            })
          });
        } catch (emailErr) {
          console.warn('Email отправка не удалась:', emailErr);
        }
        
        localStorage.setItem('avt_user', JSON.stringify({
          user_id: data.user_id,
          username: data.username,
          email: data.email
        }));
        localStorage.setItem('avt_auth', 'true');
        alert('Регистрация успешна! Проверьте email для подтверждения данных входа.');
        navigate('/dashboard');
      } else {
        setError(data.error || 'Ошибка регистрации');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-4">
            <Icon name="UserPlus" size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Регистрация
          </h1>
          <p className="text-muted-foreground">Создайте аккаунт для работы с AVT</p>
        </div>

        <Card className="p-8 backdrop-blur-sm bg-card/50 border-border/50 shadow-xl">
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Логин
              </Label>
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  placeholder="Минимум 3 символа"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  className="pr-10 bg-muted/30"
                  disabled={loading}
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Icon name="User" size={18} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="pr-10 bg-muted/30"
                  disabled={loading}
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Icon name="Mail" size={18} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Телефон
              </Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+7 999 123-45-67"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="pr-10 bg-muted/30"
                  disabled={loading}
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Icon name="Phone" size={18} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Пароль
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="8+ символов, A-z, 0-9"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="pr-10 bg-muted/30"
                  disabled={loading}
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Icon name="Lock" size={18} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Минимум 8 символов, заглавная и строчная буквы, цифры
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Подтверждение пароля
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Повторите пароль"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className="pr-10 bg-muted/30"
                  disabled={loading}
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Icon name="Lock" size={18} />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-600">
                <Icon name="AlertCircle" size={16} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              disabled={loading || !formData.username || !formData.password || !formData.email || !formData.phone}
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Регистрация...
                </>
              ) : (
                <>
                  <Icon name="UserPlus" size={18} className="mr-2" />
                  Зарегистрироваться
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Уже есть аккаунт?
            </p>
            <button
              onClick={() => navigate('/')}
              className="text-sm text-primary hover:underline flex items-center gap-2 justify-center mx-auto"
            >
              <Icon name="LogIn" size={14} />
              Войти в систему
            </button>
          </div>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2025 AVT. Все права защищены.
        </p>
      </div>
    </div>
  );
};

export default Register;