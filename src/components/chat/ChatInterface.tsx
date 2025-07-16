import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User } from 'lucide-react';
import { ChatMessage } from '@/types/battery';
import { BatteryInsights } from '@/types/battery';

interface ChatInterfaceProps {
  insights: BatteryInsights | null;
}

export const ChatInterface = ({ insights }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! Iam your chatbot assistant.ask me anything related to data',
      timestamp: new Date(),
      type: 'assistant'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const generateResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (!insights) {
      return "I'm still loading the battery data. Please wait a moment and try again.";
    }

    if (message.includes('voltage')) {
      return `The battery voltage analysis shows:
• Average voltage: ${insights.averageVoltage.toFixed(2)}V
• Minimum voltage: ${insights.minVoltage.toFixed(2)}V
• Maximum voltage: ${insights.maxVoltage.toFixed(2)}V
• Voltage range: ${(insights.maxVoltage - insights.minVoltage).toFixed(2)}V

This indicates ${insights.minVoltage < 45 ? 'some deep discharge cycles' : 'healthy voltage levels'}.`;
    }

    if (message.includes('energy') || message.includes('consumption')) {
      return `Energy analysis reveals:
• Total energy consumed: ${insights.totalEnergyConsumed.toFixed(3)} kWh
• Total energy generated: ${insights.totalEnergyGenerated.toFixed(3)} kWh
• Net energy balance: ${(insights.totalEnergyGenerated - insights.totalEnergyConsumed).toFixed(3)} kWh
• System efficiency: ${insights.efficiency.toFixed(1)}%

${insights.efficiency > 85 ? 'Excellent efficiency!' : insights.efficiency > 70 ? 'Good efficiency' : 'Consider checking for energy losses'}`;
    }

    if (message.includes('charging') || message.includes('cycle')) {
      return `Charging cycle analysis:
• Total charging cycles detected: ${insights.chargingCycles}
• Average State of Charge: ${insights.averageSOC.toFixed(1)}%
• Peak current: ${insights.peakCurrent.toFixed(2)}A

${insights.chargingCycles > 10 ? 'High cycle count - monitor battery health' : 'Normal charging cycle activity'}`;
    }

    if (message.includes('current') || message.includes('ampere')) {
      return `Current analysis shows:
• Peak current: ${insights.peakCurrent.toFixed(2)}A
• This represents the maximum instantaneous current draw/charge

High current peaks can indicate:
- Heavy load usage during discharge
- Fast charging during charge cycles
- Potential system inefficiencies if sustained`;
    }

    if (message.includes('soc') || message.includes('state of charge')) {
      return `State of Charge (SOC) insights:
• Average SOC: ${insights.averageSOC.toFixed(1)}%
• Operating range appears ${insights.averageSOC > 60 ? 'healthy' : 'on the lower side'}

Recommendations:
- Keep SOC between 20-80% for optimal battery life
- Avoid deep discharges below 20%
- Regular full charges help calibrate the system`;
    }

    if (message.includes('health') || message.includes('condition')) {
      const healthScore = calculateHealthScore(insights);
      return `Battery health assessment:
• Health score: ${healthScore}/100
• Efficiency rating: ${insights.efficiency.toFixed(1)}%
• Charging cycles: ${insights.chargingCycles}

${healthScore > 80 ? 'Battery is in excellent condition' : 
  healthScore > 60 ? 'Battery is in good condition' : 
  'Battery may need attention - consider maintenance'}`;
    }

    if (message.includes('recommend') || message.includes('advice')) {
      return `Based on your battery data, here are my recommendations:

1. **Charging Strategy**: ${insights.averageSOC < 50 ? 'Increase charging frequency' : 'Current charging pattern looks good'}
2. **Voltage Management**: ${insights.minVoltage < 45 ? 'Avoid deep discharges' : 'Voltage levels are healthy'}
3. **Efficiency**: ${insights.efficiency < 80 ? 'Check for energy losses in the system' : 'Efficiency is optimal'}
4. **Monitoring**: Track temperature and current spikes for early warning signs

Would you like me to elaborate on any of these points?`;
    }

    return `I can provide insights about your battery system including:
• Voltage analysis and trends
• Energy consumption and generation
• Charging cycle patterns
• Current draw analysis
• State of charge optimization
• Battery health assessment
• Performance recommendations

What specific aspect would you like to explore?`;
  };

  const calculateHealthScore = (insights: BatteryInsights): number => {
    let score = 100;
    
  
    if (insights.efficiency < 80) score -= (80 - insights.efficiency) * 0.5;
    
    if (insights.chargingCycles > 20) score -= (insights.chargingCycles - 20) * 2;

    const voltageRange = insights.maxVoltage - insights.minVoltage;
    if (voltageRange > 15) score -= (voltageRange - 15) * 2;
    
  
    if (insights.averageSOC < 40) score -= (40 - insights.averageSOC) * 1.5;
    
    return Math.max(0, Math.min(100, score));
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      timestamp: new Date(),
      type: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const response = generateResponse(input);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        timestamp: new Date(),
        type: 'assistant'
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-[500px] flex flex-col bg-slate-800/50 border-slate-700 flex-shrink-0 w-2/3 mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Bot className="h-5 w-5 text-blue-400" />
          Battery Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 pr-4 min-h-0" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.type === 'assistant' && (
                      <Bot className="h-4 w-4 mt-1 flex-shrink-0 text-blue-400" />
                    )}
                    {message.type === 'user' && (
                      <User className="h-4 w-4 mt-1 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-700 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-blue-400" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex gap-2 mt-4 flex-shrink-0">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about battery performance, voltage trends, energy usage..."
            className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!input.trim() || isTyping}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};