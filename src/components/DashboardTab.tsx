import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Avatar } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

interface DashboardTabProps {
  stats: {
    totalClients: number;
    callsToday: number;
    emailsSent: number;
    conversion: number;
  };
  recentCalls: any[];
  getStatusColor: (status: string) => string;
  loadData: () => Promise<void>;
}

export const DashboardTab = ({ stats, recentCalls, getStatusColor, loadData }: DashboardTabProps) => {
  const statsDisplay = [
    { label: 'Всего клиентов', value: '', change: '', icon: 'Users', color: 'text-primary' },
    { label: 'Звонков сегодня', value: stats.callsToday.toString(), change: '', icon: 'Phone', color: 'text-secondary' },
    { label: 'Email отправлено', value: stats.emailsSent.toLocaleString(), change: '', icon: 'Mail', color: 'text-accent' },
    { label: 'Конверсия', value: `${stats.conversion}%`, change: '', icon: 'TrendingUp', color: 'text-primary' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsDisplay.map((stat, index) => (
          <Card key={index} className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                {stat.change && (
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <Icon name="ArrowUp" size={12} />
                    {stat.change}
                  </p>
                )}
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center ${stat.color}`}>
                <Icon name={stat.icon as any} size={24} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Последние звонки ИИ</h3>
            <Button size="sm" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90" onClick={loadData}>
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Обновить
            </Button>
          </div>
          <div className="space-y-4">
            {recentCalls.map((call) => (
              <div key={call.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <Avatar className="w-10 h-10 border-2 border-primary/30">
                    <div className="w-full h-full bg-gradient-to-br from-primary/50 to-secondary/50 flex items-center justify-center text-sm font-semibold">
                      {call.client?.split(' ').map((n: string) => n[0]).join('') || '??'}
                    </div>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{call.client}</p>
                    <p className="text-xs text-muted-foreground">{call.timestamp} • {call.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`${getStatusColor(call.status)} border`}>
                    {call.result}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <Icon name="Play" size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <h3 className="text-xl font-bold mb-6">Активность ИИ агента</h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Успешные звонки</span>
                <span className="text-sm font-semibold">0/0</span>
              </div>
              <Progress value={0} className="h-2 bg-muted" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Конверсия в продажу</span>
                <span className="text-sm font-semibold">0%</span>
              </div>
              <Progress value={0} className="h-2 bg-muted" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Средняя длительность</span>
                <span className="text-sm font-semibold">0:00 мин</span>
              </div>
              <Progress value={0} className="h-2 bg-muted" />
            </div>
            
            <div className="pt-4 border-t border-border/50">
              <h4 className="font-semibold mb-4">Быстрые действия</h4>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="justify-start gap-2">
                  <Icon name="FileText" size={16} />
                  Отчеты
                </Button>
                <Button variant="outline" className="justify-start gap-2">
                  <Icon name="Settings" size={16} />
                  Настройки ИИ
                </Button>
                <Button variant="outline" className="justify-start gap-2">
                  <Icon name="Download" size={16} />
                  Экспорт
                </Button>
                <Button variant="outline" className="justify-start gap-2">
                  <Icon name="BarChart" size={16} />
                  Аналитика
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};