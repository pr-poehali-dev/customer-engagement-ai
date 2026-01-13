import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EmailsTabProps {
  emailCampaigns: any[];
  getStatusColor: (status: string) => string;
}

export const EmailsTab = ({ emailCampaigns, getStatusColor }: EmailsTabProps) => {
  return (
    <div className="animate-fade-in">
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
    </div>
  );
};
