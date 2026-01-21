import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Task {
  id: number;
  type: 'call' | 'email' | 'meeting' | 'travel' | 'hotel' | 'flight' | 'train';
  title: string;
  description: string;
  date: string;
  time?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  details?: any;
}

export const AssistantTab = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      type: 'meeting',
      title: 'Встреча с клиентом ООО "Альфа"',
      description: 'Обсуждение контракта на 2026 год',
      date: '2026-01-25',
      time: '14:00',
      status: 'pending',
      details: { location: 'Офис, переговорная №3' }
    },
    {
      id: 2,
      type: 'call',
      title: 'Звонок директору Иванову',
      description: 'Согласование бюджета',
      date: '2026-01-22',
      time: '10:30',
      status: 'pending',
      details: { phone: '+7 (999) 123-45-67' }
    }
  ]);

  const [showCalendarDialog, setShowCalendarDialog] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [calendarType, setCalendarType] = useState<'google' | 'yandex' | null>(null);

  useEffect(() => {
    const connected = localStorage.getItem('calendar_connected');
    const type = localStorage.getItem('calendar_type') as 'google' | 'yandex' | null;
    if (connected === 'true' && type) {
      setCalendarConnected(true);
      setCalendarType(type);
    }
  }, []);

  const handleConnectCalendar = (type: 'google' | 'yandex') => {
    localStorage.setItem('calendar_connected', 'true');
    localStorage.setItem('calendar_type', type);
    setCalendarConnected(true);
    setCalendarType(type);
    setShowCalendarDialog(false);
    alert(`Календарь ${type === 'google' ? 'Google Calendar' : 'Яндекс.Календарь'} успешно подключен!`);
  };

  const handleDisconnectCalendar = () => {
    if (confirm('Отключить синхронизацию с календарем?')) {
      localStorage.removeItem('calendar_connected');
      localStorage.removeItem('calendar_type');
      setCalendarConnected(false);
      setCalendarType(null);
    }
  };

  const handleSyncToCalendar = async (task: Task) => {
    if (!calendarConnected) {
      alert('Сначала подключите календарь');
      return;
    }
    alert(`Задача "${task.title}" синхронизирована с ${calendarType === 'google' ? 'Google Calendar' : 'Яндекс.Календарь'}`);
  };

  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({
    type: 'meeting' as Task['type'],
    title: '',
    description: '',
    date: '',
    time: '',
    details: {}
  });

  const getTaskIcon = (type: Task['type']) => {
    switch (type) {
      case 'call': return 'Phone';
      case 'email': return 'Mail';
      case 'meeting': return 'CalendarClock';
      case 'travel': return 'MapPin';
      case 'hotel': return 'Hotel';
      case 'flight': return 'Plane';
      case 'train': return 'Train';
      default: return 'Calendar';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      case 'completed': return 'bg-green-500/20 text-green-600 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-600 border-red-500/30';
      default: return 'bg-muted/30 text-muted-foreground';
    }
  };

  const getStatusText = (status: Task['status']) => {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'in_progress': return 'В работе';
      case 'completed': return 'Выполнено';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };

  const getTypeText = (type: Task['type']) => {
    switch (type) {
      case 'call': return 'Звонок';
      case 'email': return 'Email';
      case 'meeting': return 'Встреча';
      case 'travel': return 'Поездка';
      case 'hotel': return 'Отель';
      case 'flight': return 'Авиабилет';
      case 'train': return 'Ж/Д билет';
      default: return type;
    }
  };

  const handleAddTask = () => {
    if (!newTask.title || !newTask.date) {
      alert('Заполните название и дату задачи');
      return;
    }

    const task: Task = {
      id: Date.now(),
      type: newTask.type,
      title: newTask.title,
      description: newTask.description,
      date: newTask.date,
      time: newTask.time,
      status: 'pending',
      details: newTask.details
    };

    setTasks([...tasks, task]);
    setShowNewTask(false);
    setNewTask({
      type: 'meeting',
      title: '',
      description: '',
      date: '',
      time: '',
      details: {}
    });
  };

  const handleUpdateStatus = (taskId: number, newStatus: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const handleDeleteTask = (taskId: number) => {
    if (confirm('Удалить задачу?')) {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">AI Секретарь</h2>
          <p className="text-muted-foreground">
            Планирование встреч, звонков, поездок и бронирований
          </p>
        </div>
        <div className="flex gap-2">
          {calendarConnected ? (
            <Button variant="outline" onClick={handleDisconnectCalendar} className="border-green-500/50">
              <Icon name="CalendarCheck2" size={16} className="mr-2 text-green-500" />
              {calendarType === 'google' ? 'Google Calendar' : 'Яндекс.Календарь'}
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setShowCalendarDialog(true)}>
              <Icon name="Calendar" size={16} className="mr-2" />
              Подключить календарь
            </Button>
          )}
          <Button onClick={() => setShowNewTask(!showNewTask)} className="bg-gradient-to-r from-primary to-secondary">
            <Icon name="Plus" size={16} className="mr-2" />
            Новая задача
          </Button>
        </div>
      </div>

      {showCalendarDialog && (
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
              <Card className="border-border/50 hover:border-primary/50 transition-all cursor-pointer" onClick={() => handleConnectCalendar('google')}>
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

              <Card className="border-border/50 hover:border-primary/50 transition-all cursor-pointer" onClick={() => handleConnectCalendar('yandex')}>
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

            <Button variant="outline" onClick={() => setShowCalendarDialog(false)} className="w-full">
              Отмена
            </Button>
          </CardContent>
        </Card>
      )}

      {showNewTask && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle>Создать новую задачу</CardTitle>
            <CardDescription>AI секретарь поможет организовать вашу задачу</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Тип задачи</Label>
                <Select value={newTask.type} onValueChange={(value) => setNewTask({ ...newTask, type: value as Task['type'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">
                      <div className="flex items-center">
                        <Icon name="CalendarClock" size={16} className="mr-2" />
                        Встреча
                      </div>
                    </SelectItem>
                    <SelectItem value="call">
                      <div className="flex items-center">
                        <Icon name="Phone" size={16} className="mr-2" />
                        Звонок
                      </div>
                    </SelectItem>
                    <SelectItem value="email">
                      <div className="flex items-center">
                        <Icon name="Mail" size={16} className="mr-2" />
                        Email-рассылка
                      </div>
                    </SelectItem>
                    <SelectItem value="travel">
                      <div className="flex items-center">
                        <Icon name="MapPin" size={16} className="mr-2" />
                        Поездка
                      </div>
                    </SelectItem>
                    <SelectItem value="hotel">
                      <div className="flex items-center">
                        <Icon name="Hotel" size={16} className="mr-2" />
                        Бронь отеля
                      </div>
                    </SelectItem>
                    <SelectItem value="flight">
                      <div className="flex items-center">
                        <Icon name="Plane" size={16} className="mr-2" />
                        Авиабилет
                      </div>
                    </SelectItem>
                    <SelectItem value="train">
                      <div className="flex items-center">
                        <Icon name="Train" size={16} className="mr-2" />
                        Ж/Д билет
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Название</Label>
                <Input
                  placeholder="Встреча с клиентом"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea
                placeholder="Детали задачи..."
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Дата</Label>
                <Input
                  type="date"
                  value={newTask.date}
                  onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Время</Label>
                <Input
                  type="time"
                  value={newTask.time}
                  onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddTask} className="bg-gradient-to-r from-primary to-secondary">
                <Icon name="Check" size={16} className="mr-2" />
                Создать задачу
              </Button>
              <Button variant="outline" onClick={() => setShowNewTask(false)}>
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ожидают</p>
                <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'pending').length}</p>
              </div>
              <Icon name="Clock" size={32} className="text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">В работе</p>
                <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'in_progress').length}</p>
              </div>
              <Icon name="Loader" size={32} className="text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Выполнено</p>
                <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'completed').length}</p>
              </div>
              <Icon name="CheckCircle2" size={32} className="text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего задач</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
              <Icon name="ListTodo" size={32} className="text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Запланированные задачи</CardTitle>
          <CardDescription>Все задачи, встречи и бронирования</CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="CalendarX" size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Нет запланированных задач</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((task) => (
                <Card key={task.id} className="border-border/50 hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                          <Icon name={getTaskIcon(task.type)} size={24} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{task.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(task.status)}`}>
                              {getStatusText(task.status)}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                              {getTypeText(task.type)}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Icon name="Calendar" size={14} />
                              {new Date(task.date).toLocaleDateString('ru-RU')}
                            </div>
                            {task.time && (
                              <div className="flex items-center gap-1">
                                <Icon name="Clock" size={14} />
                                {task.time}
                              </div>
                            )}
                            {task.details?.location && (
                              <div className="flex items-center gap-1">
                                <Icon name="MapPin" size={14} />
                                {task.details.location}
                              </div>
                            )}
                            {task.details?.phone && (
                              <div className="flex items-center gap-1">
                                <Icon name="Phone" size={14} />
                                {task.details.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {calendarConnected && task.type === 'meeting' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-500/50 text-blue-500 hover:bg-blue-500/10"
                            onClick={() => handleSyncToCalendar(task)}
                          >
                            <Icon name="CalendarPlus" size={14} className="mr-1" />
                            Синх
                          </Button>
                        )}
                        {task.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                          >
                            <Icon name="Play" size={14} className="mr-1" />
                            Начать
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => handleUpdateStatus(task.id, 'completed')}
                          >
                            <Icon name="Check" size={14} className="mr-1" />
                            Завершить
                          </Button>
                        )}
                        {task.status === 'pending' || task.status === 'in_progress' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                            onClick={() => handleUpdateStatus(task.id, 'cancelled')}
                          >
                            <Icon name="X" size={14} />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Sparkles" size={24} className="text-primary" />
              Возможности AI Секретаря
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-3 p-3 rounded-lg bg-background/50">
                <Icon name="CalendarClock" size={20} className="text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Планирование встреч</h4>
                  <p className="text-sm text-muted-foreground">
                    Автоматическое согласование времени и отправка напоминаний участникам
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-lg bg-background/50">
                <Icon name="Phone" size={20} className="text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Организация звонков</h4>
                  <p className="text-sm text-muted-foreground">
                    Напоминания о звонках и автоматическое добавление в календарь
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-lg bg-background/50">
                <Icon name="Plane" size={20} className="text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Бронирование билетов</h4>
                  <p className="text-sm text-muted-foreground">
                    Поиск и бронирование авиа и ж/д билетов по лучшим ценам
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-lg bg-background/50">
                <Icon name="Hotel" size={20} className="text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Бронирование отелей</h4>
                  <p className="text-sm text-muted-foreground">
                    Подбор и резервирование гостиниц с учетом ваших предпочтений
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="CalendarSync" size={24} className="text-blue-500" />
              Синхронизация календаря
            </CardTitle>
          </CardHeader>
          <CardContent>
            {calendarConnected ? (
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
                <Button variant="outline" onClick={handleDisconnectCalendar} className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10">
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
                <Button onClick={() => setShowCalendarDialog(true)} className="w-full bg-gradient-to-r from-primary to-secondary">
                  <Icon name="Calendar" size={16} className="mr-2" />
                  Подключить календарь
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};