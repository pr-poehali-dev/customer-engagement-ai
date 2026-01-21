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
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (client) {
      setFormData({ ...client });
      setErrors({});
    }
  }, [client]);

  if (!open || !formData) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно для заполнения';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен для заполнения';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Телефон обязателен для заполнения';
    } else if (!/^[\d\s+()-]+$/.test(formData.phone) || formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Введите корректный номер телефона';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm() && formData) {
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
              <Label>Имя клиента <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Иван Иванов"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <Icon name="AlertCircle" size={12} />
                  {errors.name}
                </p>
              )}
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
            <Label>Email <span className="text-red-500">*</span></Label>
            <Input
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <Icon name="AlertCircle" size={12} />
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Телефон <span className="text-red-500">*</span></Label>
            <Input
              placeholder="+7 999 123-45-67"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                if (errors.phone) setErrors({ ...errors, phone: '' });
              }}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <Icon name="AlertCircle" size={12} />
                {errors.phone}
              </p>
            )}
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