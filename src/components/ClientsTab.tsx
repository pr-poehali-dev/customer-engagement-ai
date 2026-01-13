import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ClientsTabProps {
  clients: any[];
  getStatusColor: (status: string) => string;
  handleInitiateCall: (clientId: number, phone: string) => Promise<void>;
  callingInProgress: {[key: number]: boolean};
}

export const ClientsTab = ({ clients, getStatusColor, handleInitiateCall, callingInProgress }: ClientsTabProps) => {
  return (
    <div className="animate-fade-in">
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
    </div>
  );
};
