import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const Pricing = () => {
  const navigate = useNavigate();

  const handlePayment = (plan: string, amount: number) => {
    const isAuthenticated = localStorage.getItem('auth_token');
    
    if (!isAuthenticated) {
      // Сохраняем выбранный тариф и направляем на регистрацию
      localStorage.setItem('selected_plan', JSON.stringify({ plan, amount }));
      navigate('/register');
    } else {
      // Переходим на страницу оплаты в личном кабинете
      localStorage.setItem('selected_plan', JSON.stringify({ plan, amount }));
      navigate('/dashboard?tab=payment');
    }
  };

  const features = [
    {
      category: 'База клиентов',
      starter: 'До 100 клиентов',
      pro: 'До 500 клиентов',
      enterprise: 'Безлимитно'
    },
    {
      category: 'AI звонки',
      starter: '100 звонков/мес',
      pro: '500 звонков/мес',
      enterprise: 'Безлимитно'
    },
    {
      category: 'Email рассылки',
      starter: '500 писем/мес',
      pro: '2,000 писем/мес',
      enterprise: 'Безлимитно'
    },
    {
      category: 'AI сценарии',
      starter: 'Стандартные шаблоны',
      pro: 'Продвинутые + редактор',
      enterprise: 'Кастомная разработка'
    },
    {
      category: 'Аналитика',
      starter: 'Общая статистика',
      pro: 'Детальные отчеты',
      enterprise: 'Полная аналитика + экспорт'
    },
    {
      category: 'Интеграции',
      starter: 'Excel импорт/экспорт',
      pro: 'Excel + Webhook',
      enterprise: 'API + все интеграции'
    },
    {
      category: 'Техподдержка',
      starter: 'Email (48 часов)',
      pro: 'Email + чат (24 часа)',
      enterprise: 'Персональный менеджер'
    },
    {
      category: 'Хранение данных',
      starter: '6 месяцев',
      pro: '12 месяцев',
      enterprise: 'Неограниченно'
    },
    {
      category: 'Количество пользователей',
      starter: '1 пользователь',
      pro: 'До 5 пользователей',
      enterprise: 'Безлимитно'
    },
    {
      category: 'Обучение системы',
      starter: '—',
      pro: 'Начальное обучение',
      enterprise: 'Полное обучение + онбординг'
    },
    {
      category: 'Приоритет обработки',
      starter: 'Обычный',
      pro: 'Высокий',
      enterprise: 'Максимальный'
    },
    {
      category: 'Белый лейбл',
      starter: '—',
      pro: '—',
      enterprise: 'Доступно'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={() => navigate('/')}>
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Назад
          </Button>
          <Button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-primary to-secondary">
            <Icon name="LogIn" size={16} className="mr-2" />
            Войти в систему
          </Button>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-4">
            <Icon name="Bot" size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Сравнение тарифов AVT</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Детальное сравнение всех возможностей тарифных планов платформы автоматизации
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 backdrop-blur-sm bg-card/50 border-border/50">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
                <Icon name="Rocket" size={28} className="text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Стартовый</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">5,000₽</span>
                <span className="text-muted-foreground">/месяц</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Идеально для малого бизнеса и стартапов
              </p>
              <div className="mb-3 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-xs font-semibold text-green-600">🎁 3 дня бесплатно</p>
              </div>
              <Button className="w-full" variant="outline" onClick={() => handlePayment('Стартовый', 5000)}>
                <Icon name="CreditCard" size={16} className="mr-2" />
                Оплатить
              </Button>
            </div>
          </Card>

          <Card className="p-6 backdrop-blur-sm bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/50 shadow-xl relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-4 py-1 rounded-full">
                Рекомендуем
              </span>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 mb-4">
                <Icon name="Zap" size={28} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Профессиональный</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">15,000₽</span>
                <span className="text-muted-foreground">/месяц</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Для растущих компаний с активными продажами
              </p>
              <div className="mb-3 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-xs font-semibold text-green-600">🎁 3 дня бесплатно</p>
              </div>
              <Button className="w-full bg-gradient-to-r from-primary to-secondary" onClick={() => handlePayment('Профессиональный', 15000)}>
                <Icon name="CreditCard" size={16} className="mr-2" />
                Оплатить
              </Button>
            </div>
          </Card>

          <Card className="p-6 backdrop-blur-sm bg-card/50 border-border/50">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mb-4">
                <Icon name="Building2" size={28} className="text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Корпоративный</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">35,000₽</span>
                <span className="text-muted-foreground">/месяц</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Для крупных организаций без ограничений
              </p>
              <div className="mb-3 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-xs font-semibold text-green-600">🎁 3 дня бесплатно</p>
              </div>
              <Button className="w-full" variant="outline" onClick={() => handlePayment('Корпоративный', 35000)}>
                <Icon name="CreditCard" size={16} className="mr-2" />
                Оплатить
              </Button>
            </div>
          </Card>
        </div>

        <Card className="backdrop-blur-sm bg-card/50 border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 font-bold">Возможности</th>
                  <th className="text-center p-4 font-bold bg-blue-500/5">Стартовый</th>
                  <th className="text-center p-4 font-bold bg-gradient-to-br from-primary/10 to-secondary/10">Профессиональный</th>
                  <th className="text-center p-4 font-bold bg-purple-500/5">Корпоративный</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={index} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-medium">{feature.category}</td>
                    <td className="p-4 text-center text-sm bg-blue-500/5">{feature.starter}</td>
                    <td className="p-4 text-center text-sm bg-gradient-to-br from-primary/10 to-secondary/10 font-medium">
                      {feature.pro}
                    </td>
                    <td className="p-4 text-center text-sm bg-purple-500/5 font-medium">{feature.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Card className="p-6 bg-blue-500/10 border-blue-500/30">
            <div className="flex items-start gap-3">
              <Icon name="HelpCircle" size={24} className="text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold mb-2">Нужна помощь с выбором?</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Наши специалисты помогут подобрать оптимальный тариф для вашего бизнеса
                </p>
                <Button variant="outline" size="sm" onClick={() => navigate('/register')}>
                  <Icon name="MessageCircle" size={14} className="mr-2" />
                  Связаться
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-green-500/10 border-green-500/30">
            <div className="flex items-start gap-3">
              <Icon name="CalendarCheck" size={24} className="text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold mb-2">Тестовый период</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  14 дней бесплатного использования Профессионального тарифа
                </p>
                <Button variant="outline" size="sm" onClick={() => navigate('/register')}>
                  <Icon name="Rocket" size={14} className="mr-2" />
                  Попробовать
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-purple-500/10 border-purple-500/30">
            <div className="flex items-start gap-3">
              <Icon name="Percent" size={24} className="text-purple-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold mb-2">Специальные условия</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Скидка до 20% при оплате за год и для некоммерческих организаций
                </p>
                <Button variant="outline" size="sm" onClick={() => navigate('/register')}>
                  <Icon name="Gift" size={14} className="mr-2" />
                  Узнать больше
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            © 2025 AVT. Все права защищены. Все цены указаны в рублях РФ и не включают НДС.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;