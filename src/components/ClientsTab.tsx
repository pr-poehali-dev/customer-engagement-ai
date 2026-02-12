import { useState, useRef } from 'react';
import { EmailCampaignDialog } from './EmailCampaignDialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import * as XLSX from 'xlsx';
import { useSubscription } from '@/hooks/useSubscription';

const API_URL = 'https://functions.poehali.dev/0c17e1a7-ce1b-49a9-9ef7-f7cb2df73405';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  legalAddress?: string;
  status: string;
  last_contact: string;
}

interface ClientsTabProps {
  clients: Client[];
  getStatusColor: (status: string) => string;
  handleInitiateCall: (clientId: number, phone: string) => Promise<void>;
  callingInProgress: {[key: number]: boolean};
  onImportClients: (clients: Client[]) => void;
  onEditClient: (client: Client) => void;
  onAddClient: () => void;
  onDeleteClient: (clientId: number) => void;
}

export const ClientsTab = ({ clients, getStatusColor, handleInitiateCall, callingInProgress, onImportClients, onEditClient, onAddClient, onDeleteClient }: ClientsTabProps) => {
  const [importing, setImporting] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedClients, setSelectedClients] = useState<Client[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiSuggestion, setAiSuggestion] = useState<{
    suggestion: string;
    client: { name: string; company: string; email: string; phone: string; status: string };
    calls_count: number;
  } | null>(null);
  const [suggestionDialogOpen, setSuggestionDialogOpen] = useState(false);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [suggestingClientId, setSuggestingClientId] = useState<number | null>(null);

  const { hasFeature } = useSubscription();

  const handleGetAiSuggestion = async (clientId: number) => {
    if (!hasFeature('ai_suggestions')) {
      alert('ИИ-рекомендации доступны только на тарифах Professional и Enterprise. Перейдите в раздел "Оплата" для обновления тарифа.');
      return;
    }

    setLoadingSuggestion(true);
    setSuggestingClientId(clientId);
    
    try {
      const response = await fetch(`${API_URL}?path=ai_suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAiSuggestion(data);
        setSuggestionDialogOpen(true);
      } else {
        const error = await response.json();
        alert(error.message || 'Ошибка при получении рекомендаций');
      }
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      alert('Не удалось получить рекомендации ИИ');
    } finally {
      setLoadingSuggestion(false);
      setSuggestingClientId(null);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      { 'Имя': '', 'Email': '', 'Телефон': '', 'Юр. лицо': '', 'Юр. адрес': '' }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Клиенты');
    
    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 30 },
      { wch: 20 },
      { wch: 35 },
      { wch: 40 }
    ];
    
    XLSX.writeFile(workbook, 'Шаблон_импорта_клиентов.xlsx');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const parsedClients = jsonData.map((row: Record<string, unknown>, index: number) => ({
        id: Date.now() + index,
        name: row['Имя'] || row['Name'] || row['ФИО'] || '',
        email: row['Email'] || row['Почта'] || row['E-mail'] || '',
        phone: row['Телефон'] || row['Phone'] || row['Номер'] || '',
        company: row['Юр. лицо'] || row['Компания'] || row['Company'] || '',
        legalAddress: row['Юр. адрес'] || row['Адрес'] || row['Address'] || '',
        status: 'cold',
        last_contact: 'Импортирован'
      }));

      onImportClients(parsedClients);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error importing Excel:', error);
    } finally {
      setImporting(false);
    }
  };
  return (
    <div className="animate-fade-in">
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold">База клиентов</h3>
            <p className="text-sm text-muted-foreground">Управление контактами и историей взаимодействий</p>
          </div>
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button 
              variant="outline"
              onClick={downloadTemplate}
              className="border-secondary/50 hover:bg-secondary/10"
            >
              <Icon name="Download" size={16} className="mr-2" />
              Скачать шаблон
            </Button>
            <Button 
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="border-primary/50 hover:bg-primary/10"
            >
              <Icon name={importing ? "Loader2" : "Upload"} size={16} className={`mr-2 ${importing ? 'animate-spin' : ''}`} />
              Импорт из Excel
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                const clientsWithEmail = clients.filter(c => c.email && c.email.includes('@'));
                if (clientsWithEmail.length === 0) {
                  alert('Нет клиентов с email адресами');
                  return;
                }
                setSelectedClients(clientsWithEmail);
                setEmailDialogOpen(true);
              }}
              className="border-blue-500/50 hover:bg-blue-500/10"
            >
              <Icon name="Mail" size={16} className="mr-2" />
              Email рассылка
            </Button>
            <Button onClick={onAddClient} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить клиента
            </Button>
          </div>
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
                  {client.company && (
                    <p className="text-sm text-muted-foreground">{client.company}</p>
                  )}
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
                  {client.legalAddress && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Icon name="MapPin" size={12} />
                      {client.legalAddress}
                    </p>
                  )}
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
                    onClick={() => handleGetAiSuggestion(client.id)}
                    disabled={loadingSuggestion && suggestingClientId === client.id}
                    className="hover:bg-purple-500/20 hover:text-purple-600"
                    title="ИИ-рекомендация"
                  >
                    <Icon name={loadingSuggestion && suggestingClientId === client.id ? "Loader2" : "Sparkles"} size={16} className={loadingSuggestion && suggestingClientId === client.id ? 'animate-spin' : ''} />
                  </Button>
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
                  <Button variant="ghost" size="icon" onClick={() => onEditClient(client)} className="hover:bg-primary/20 hover:text-primary">
                    <Icon name="Edit" size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      if (confirm(`Удалить клиента ${client.name}?`)) {
                        onDeleteClient(client.id);
                      }
                    }} 
                    className="hover:bg-red-500/20 hover:text-red-600"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <EmailCampaignDialog
        open={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
        selectedClients={selectedClients}
        onSendComplete={(result) => {
          alert(`Рассылка завершена!\n✅ Отправлено: ${result.sent}\n❌ Ошибок: ${result.failed}\n\n📧 Отчет отправлен на zakaz6377@yandex.ru`);
        }}
      />

      <Dialog open={suggestionDialogOpen} onOpenChange={setSuggestionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Sparkles" size={20} className="text-purple-600" />
              ИИ-рекомендации по клиенту
            </DialogTitle>
            <DialogDescription>
              {aiSuggestion?.client && (
                <span>Клиент: {aiSuggestion.client.name} ({aiSuggestion.client.company})</span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {aiSuggestion && (
            <div className="space-y-4">
              <Card className="p-4 bg-muted/30">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Статус</p>
                    <Badge className={getStatusColor(aiSuggestion.client.status)}>
                      {aiSuggestion.client.status === 'hot' ? 'Горячий' : aiSuggestion.client.status === 'warm' ? 'Теплый' : 'Холодный'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Звонков в истории</p>
                    <p className="font-semibold">{aiSuggestion.calls_count}</p>
                  </div>
                </div>
              </Card>

              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap bg-card p-4 rounded-lg border">
                  {aiSuggestion.suggestion}
                </div>
              </div>

              <Card className="p-4 bg-primary/5">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Icon name="User" size={16} />
                  Контактная информация
                </h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Email:</span> {aiSuggestion.client.email}</p>
                  <p><span className="text-muted-foreground">Телефон:</span> {aiSuggestion.client.phone}</p>
                </div>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};