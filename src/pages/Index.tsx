import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Avatar } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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

  const statsDisplay = [
    { label: 'Всего клиентов', value: stats.totalClients.toString(), change: '+12%', icon: 'Users', color: 'text-primary' },
    { label: 'Звонков сегодня', value: stats.callsToday.toString(), change: '+8%', icon: 'Phone', color: 'text-secondary' },
    { label: 'Email отправлено', value: stats.emailsSent.toLocaleString(), change: '+24%', icon: 'Mail', color: 'text-accent' },
    { label: 'Конверсия', value: `${stats.conversion}%`, change: '+5%', icon: 'TrendingUp', color: 'text-primary' },
  ];

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

          <TabsContent value="dashboard" className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsDisplay.map((stat, index) => (
                <Card key={index} className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                      <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                      <p className="text-xs text-green-400 flex items-center gap-1">
                        <Icon name="ArrowUp" size={12} />
                        {stat.change}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center ${stat.color}`}>
                      <Icon name={stat.icon as any} size={24} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Последние звонки ИИ</h3>
                  <Button size="sm" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90" onClick={loadData}>
                    <Icon name="RefreshCw" size={16} className="mr-2" />
                    Обновить
                  </Button>
                </div>
                <div className="space-y-4">
                  {recentCalls.map((call) => (
                    <div key={call.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="w-10 h-10 border-2 border-primary/30">
                          <div className="w-full h-full bg-gradient-to-br from-primary/50 to-secondary/50 flex items-center justify-center text-sm font-semibold">
                            {call.client?.split(' ').map((n: string) => n[0]).join('') || '??'}
                          </div>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{call.client}</p>
                          <p className="text-xs text-muted-foreground">{call.timestamp} • {call.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${getStatusColor(call.status)} border`}>
                          {call.result}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <Icon name="Play" size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <h3 className="text-xl font-bold mb-6">Активность ИИ агента</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Успешные звонки</span>
                      <span className="text-sm font-semibold">89/120</span>
                    </div>
                    <Progress value={74} className="h-2 bg-muted" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Конверсия в продажу</span>
                      <span className="text-sm font-semibold">68%</span>
                    </div>
                    <Progress value={68} className="h-2 bg-muted" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Средняя длительность</span>
                      <span className="text-sm font-semibold">5:32 мин</span>
                    </div>
                    <Progress value={92} className="h-2 bg-muted" />
                  </div>
                  
                  <div className="pt-4 border-t border-border/50">
                    <h4 className="font-semibold mb-4">Быстрые действия</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="justify-start gap-2">
                        <Icon name="FileText" size={16} />
                        Отчеты
                      </Button>
                      <Button variant="outline" className="justify-start gap-2">
                        <Icon name="Settings" size={16} />
                        Настройки ИИ
                      </Button>
                      <Button variant="outline" className="justify-start gap-2">
                        <Icon name="Download" size={16} />
                        Экспорт
                      </Button>
                      <Button variant="outline" className="justify-start gap-2">
                        <Icon name="BarChart" size={16} />
                        Аналитика
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clients" className="animate-fade-in">
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">База клиентов</h3>
                  <p className="text-sm text-muted-foreground">Управление контактами и историей взаимодействий</p>
                </div>
                <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить клиента
                </Button>
              </div>

              <div className="flex gap-4 mb-6">
                <Input placeholder="Поиск по имени, email, телефону..." className="flex-1 bg-muted/30" />
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px] bg-muted/30">
                    <SelectValue placeholder="Статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="hot">Горячие</SelectItem>
                    <SelectItem value="warm">Теплые</SelectItem>
                    <SelectItem value="cold">Холодные</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {clients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all hover:scale-[1.01]">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 border-2 border-primary/30">
                        <div className="w-full h-full bg-gradient-to-br from-primary/50 to-secondary/50 flex items-center justify-center font-semibold">
                          {client.name?.split(' ').map((n: string) => n[0]).join('') || '??'}
                        </div>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{client.name}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Icon name="Mail" size={12} />
                            {client.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="Phone" size={12} />
                            {client.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge className={`${getStatusColor(client.status)} border mb-1`}>
                          {client.status === 'hot' ? 'Горячий' : client.status === 'warm' ? 'Теплый' : 'Холодный'}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{client.last_contact}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleInitiateCall(client.id, client.phone)}
                          disabled={callingInProgress[client.id]}
                          className="hover:bg-green-500/20 hover:text-green-600"
                        >
                          <Icon name={callingInProgress[client.id] ? "Loader2" : "Phone"} size={16} className={callingInProgress[client.id] ? 'animate-spin' : ''} />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:bg-blue-500/20 hover:text-blue-600">
                          <Icon name="Mail" size={16} />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Icon name="MoreVertical" size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="calls" className="animate-fade-in">
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
                          <Button variant="ghost" size="sm" className="h-8">
                            <Icon name="Play" size={14} className="mr-1" />
                            Прослушать
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8">
                            <Icon name="FileText" size={14} className="mr-1" />
                            Транскрипт
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
          </TabsContent>

          <TabsContent value="emails" className="animate-fade-in">
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Email рассылки</h3>
                  <p className="text-sm text-muted-foreground">Создание и управление email кампаниями</p>
                </div>
                <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                  <Icon name="Plus" size={16} className="mr-2" />
                  Новая рассылка
                </Button>
              </div>

              <div className="space-y-4">
                {emailCampaigns.map((campaign) => (
                  <div key={campaign.id} className="p-5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold mb-1">{campaign.name}</h4>
                        <Badge className={`${getStatusColor(campaign.status)} border text-xs`}>
                          {campaign.status === 'active' ? 'Активна' : 'Завершена'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Icon name="Edit" size={16} />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Icon name="Copy" size={16} />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Icon name="MoreVertical" size={16} />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 rounded-lg bg-card/50">
                        <p className="text-2xl font-bold mb-1">{campaign.sent}</p>
                        <p className="text-xs text-muted-foreground">Отправлено</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-card/50">
                        <p className="text-2xl font-bold mb-1">{campaign.opened}</p>
                        <p className="text-xs text-muted-foreground">Открыто</p>
                        <p className="text-xs text-green-400 mt-1">{Math.round((campaign.opened / campaign.sent) * 100)}%</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-card/50">
                        <p className="text-2xl font-bold mb-1">{campaign.clicked}</p>
                        <p className="text-xs text-muted-foreground">Кликнуло</p>
                        <p className="text-xs text-green-400 mt-1">{Math.round((campaign.clicked / campaign.opened) * 100)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-6 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Icon name="Sparkles" size={18} className="text-primary" />
                  Создать новую рассылку с помощью ИИ
                </h4>
                <div className="space-y-3">
                  <Input placeholder="Название кампании" className="bg-card/50" />
                  <Textarea placeholder="Опишите цель рассылки, и ИИ создаст персонализированный контент..." className="bg-card/50 min-h-[100px]" />
                  <div className="flex gap-3">
                    <Select defaultValue="all">
                      <SelectTrigger className="bg-card/50">
                        <SelectValue placeholder="Целевая аудитория" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все клиенты</SelectItem>
                        <SelectItem value="hot">Горячие лиды</SelectItem>
                        <SelectItem value="inactive">Неактивные</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                      <Icon name="Wand2" size={16} className="mr-2" />
                      Сгенерировать с ИИ
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
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