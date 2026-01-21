import { useState, useRef } from 'react';
import { EmailCampaignDialog } from './EmailCampaignDialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as XLSX from 'xlsx';

interface ClientsTabProps {
  clients: any[];
  getStatusColor: (status: string) => string;
  handleInitiateCall: (clientId: number, phone: string) => Promise<void>;
  callingInProgress: {[key: number]: boolean};
  onImportClients: (clients: any[]) => void;
}

export const ClientsTab = ({ clients, getStatusColor, handleInitiateCall, callingInProgress, onImportClients }: ClientsTabProps) => {
  const [importing, setImporting] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedClients, setSelectedClients] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const templateData = [
      { 'Имя': '', 'Email': '', 'Телефон': '' }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Клиенты');
    
    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 30 },
      { wch: 20 }
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

      const parsedClients = jsonData.map((row: any, index: number) => ({
        id: Date.now() + index,
        name: row['Имя'] || row['Name'] || row['ФИО'] || '',
        email: row['Email'] || row['Почта'] || row['E-mail'] || '',
        phone: row['Телефон'] || row['Phone'] || row['Номер'] || '',
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
            <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
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

      <EmailCampaignDialog
        open={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
        selectedClients={selectedClients}
        onSendComplete={(result) => {
          alert(`Рассылка завершена!\n✅ Отправлено: ${result.sent}\n❌ Ошибок: ${result.failed}\n\n📧 Отчет отправлен на zakaz6377@yandex.ru`);
        }}
      />
    </div>
  );
};