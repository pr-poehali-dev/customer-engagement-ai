import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { TaskForm } from './assistant/TaskForm';
import { TaskList } from './assistant/TaskList';
import { CalendarDialog, CalendarStatusCard } from './assistant/CalendarSync';

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
  const [tasks, setTasks] = useState<Task[]>([]);

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
        <CalendarDialog 
          onConnect={handleConnectCalendar}
          onCloseDialog={() => setShowCalendarDialog(false)}
        />
      )}

      {showNewTask && (
        <TaskForm
          newTask={newTask}
          setNewTask={setNewTask}
          onAddTask={handleAddTask}
          onCancel={() => setShowNewTask(false)}
        />
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

      <TaskList
        tasks={tasks}
        calendarConnected={calendarConnected}
        onUpdateStatus={handleUpdateStatus}
        onDeleteTask={handleDeleteTask}
        onSyncToCalendar={handleSyncToCalendar}
      />

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

        <CalendarStatusCard
          connected={calendarConnected}
          calendarType={calendarType}
          onDisconnect={handleDisconnectCalendar}
          onConnect={() => setShowCalendarDialog(true)}
        />
      </div>
    </div>
  );
};