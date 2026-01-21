import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

const Login = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const savedPassword = localStorage.getItem('avt_password') || 'avt2025';
      if (password === savedPassword) {
        localStorage.setItem('avt_auth', 'true');
        navigate('/dashboard');
      } else {
        setError('Неверный пароль');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-4">
            <Icon name="Bot" size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            AVT
          </h1>
          <p className="text-muted-foreground">Платформа автоматизации работы с клиентами</p>
        </div>

        <Card className="p-8 backdrop-blur-sm bg-card/50 border-border/50 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Пароль
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="Введите пароль..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 bg-muted/30"
                  disabled={loading}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Icon name="Lock" size={18} />
                </div>
              </div>
              {error && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <Icon name="AlertCircle" size={14} />
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              disabled={loading || !password}
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Вход...
                </>
              ) : (
                <>
                  <Icon name="LogIn" size={18} className="mr-2" />
                  Войти в систему
                </>
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/password-recovery')}
                className="text-sm text-primary hover:underline"
              >
                Забыли пароль?
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Icon name="Shield" size={14} />
              <span>Защищенное соединение</span>
            </div>
          </div>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2025 AVT. Все права защищены.
        </p>
      </div>
    </div>
  );
};

export default Login;