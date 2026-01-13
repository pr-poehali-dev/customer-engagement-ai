import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DashboardTab } from '@/components/DashboardTab';
import { ClientsTab } from '@/components/ClientsTab';
import { CallsTab } from '@/components/CallsTab';
import { EmailsTab } from '@/components/EmailsTab';

const API_URL = 'https://functions.poehali.dev/0c17e1a7-ce1b-49a9-9ef7-f7cb2df73405';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    callsToday: 0,
    emailsSent: 0,
    conversion: 0
  });
  const [recentCalls, setRecentCalls] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [emailCampaigns, setEmailCampaigns] = useState<any[]>([]);
  const [callingInProgress, setCallingInProgress] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, callsRes, clientsRes, campaignsRes] = await Promise.all([
        fetch(`${API_URL}?path=stats`),
        fetch(`${API_URL}?path=calls`),
        fetch(`${API_URL}?path=clients`),
        fetch(`${API_URL}?path=campaigns`)
      ]);

      const statsData = await statsRes.json();
      const callsData = await callsRes.json();
      const clientsData = await clientsRes.json();
      const campaignsData = await campaignsRes.json();

      setStats(statsData);
      setRecentCalls(callsData);
      setClients(clientsData);
      setEmailCampaigns(campaignsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'hot': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'warm': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'cold': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'completed': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleInitiateCall = async (clientId: number, phone: string) => {
    setCallingInProgress(prev => ({ ...prev, [clientId]: true }));
    
    try {
      const response = await fetch(`${API_URL}?path=initiate_call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          phone: phone
        })
      });

      const result = await response.json();
      
      if (result.success) {
        await loadData();
      } else {
        console.error('Failed to initiate call:', result.error);
      }
    } catch (error) {
      console.error('Error initiating call:', error);
    } finally {
      setCallingInProgress(prev => ({ ...prev, [clientId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/50 backdrop-blur-xl bg-card/30 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
                <Icon name="Sparkles" size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">AI CRM Platform</h1>
                <p className="text-xs text-muted-foreground">Управление клиентами с ИИ</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Icon name="Bell" size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full"></span>
              </Button>
              <Avatar className="w-10 h-10 border-2 border-primary/50">
                <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                  АП
                </div>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card/50 backdrop-blur-sm border border-border/50 p-1">
            <TabsTrigger value="dashboard" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary">
              <Icon name="LayoutDashboard" size={16} />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary">
              <Icon name="Users" size={16} />
              Клиенты
            </TabsTrigger>
            <TabsTrigger value="calls" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary">
              <Icon name="Phone" size={16} />
              Звонки ИИ
            </TabsTrigger>
            <TabsTrigger value="emails" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary">
              <Icon name="Mail" size={16} />
              Email рассылки
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary">
              <Icon name="Settings" size={16} />
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab 
              stats={stats} 
              recentCalls={recentCalls} 
              getStatusColor={getStatusColor}
              loadData={loadData}
            />
          </TabsContent>

          <TabsContent value="clients">
            <ClientsTab 
              clients={clients} 
              getStatusColor={getStatusColor}
              handleInitiateCall={handleInitiateCall}
              callingInProgress={callingInProgress}
            />
          </TabsContent>

          <TabsContent value="calls">
            <CallsTab 
              recentCalls={recentCalls} 
              getStatusColor={getStatusColor}
            />
          </TabsContent>

          <TabsContent value="emails">
            <EmailsTab 
              emailCampaigns={emailCampaigns} 
              getStatusColor={getStatusColor}
            />
          </TabsContent>

          <TabsContent value="settings" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Icon name="Cpu" size={20} className="text-primary" />
                  Параметры ИИ агента
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm mb-2 block">Модель ИИ</Label>
                    <Select defaultValue="gpt4">
                      <SelectTrigger className="bg-muted/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt4">GPT-4 (Рекомендуется)</SelectItem>
                        <SelectItem value="gpt35">GPT-3.5</SelectItem>
                        <SelectItem value="claude">Claude 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm mb-2 block">Температура (креативность)</Label>
                    <Input type="number" defaultValue="0.7" step="0.1" min="0" max="1" className="bg-muted/30" />
                  </div>

                  <div>
                    <Label className="text-sm mb-2 block">Системный промпт</Label>
                    <Textarea 
                      defaultValue="Ты - профессиональный менеджер по продажам. Твоя задача - общаться с клиентами вежливо и эффективно..."
                      className="bg-muted/30 min-h-[120px]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Label>Автоматическое обучение на звонках</Label>
                    <Switch defaultChecked />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Icon name="Plug" size={20} className="text-secondary" />
                  Интеграции
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Icon name="Database" size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">OpenAI API</p>
                        <p className="text-xs text-muted-foreground">Для ИИ агента</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/50 border">
                      Подключено
                    </Badge>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-orange-500/20 flex items-center justify-center">
                        <Icon name="Mail" size={20} className="text-accent" />
                      </div>
                      <div>
                        <p className="font-semibold">SMTP сервер</p>
                        <p className="text-xs text-muted-foreground">Для email рассылок</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Настроить
                    </Button>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary/20 to-pink-500/20 flex items-center justify-center">
                        <Icon name="Phone" size={20} className="text-secondary" />
                      </div>
                      <div>
                        <p className="font-semibold">Телефония</p>
                        <p className="text-xs text-muted-foreground">Twilio / VoIP</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Подключить
                    </Button>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                        <Icon name="Webhook" size={20} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold">Webhook</p>
                        <p className="text-xs text-muted-foreground">API интеграции</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Настроить
                    </Button>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground flex items-start gap-2">
                    <Icon name="Info" size={16} className="mt-0.5 text-primary" />
                    <span>Все интеграции защищены end-to-end шифрованием. Данные клиентов надежно защищены.</span>
                  </p>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
