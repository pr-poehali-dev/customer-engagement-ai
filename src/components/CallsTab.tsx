import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Avatar } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface Call {
  id: number;
  client: string;
  timestamp: string;
  status: string;
  result: string;
  duration: string;
  recording_url?: string;
  transcript?: string;
}

interface CallsTabProps {
  recentCalls: Call[];
  getStatusColor: (status: string) => string;
  onAnalyzeCall?: (callId: number) => void;
}

const API_URL = 'https://functions.poehali.dev/0c17e1a7-ce1b-49a9-9ef7-f7cb2df73405';

export const CallsTab = ({ recentCalls, getStatusColor, onAnalyzeCall }: CallsTabProps) => {
  const [analyzingCall, setAnalyzingCall] = useState<number | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{
    analysis: string;
    call_info?: { duration: string; status: string; result: string; created_at: string };
    client?: { name: string; company: string; email: string; phone: string };
  } | null>(null);
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const handleAnalyzeCall = async (callId: number) => {
    setLoadingAnalysis(true);
    setAnalyzingCall(callId);
    
    try {
      const response = await fetch(`${API_URL}?path=ai_analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ call_id: callId })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAiAnalysis(data);
        setAnalysisDialogOpen(true);
      } else {
        const error = await response.json();
        alert(error.message || 'Ошибка при анализе звонка');
      }
    } catch (error) {
      console.error('Error analyzing call:', error);
      alert('Не удалось выполнить анализ');
    } finally {
      setLoadingAnalysis(false);
      setAnalyzingCall(null);
    }
  };
  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold">ИИ Звонки</h3>
              <p className="text-sm text-muted-foreground">Инициирование и мониторинг автоматических звонков</p>
            </div>
            <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              <Icon name="Phone" size={16} className="mr-2" />
              Начать обзвон
            </Button>
          </div>

          <div className="space-y-3">
            {recentCalls.map((call) => (
              <div key={call.id} className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-primary/30">
                      <div className="w-full h-full bg-gradient-to-br from-primary/50 to-secondary/50 flex items-center justify-center text-sm font-semibold">
                        {call.client?.split(' ').map((n: string) => n[0]).join('') || '??'}
                      </div>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{call.client}</p>
                      <p className="text-xs text-muted-foreground">{call.timestamp}</p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(call.status)} border`}>
                    {call.result}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Icon name="Clock" size={14} />
                    {call.duration}
                  </span>
                  <div className="flex gap-2 ml-auto">
                    {call.recording_url && (
                      <Button variant="ghost" size="sm" className="h-8" asChild>
                        <a href={call.recording_url} target="_blank" rel="noopener noreferrer">
                          <Icon name="Play" size={14} className="mr-1" />
                          Прослушать
                        </a>
                      </Button>
                    )}
                    {call.transcript && (
                      <Button variant="ghost" size="sm" className="h-8" title={call.transcript}>
                        <Icon name="FileText" size={14} className="mr-1" />
                        Транскрипт
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20"
                      onClick={() => handleAnalyzeCall(call.id)}
                      disabled={loadingAnalysis && analyzingCall === call.id}
                    >
                      <Icon name="Sparkles" size={14} className="mr-1" />
                      {loadingAnalysis && analyzingCall === call.id ? 'Анализ...' : 'Анализ ИИ'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <h3 className="text-lg font-bold mb-4">Настройки ИИ агента</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-sm mb-2 block">Тон голоса</Label>
              <Select defaultValue="professional">
                <SelectTrigger className="bg-muted/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Профессиональный</SelectItem>
                  <SelectItem value="friendly">Дружелюбный</SelectItem>
                  <SelectItem value="formal">Официальный</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm mb-2 block">Скорость речи</Label>
              <Select defaultValue="medium">
                <SelectTrigger className="bg-muted/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Медленная</SelectItem>
                  <SelectItem value="medium">Средняя</SelectItem>
                  <SelectItem value="fast">Быстрая</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Запись звонков</Label>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <Label>Автоматические повторы</Label>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <Label>Уведомления</Label>
              <Switch defaultChecked />
            </div>

            <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 mt-4">
              Сохранить настройки
            </Button>
          </div>
        </Card>
      </div>

      <Dialog open={analysisDialogOpen} onOpenChange={setAnalysisDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Sparkles" size={20} className="text-primary" />
              ИИ-анализ звонка
            </DialogTitle>
            <DialogDescription>
              {aiAnalysis?.client?.name && (
                <span>Клиент: {aiAnalysis.client.name} ({aiAnalysis.client.company})</span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {aiAnalysis && (
            <div className="space-y-4">
              {aiAnalysis.call_info && (
                <Card className="p-4 bg-muted/30">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Длительность</p>
                      <p className="font-semibold">{aiAnalysis.call_info.duration}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Статус</p>
                      <Badge className={getStatusColor(aiAnalysis.call_info.status)}>
                        {aiAnalysis.call_info.result}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Дата</p>
                      <p className="font-semibold">
                        {aiAnalysis.call_info.created_at ? new Date(aiAnalysis.call_info.created_at).toLocaleString('ru-RU') : 'Н/Д'}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap bg-card p-4 rounded-lg border">
                  {aiAnalysis.analysis}
                </div>
              </div>

              {aiAnalysis.client && (
                <Card className="p-4 bg-primary/5">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Icon name="User" size={16} />
                    Информация о клиенте
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Email:</span> {aiAnalysis.client.email}</p>
                    <p><span className="text-muted-foreground">Телефон:</span> {aiAnalysis.client.phone}</p>
                  </div>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};