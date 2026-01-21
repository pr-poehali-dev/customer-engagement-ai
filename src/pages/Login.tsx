import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

const Login = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const savedPassword = localStorage.getItem('avt_password') || 'avt2025';
      if (password === savedPassword) {
        localStorage.setItem('avt_auth', 'true');
        navigate('/dashboard');
      } else {
        setError('Неверный пароль');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <div className="container mx-auto max-w-7xl py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-4">
            <Icon name="Bot" size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
            AVT
          </h1>
          <p className="text-xl text-muted-foreground mb-2">Платформа автоматизации работы с клиентами</p>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Автоматизируйте звонки, email-рассылки и работу с клиентами с помощью искусственного интеллекта
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 mb-12">
          <div className="lg:col-span-1">
            <Card className="p-8 backdrop-blur-sm bg-card/50 border-border/50 shadow-xl sticky top-8">
              <h3 className="text-lg font-bold mb-6 text-center">Вход в систему</h3>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Пароль
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      placeholder="Введите пароль..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 bg-muted/30"
                      disabled={loading}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Icon name="Lock" size={18} />
                    </div>
                  </div>
                  {error && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <Icon name="AlertCircle" size={14} />
                      {error}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  disabled={loading || !password}
                >
                  {loading ? (
                    <>
                      <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                      Вход...
                    </>
                  ) : (
                    <>
                      <Icon name="LogIn" size={18} className="mr-2" />
                      Войти
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/password-recovery')}
                    className="text-sm text-primary hover:underline"
                  >
                    Забыли пароль?
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-6 border-t border-border/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon name="Shield" size={14} />
                  <span>Защищенное соединение</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-center mb-3">Тарифные планы</h2>
              <p className="text-center text-muted-foreground">Выберите оптимальный план для вашего бизнеса</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 backdrop-blur-sm bg-card/50 border-border/50 hover:shadow-xl transition-all">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
                    <Icon name="Rocket" size={28} className="text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Стартовый</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">5,000₽</span>
                    <span className="text-muted-foreground">/месяц</span>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">До 100 клиентов в базе</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">100 AI звонков в месяц</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">500 email-рассылок</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Базовые AI сценарии</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Техподдержка email</span>
                  </div>
                </div>

                <Button className="w-full" variant="outline" onClick={() => navigate('/pricing')}>
                  <Icon name="Sparkles" size={16} className="mr-2" />
                  Подробнее
                </Button>
              </Card>

              <Card className="p-6 backdrop-blur-sm bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/50 shadow-xl relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-4 py-1 rounded-full">
                    Популярный
                  </span>
                </div>
                
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 mb-4">
                    <Icon name="Zap" size={28} className="text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Профессиональный</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">15,000₽</span>
                    <span className="text-muted-foreground">/месяц</span>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">До 500 клиентов в базе</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">500 AI звонков в месяц</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">2,000 email-рассылок</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Продвинутые AI сценарии</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Приоритетная поддержка</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Аналитика и отчеты</span>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-primary to-secondary">
                  <Icon name="Crown" size={16} className="mr-2" />
                  Выбрать план
                </Button>
              </Card>

              <Card className="p-6 backdrop-blur-sm bg-card/50 border-border/50 hover:shadow-xl transition-all">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mb-4">
                    <Icon name="Building2" size={28} className="text-purple-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Корпоративный</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">35,000₽</span>
                    <span className="text-muted-foreground">/месяц</span>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Безлимитная база клиентов</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Безлимитные AI звонки</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Безлимитные рассылки</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Кастомные AI сценарии</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Персональный менеджер</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">API интеграции</span>
                  </div>
                </div>

                <Button className="w-full" variant="outline" onClick={() => navigate('/pricing')}>
                  <Icon name="Phone" size={16} className="mr-2" />
                  Связаться с нами
                </Button>
              </Card>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          © 2025 AVT. Все права защищены.
        </p>
      </div>
    </div>
  );
};

export default Login;