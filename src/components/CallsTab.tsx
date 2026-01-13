import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Avatar } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CallsTabProps {
  recentCalls: any[];
  getStatusColor: (status: string) => string;
}

export const CallsTab = ({ recentCalls, getStatusColor }: CallsTabProps) => {
  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold">ИИ Звонки</h3>
              <p className="text-sm text-muted-foreground">Инициирование и мониторинг автоматических звонков</p>
            </div>
            <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              <Icon name="Phone" size={16} className="mr-2" />
              Начать обзвон
            </Button>
          </div>

          <div className="space-y-3">
            {recentCalls.map((call) => (
              <div key={call.id} className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-primary/30">
                      <div className="w-full h-full bg-gradient-to-br from-primary/50 to-secondary/50 flex items-center justify-center text-sm font-semibold">
                        {call.client?.split(' ').map((n: string) => n[0]).join('') || '??'}
                      </div>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{call.client}</p>
                      <p className="text-xs text-muted-foreground">{call.timestamp}</p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(call.status)} border`}>
                    {call.result}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Icon name="Clock" size={14} />
                    {call.duration}
                  </span>
                  <div className="flex gap-2 ml-auto">
                    <Button variant="ghost" size="sm" className="h-8">
                      <Icon name="Play" size={14} className="mr-1" />
                      Прослушать
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8">
                      <Icon name="FileText" size={14} className="mr-1" />
                      Транскрипт
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <h3 className="text-lg font-bold mb-4">Настройки ИИ агента</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-sm mb-2 block">Тон голоса</Label>
              <Select defaultValue="professional">
                <SelectTrigger className="bg-muted/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Профессиональный</SelectItem>
                  <SelectItem value="friendly">Дружелюбный</SelectItem>
                  <SelectItem value="formal">Официальный</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm mb-2 block">Скорость речи</Label>
              <Select defaultValue="medium">
                <SelectTrigger className="bg-muted/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Медленная</SelectItem>
                  <SelectItem value="medium">Средняя</SelectItem>
                  <SelectItem value="fast">Быстрая</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Запись звонков</Label>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <Label>Автоматические повторы</Label>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <Label>Уведомления</Label>
              <Switch defaultChecked />
            </div>

            <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 mt-4">
              Сохранить настройки
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
