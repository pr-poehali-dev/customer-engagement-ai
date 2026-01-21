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

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  company?: string;
  legalAddress?: string;
  status: 'hot' | 'warm' | 'cold';
  last_contact: string;
}

interface ClientEditDialogProps {
  client: Client | null;
  open: boolean;
  onClose: () => void;
  onSave: (updatedClient: Client) => void;
}

export const ClientEditDialog = ({ client, open, onClose, onSave }: ClientEditDialogProps) => {
  const [formData, setFormData] = useState<Client | null>(null);

  useEffect(() => {
    if (client) {
      setFormData({ ...client });
    }
  }, [client]);

  if (!open || !formData) return null;

  const handleSave = () => {
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="UserCog" size={24} className="text-primary" />
            Редактирование клиента
          </CardTitle>
          <CardDescription>
            Изменение информации о клиенте
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Имя клиента</Label>
              <Input
                placeholder="Иван Иванов"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Статус</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: 'hot' | 'warm' | 'cold') => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hot">
                    <div className="flex items-center">
                      <Icon name="Flame" size={16} className="mr-2 text-red-500" />
                      Горячий
                    </div>
                  </SelectItem>
                  <SelectItem value="warm">
                    <div className="flex items-center">
                      <Icon name="Sun" size={16} className="mr-2 text-yellow-500" />
                      Теплый
                    </div>
                  </SelectItem>
                  <SelectItem value="cold">
                    <div className="flex items-center">
                      <Icon name="Snowflake" size={16} className="mr-2 text-blue-500" />
                      Холодный
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Телефон</Label>
            <Input
              placeholder="+7 999 123-45-67"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Название юридического лица</Label>
            <Input
              placeholder='ООО "Рога и копыта"'
              value={formData.company || ''}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Юридический адрес</Label>
            <Textarea
              placeholder="г. Москва, ул. Ленина, д. 1, офис 100"
              value={formData.legalAddress || ''}
              onChange={(e) => setFormData({ ...formData, legalAddress: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-secondary flex-1">
              <Icon name="Check" size={16} className="mr-2" />
              Сохранить
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Отмена
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
