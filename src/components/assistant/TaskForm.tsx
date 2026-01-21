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

interface TaskFormProps {
  newTask: {
    type: Task['type'];
    title: string;
    description: string;
    date: string;
    time: string;
    details: any;
  };
  setNewTask: (task: any) => void;
  onAddTask: () => void;
  onCancel: () => void;
}

export const TaskForm = ({ newTask, setNewTask, onAddTask, onCancel }: TaskFormProps) => {
  return (
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
          <Button onClick={onAddTask} className="bg-gradient-to-r from-primary to-secondary">
            <Icon name="Check" size={16} className="mr-2" />
            Создать задачу
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
