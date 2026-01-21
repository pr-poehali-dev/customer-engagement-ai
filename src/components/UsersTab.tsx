import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface User {
  user_id: number;
  username: string;
  email: string;
  phone: string;
  created_at: string;
  last_login: string | null;
  is_active: boolean;
}

export const UsersTab = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('avt_user');
    const user = userData ? JSON.parse(userData) : null;
    
    if (!user?.is_admin) {
      return;
    }

    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('avt_token');
      
      const response = await fetch('https://functions.poehali.dev/daf62ef7-d43d-4aae-9055-6da5a504ab7a?action=get_all_users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const userData = localStorage.getItem('avt_user');
  const currentUser = userData ? JSON.parse(userData) : null;

  if (!currentUser?.is_admin) {
    return (
      <Card className="p-8 text-center">
        <Icon name="ShieldAlert" size={48} className="mx-auto mb-4 text-red-500" />
        <h3 className="text-xl font-semibold mb-2">Доступ запрещен</h3>
        <p className="text-muted-foreground">Требуются права администратора</p>
      </Card>
    );
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
  };

  const handleLoginAsUser = (user: User) => {
    if (confirm(`Войти в аккаунт пользователя ${user.username}?`)) {
      localStorage.setItem('avt_user', JSON.stringify({
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        is_admin: false
      }));
      localStorage.setItem('avt_admin_mode', 'true');
      localStorage.setItem('avt_original_admin', JSON.stringify(currentUser));
      window.location.reload();
    }
  };

  const handleReturnToAdmin = () => {
    const adminData = localStorage.getItem('avt_original_admin');
    if (adminData) {
      localStorage.setItem('avt_user', adminData);
      localStorage.removeItem('avt_admin_mode');
      localStorage.removeItem('avt_original_admin');
      window.location.reload();
    }
  };

  const isInAdminMode = localStorage.getItem('avt_admin_mode') === 'true';

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <Icon name="Loader2" size={48} className="mx-auto mb-4 animate-spin text-primary" />
        <p className="text-muted-foreground">Загрузка пользователей...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {isInAdminMode && (
        <Card className="p-4 bg-yellow-500/10 border-yellow-500/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="ShieldAlert" size={24} className="text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                  Режим администратора
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Вы просматриваете систему от имени пользователя {currentUser?.username}
                </p>
              </div>
            </div>
            <Button onClick={handleReturnToAdmin} variant="outline" className="border-yellow-500">
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Вернуться к админке
            </Button>
          </div>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Управление пользователями</h2>
          <p className="text-muted-foreground">Всего пользователей: {users.length}</p>
        </div>
        <Button onClick={loadUsers} variant="outline">
          <Icon name="RefreshCw" size={16} className="mr-2" />
          Обновить
        </Button>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.user_id} className="p-6 hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <Icon name="User" size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{user.username}</h3>
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Mail" size={14} />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Phone" size={14} />
                      <span>{user.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Calendar" size={14} />
                      <span>Регистрация: {new Date(user.created_at).toLocaleDateString('ru-RU')}</span>
                    </div>
                    {user.last_login && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon name="Clock" size={14} />
                        <span>Последний вход: {new Date(user.last_login).toLocaleDateString('ru-RU')}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      user.is_active 
                        ? 'bg-green-500/10 text-green-600 border border-green-500/20' 
                        : 'bg-red-500/10 text-red-600 border border-red-500/20'
                    }`}>
                      <Icon name={user.is_active ? 'CheckCircle' : 'XCircle'} size={12} />
                      {user.is_active ? 'Активен' : 'Неактивен'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewUser(user)}
                >
                  <Icon name="Eye" size={14} className="mr-1" />
                  Просмотр
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => handleLoginAsUser(user)}
                  className="bg-gradient-to-r from-primary to-secondary"
                >
                  <Icon name="LogIn" size={14} className="mr-1" />
                  Войти как
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedUser && (
        <Card className="p-6 bg-primary/5 border-primary/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Детали пользователя</h3>
            <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
              <Icon name="X" size={16} />
            </Button>
          </div>
          <div className="space-y-2 text-sm">
            <p><strong>ID:</strong> {selectedUser.user_id}</p>
            <p><strong>Логин:</strong> {selectedUser.username}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Телефон:</strong> {selectedUser.phone}</p>
            <p><strong>Создан:</strong> {new Date(selectedUser.created_at).toLocaleString('ru-RU')}</p>
            {selectedUser.last_login && (
              <p><strong>Последний вход:</strong> {new Date(selectedUser.last_login).toLocaleString('ru-RU')}</p>
            )}
            <p><strong>Статус:</strong> {selectedUser.is_active ? 'Активен' : 'Неактивен'}</p>
          </div>
        </Card>
      )}
    </div>
  );
};
