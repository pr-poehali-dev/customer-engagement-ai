import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

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

interface TaskListProps {
  tasks: Task[];
  calendarConnected: boolean;
  onUpdateStatus: (taskId: number, newStatus: Task['status']) => void;
  onDeleteTask: (taskId: number) => void;
  onSyncToCalendar: (task: Task) => void;
}

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

export const TaskList = ({ tasks, calendarConnected, onUpdateStatus, onDeleteTask, onSyncToCalendar }: TaskListProps) => {
  return (
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
                          onClick={() => onSyncToCalendar(task)}
                        >
                          <Icon name="CalendarPlus" size={14} className="mr-1" />
                          Синх
                        </Button>
                      )}
                      {task.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateStatus(task.id, 'in_progress')}
                        >
                          <Icon name="Play" size={14} className="mr-1" />
                          Начать
                        </Button>
                      )}
                      {task.status === 'in_progress' && (
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => onUpdateStatus(task.id, 'completed')}
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
                          onClick={() => onUpdateStatus(task.id, 'cancelled')}
                        >
                          <Icon name="X" size={14} />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                          onClick={() => onDeleteTask(task.id)}
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
  );
};
