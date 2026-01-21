import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface CalendarSyncProps {
  showDialog: boolean;
  connected: boolean;
  calendarType: 'google' | 'yandex' | null;
  onConnect: (type: 'google' | 'yandex') => void;
  onDisconnect: () => void;
  onCloseDialog: () => void;
}

export const CalendarDialog = ({ onConnect, onCloseDialog }: { onConnect: (type: 'google' | 'yandex') => void; onCloseDialog: () => void }) => {
  return (
    <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-secondary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="CalendarSync" size={24} className="text-primary" />
          Подключение календаря
        </CardTitle>
        <CardDescription>
          Выберите календарь для синхронизации встреч и напоминаний
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-border/50 hover:border-primary/50 transition-all cursor-pointer" onClick={() => onConnect('google')}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Icon name="Calendar" size={32} className="text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Google Calendar</h3>
                  <p className="text-sm text-muted-foreground">
                    Синхронизация с вашим Google аккаунтом
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-primary/50 transition-all cursor-pointer" onClick={() => onConnect('yandex')}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <Icon name="Calendar" size={32} className="text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Яндекс.Календарь</h3>
                  <p className="text-sm text-muted-foreground">
                    Синхронизация с Яндекс аккаунтом
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Button variant="outline" onClick={onCloseDialog} className="w-full">
          Отмена
        </Button>
      </CardContent>
    </Card>
  );
};

export const CalendarStatusCard = ({ connected, calendarType, onDisconnect, onConnect }: { connected: boolean; calendarType: 'google' | 'yandex' | null; onDisconnect: () => void; onConnect: () => void }) => {
  return (
    <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="CalendarSync" size={24} className="text-blue-500" />
          Синхронизация календаря
        </CardTitle>
      </CardHeader>
      <CardContent>
        {connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <Icon name="CheckCircle2" size={24} className="text-green-500" />
              <div className="flex-1">
                <h4 className="font-semibold">Календарь подключен</h4>
                <p className="text-sm text-muted-foreground">
                  {calendarType === 'google' ? 'Google Calendar' : 'Яндекс.Календарь'}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Icon name="Check" size={16} className="text-green-500" />
                <span>Автоматическая синхронизация встреч</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Icon name="Check" size={16} className="text-green-500" />
                <span>Напоминания за 15 минут до события</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Icon name="Check" size={16} className="text-green-500" />
                <span>Экспорт в .ics файл</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Icon name="Check" size={16} className="text-green-500" />
                <span>Интеграция с email-уведомлениями</span>
              </div>
            </div>
            <Button variant="outline" onClick={onDisconnect} className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10">
              <Icon name="Unplug" size={16} className="mr-2" />
              Отключить календарь
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Подключите календарь для автоматической синхронизации встреч и получения напоминаний
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="Calendar" size={16} />
                <span>Синхронизация в реальном времени</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="Bell" size={16} />
                <span>Push-уведомления о встречах</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="Users" size={16} />
                <span>Приглашение участников</span>
              </div>
            </div>
            <Button onClick={onConnect} className="w-full bg-gradient-to-r from-primary to-secondary">
              <Icon name="Calendar" size={16} className="mr-2" />
              Подключить календарь
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
