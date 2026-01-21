import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

export const SettingsTab = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const savedPassword = localStorage.getItem('avt_password') || 'avt2025';

    if (currentPassword !== savedPassword) {
      setError('Неверный текущий пароль');
      return;
    }

    if (newPassword.length < 6) {
      setError('Новый пароль должен содержать минимум 6 символов');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    localStorage.setItem('avt_password', newPassword);
    setSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Icon name="Settings" size={24} />
            Настройки системы
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Управление параметрами и безопасностью</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6 bg-muted/30 border-border/30">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Icon name="Lock" size={18} />
              Безопасность
            </h4>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current">Текущий пароль</Label>
                <Input
                  id="current"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Введите текущий пароль"
                  className="bg-background/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new">Новый пароль</Label>
                <Input
                  id="new"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  className="bg-background/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Подтверждение пароля</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите новый пароль"
                  className="bg-background/50"
                  required
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-600">
                  <Icon name="AlertCircle" size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2 text-green-600">
                  <Icon name="CheckCircle" size={16} />
                  <span className="text-sm">Пароль успешно изменен!</span>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-secondary"
              >
                <Icon name="Key" size={16} className="mr-2" />
                Изменить пароль
              </Button>
            </form>
          </Card>

          <Card className="p-6 bg-muted/30 border-border/30">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Icon name="Info" size={18} />
              Информация о системе
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Версия</span>
                <span className="text-sm font-medium">AVT v1.0.0</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Платформа</span>
                <span className="text-sm font-medium">AI Customer Engagement</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Email сервер</span>
                <span className="text-sm font-medium flex items-center gap-1">
                  <Icon name="CheckCircle" size={14} className="text-green-500" />
                  Подключен
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground">AI Сценарии</span>
                <span className="text-sm font-medium flex items-center gap-1">
                  <Icon name="CheckCircle" size={14} className="text-green-500" />
                  Активны
                </span>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-600 flex items-start gap-2">
                  <Icon name="Lightbulb" size={14} className="mt-0.5 flex-shrink-0" />
                  <span>
                    Рекомендуем менять пароль каждые 3 месяца для повышения безопасности
                  </span>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
};
