import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { DashboardTab } from '@/components/DashboardTab';
import { ClientsTab } from '@/components/ClientsTab';
import { CallsTab } from '@/components/CallsTab';
import { EmailsTab } from '@/components/EmailsTab';
import { ScenarioBuilder } from '@/components/ScenarioBuilder';
import { SettingsTab } from '@/components/SettingsTab';
import { UsersTab } from '@/components/UsersTab';
import { PaymentTab } from '@/components/PaymentTab';
import { AssistantTab } from '@/components/AssistantTab';
import { ClientEditDialog } from '@/components/ClientEditDialog';

const API_URL = 'https://functions.poehali.dev/0c17e1a7-ce1b-49a9-9ef7-f7cb2df73405';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [clientEditDialogOpen, setClientEditDialogOpen] = useState(false);

  useEffect(() => {
    const isAuth = localStorage.getItem('avt_auth');
    if (!isAuth) {
      navigate('/');
    } else {
      // Проверяем параметр tab в URL
      const tabParam = searchParams.get('tab');
      if (tabParam) {
        setActiveTab(tabParam);
      }
      loadData();
    }
  }, [navigate, searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, callsRes, clientsRes, campaignsRes, scenariosRes] = await Promise.all([
        fetch(`${API_URL}?path=stats`),
        fetch(`${API_URL}?path=calls`),
        fetch(`${API_URL}?path=clients`),
        fetch(`${API_URL}?path=campaigns`),
        fetch(`${API_URL}?path=scenarios`)
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      if (callsRes.ok) {
        const data = await callsRes.json();
        setRecentCalls(data.calls || []);
      }

      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setClients(data.clients || []);
      }

      if (campaignsRes.ok) {
        const data = await campaignsRes.json();
        setEmailCampaigns(data.campaigns || []);
      }

      if (scenariosRes.ok) {
        const data = await scenariosRes.json();
        setScenarios(data.scenarios || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('avt_auth');
    navigate('/');
  };

  const handleImportClients = async (importedClients: any[]) => {
    try {
      const response = await fetch(`${API_URL}?path=import_clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clients: importedClients })
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
        alert(`Успешно импортировано ${importedClients.length} клиентов`);
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Ошибка импорта клиентов');
    }
  };

  const handleEditClient = (client: any) => {
    setEditingClient(client);
    setClientEditDialogOpen(true);
  };

  const handleSaveClient = async (updatedClient: any) => {
    try {
      const response = await fetch(`${API_URL}?path=update_client`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client: updatedClient })
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
        alert('Клиент обновлен');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Ошибка обновления клиента');
    }
  };

  const handleInitiateCall = async (clientId: number, phone: string) => {
    setCallingInProgress(prev => ({ ...prev, [clientId]: true }));
    try {
      const response = await fetch(`${API_URL}?path=initiate_call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, phone })
      });

      if (response.ok) {
        alert('Звонок инициирован');
        loadData();
      }
    } catch (error) {
      console.error('Call error:', error);
    } finally {
      setCallingInProgress(prev => ({ ...prev, [clientId]: false }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return 'bg-red-500/20 text-red-600 border-red-500/30';
      case 'warm': return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
      case 'cold': return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      default: return 'bg-muted/30 text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary">
              <Icon name="Bot" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Панель управления AVT
              </h1>
              <p className="text-sm text-muted-foreground">Платформа автоматизации работы с клиентами</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="border-red-500/50 hover:bg-red-500/10">
            <Icon name="LogOut" size={16} className="mr-2" />
            Выход
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-9 bg-muted/30 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="LayoutDashboard" size={16} className="mr-2" />
              Дашборд
            </TabsTrigger>
            <TabsTrigger value="clients" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Users" size={16} className="mr-2" />
              Клиенты
            </TabsTrigger>
            <TabsTrigger value="calls" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Phone" size={16} className="mr-2" />
              Звонки
            </TabsTrigger>
            <TabsTrigger value="emails" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Mail" size={16} className="mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="scenarios" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Workflow" size={16} className="mr-2" />
              Сценарии AI
            </TabsTrigger>
            <TabsTrigger value="assistant" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="BotMessageSquare" size={16} className="mr-2" />
              AI Секретарь
            </TabsTrigger>
            <TabsTrigger value="payment" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Wallet" size={16} className="mr-2" />
              Оплата
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Shield" size={16} className="mr-2" />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Settings" size={16} className="mr-2" />
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
              onImportClients={handleImportClients}
              onEditClient={handleEditClient}
            />
          </TabsContent>

          <TabsContent value="calls">
            <CallsTab recentCalls={recentCalls} />
          </TabsContent>

          <TabsContent value="emails">
            <EmailsTab emailCampaigns={emailCampaigns} />
          </TabsContent>

          <TabsContent value="scenarios">
            <ScenarioBuilder 
              scenarios={scenarios}
              onSave={(scenario) => {
                console.log('Save scenario:', scenario);
              }}
            />
          </TabsContent>

          <TabsContent value="assistant">
            <AssistantTab />
          </TabsContent>

          <TabsContent value="payment">
            <PaymentTab />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>

      <ClientEditDialog
        client={editingClient}
        open={clientEditDialogOpen}
        onClose={() => setClientEditDialogOpen(false)}
        onSave={handleSaveClient}
      />
    </div>
  );
};

export default Dashboard;