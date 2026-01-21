import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface EmailCampaignDialogProps {
  open: boolean;
  onClose: () => void;
  selectedClients: any[];
  onSendComplete: (result: any) => void;
}

export const EmailCampaignDialog = ({ open, onClose, selectedClients, onSendComplete }: EmailCampaignDialogProps) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      alert('Заполните тему и текст письма');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('https://functions.poehali.dev/732140997/email_campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: selectedClients.map(c => ({ name: c.name, email: c.email })),
          subject,
          message
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        onSendComplete(result);
        setSubject('');
        setMessage('');
        onClose();
      } else {
        alert('Ошибка отправки: ' + (result.error || 'Неизвестная ошибка'));
      }
    } catch (error) {
      console.error('Email campaign error:', error);
      alert('Ошибка отправки писем');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Mail" size={20} />
            Email рассылка
          </DialogTitle>
          <DialogDescription>
            Отправка писем выбранным клиентам. Отчет придет на zakaz6377@yandex.ru
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Получатели ({selectedClients.length})
            </Label>
            <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg max-h-32 overflow-y-auto">
              {selectedClients.map(client => (
                <Badge key={client.id} variant="secondary" className="text-xs">
                  {client.name} ({client.email})
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="subject" className="text-sm font-medium mb-2 block">
              Тема письма
            </Label>
            <Input
              id="subject"
              placeholder="Введите тему письма..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-muted/30"
            />
          </div>

          <div>
            <Label htmlFor="message" className="text-sm font-medium mb-2 block">
              Текст письма
            </Label>
            <Textarea
              id="message"
              placeholder="Введите текст письма..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="bg-muted/30"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Письмо будет отправлено в HTML формате с красивым оформлением
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={sending}>
              Отмена
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={sending || !subject.trim() || !message.trim()}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              {sending ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Icon name="Send" size={16} className="mr-2" />
                  Отправить рассылку
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
