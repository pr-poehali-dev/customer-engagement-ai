import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ScenarioStep {
  id: string;
  type: 'greeting' | 'question' | 'objection' | 'closing' | 'custom';
  content: string;
  nextStep?: string;
  branches?: { condition: string; nextStep: string }[];
}

interface Scenario {
  id: number;
  name: string;
  description: string;
  steps: ScenarioStep[];
  status: 'active' | 'draft';
  created: string;
}

interface ScenarioBuilderProps {
  scenarios: Scenario[];
  onSaveScenario: (scenario: Scenario) => void;
  onDeleteScenario: (id: number) => void;
}

export const ScenarioBuilder = ({ scenarios, onSaveScenario, onDeleteScenario }: ScenarioBuilderProps) => {
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  const createNewScenario = () => {
    const newScenario: Scenario = {
      id: Date.now(),
      name: 'Новый сценарий',
      description: '',
      steps: [
        {
          id: 'start',
          type: 'greeting',
          content: 'Здравствуйте! Меня зовут AI-ассистент...',
        }
      ],
      status: 'draft',
      created: new Date().toLocaleDateString('ru-RU')
    };
    setEditingScenario(newScenario);
    setSelectedStep('start');
  };

  const addStep = (type: ScenarioStep['type']) => {
    if (!editingScenario) return;
    
    const newStep: ScenarioStep = {
      id: `step-${Date.now()}`,
      type,
      content: '',
    };

    setEditingScenario({
      ...editingScenario,
      steps: [...editingScenario.steps, newStep]
    });
    setSelectedStep(newStep.id);
  };

  const updateStep = (stepId: string, updates: Partial<ScenarioStep>) => {
    if (!editingScenario) return;

    setEditingScenario({
      ...editingScenario,
      steps: editingScenario.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    });
  };

  const removeStep = (stepId: string) => {
    if (!editingScenario) return;

    setEditingScenario({
      ...editingScenario,
      steps: editingScenario.steps.filter(step => step.id !== stepId)
    });
    setSelectedStep(null);
  };

  const getStepTypeLabel = (type: ScenarioStep['type']) => {
    const labels = {
      greeting: 'Приветствие',
      question: 'Вопрос',
      objection: 'Отработка возражения',
      closing: 'Закрытие сделки',
      custom: 'Произвольный блок'
    };
    return labels[type];
  };

  const getStepTypeIcon = (type: ScenarioStep['type']) => {
    const icons = {
      greeting: 'Hand',
      question: 'MessageCircleQuestion',
      objection: 'ShieldAlert',
      closing: 'CheckCircle',
      custom: 'Box'
    };
    return icons[type];
  };

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Мои сценарии</h3>
            <Button 
              size="sm"
              onClick={createNewScenario}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              <Icon name="Plus" size={14} />
            </Button>
          </div>

          <div className="space-y-3">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${
                  editingScenario?.id === scenario.id
                    ? 'bg-primary/10 border-primary/50'
                    : 'bg-muted/30 border-border/30'
                }`}
                onClick={() => {
                  setEditingScenario(scenario);
                  setSelectedStep(scenario.steps[0]?.id || null);
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-sm mb-1">{scenario.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{scenario.description || 'Нет описания'}</p>
                  </div>
                  <Badge 
                    className={`ml-2 text-xs ${
                      scenario.status === 'active' 
                        ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                    } border`}
                  >
                    {scenario.status === 'active' ? 'Активен' : 'Черновик'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-muted-foreground">{scenario.steps.length} шагов</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-red-500/20 hover:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteScenario(scenario.id);
                      if (editingScenario?.id === scenario.id) {
                        setEditingScenario(null);
                      }
                    }}
                  >
                    <Icon name="Trash2" size={12} />
                  </Button>
                </div>
              </div>
            ))}

            {scenarios.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="FileText" size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Нет сценариев</p>
                <p className="text-xs">Создайте первый сценарий</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 lg:col-span-2">
          {editingScenario ? (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <Input
                      value={editingScenario.name}
                      onChange={(e) => setEditingScenario({ ...editingScenario, name: e.target.value })}
                      className="text-lg font-bold bg-muted/30 border-none mb-2"
                      placeholder="Название сценария"
                    />
                    <Input
                      value={editingScenario.description}
                      onChange={(e) => setEditingScenario({ ...editingScenario, description: e.target.value })}
                      className="text-sm bg-muted/30 border-none"
                      placeholder="Описание сценария"
                    />
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        onSaveScenario({ ...editingScenario, status: 'draft' });
                      }}
                    >
                      Сохранить
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                      onClick={() => {
                        onSaveScenario({ ...editingScenario, status: 'active' });
                      }}
                    >
                      <Icon name="Check" size={16} className="mr-2" />
                      Активировать
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <Label className="text-sm mb-3 block">Добавить шаг сценария:</Label>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => addStep('greeting')}>
                    <Icon name="Hand" size={14} className="mr-2" />
                    Приветствие
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addStep('question')}>
                    <Icon name="MessageCircleQuestion" size={14} className="mr-2" />
                    Вопрос
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addStep('objection')}>
                    <Icon name="ShieldAlert" size={14} className="mr-2" />
                    Возражение
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addStep('closing')}>
                    <Icon name="CheckCircle" size={14} className="mr-2" />
                    Закрытие
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addStep('custom')}>
                    <Icon name="Box" size={14} className="mr-2" />
                    Произвольный
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {editingScenario.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`p-4 rounded-lg border transition-all ${
                      selectedStep === step.id
                        ? 'bg-primary/10 border-primary/50'
                        : 'bg-muted/30 border-border/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-white">
                          {index + 1}
                        </div>
                        <Badge variant="outline" className="gap-1">
                          <Icon name={getStepTypeIcon(step.type)} size={12} />
                          {getStepTypeLabel(step.type)}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-red-500/20 hover:text-red-400"
                        onClick={() => removeStep(step.id)}
                      >
                        <Icon name="X" size={14} />
                      </Button>
                    </div>

                    <Textarea
                      value={step.content}
                      onChange={(e) => updateStep(step.id, { content: e.target.value })}
                      placeholder="Введите текст для этого шага..."
                      className="bg-card/50 min-h-[100px] mb-3"
                      onClick={() => setSelectedStep(step.id)}
                    />

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon name="Sparkles" size={12} className="text-primary" />
                      <span>ИИ может генерировать ответы на основе контекста разговора</span>
                    </div>
                  </div>
                ))}
              </div>

              {editingScenario.steps.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="Plus" size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-sm">Добавьте шаги в сценарий</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Icon name="FileText" size={64} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg mb-2">Выберите сценарий для редактирования</p>
                <p className="text-sm">или создайте новый</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
