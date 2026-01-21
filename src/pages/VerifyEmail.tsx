import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState<{username: string; email: string} | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Недействительная ссылка активации');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('https://functions.poehali.dev/daf62ef7-d43d-4aae-9055-6da5a504ab7a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_email',
          token: token
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message);
        setUserData({ username: data.username, email: data.email });
      } else {
        setStatus('error');
        setMessage(data.error || 'Ошибка верификации');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Ошибка подключения к серверу');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <Card className="w-full max-w-md p-8 backdrop-blur-sm bg-card/50 border-border/50">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/20 mb-6">
                <Icon name="Loader2" size={40} className="text-blue-500 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Подтверждение email...</h2>
              <p className="text-muted-foreground">Пожалуйста, подождите</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6">
                <Icon name="CheckCircle" size={40} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-green-600">Email подтверждён!</h2>
              <p className="text-muted-foreground mb-6">{message}</p>
              
              {userData && (
                <div className="bg-muted/30 p-4 rounded-lg mb-6 text-left">
                  <p className="text-sm mb-2"><strong>Логин:</strong> {userData.username}</p>
                  <p className="text-sm"><strong>Email:</strong> {userData.email}</p>
                </div>
              )}
              
              <Button
                onClick={() => navigate('/')}
                className="w-full bg-gradient-to-r from-primary to-secondary"
              >
                <Icon name="LogIn" size={18} className="mr-2" />
                Войти в систему
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-6">
                <Icon name="XCircle" size={40} className="text-red-500" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-red-600">Ошибка верификации</h2>
              <p className="text-muted-foreground mb-6">{message}</p>
              
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/register')}
                  variant="outline"
                  className="w-full"
                >
                  <Icon name="UserPlus" size={18} className="mr-2" />
                  Зарегистрироваться снова
                </Button>
                
                <Button
                  onClick={() => navigate('/')}
                  className="w-full"
                >
                  <Icon name="Home" size={18} className="mr-2" />
                  На главную
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default VerifyEmail;
