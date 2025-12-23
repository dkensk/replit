import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/layout/BottomNav";
import { Send, Bot, Sparkles } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useUser } from "@/lib/UserContext";
import { sendChatMessage } from "@/lib/api";

// Position-specific suggested questions
const POSITION_SUGGESTIONS: Record<string, string[]> = {
  defense: [
    "How can I improve my gap control?",
    "Best exercises for backward skating power?",
    "Tips for first pass breakouts?",
    "How do I improve my hip mobility for pivots?"
  ],
  wing: [
    "How can I win more board battles?",
    "Best drills for net-front presence?",
    "Tips for better forechecking?",
    "How do I improve my shot release?"
  ],
  center: [
    "How do I win more faceoffs?",
    "Best exercises for quick pivots?",
    "Tips for better defensive play?",
    "How can I improve my playmaking?"
  ],
  goalie: [
    "How can I improve my butterfly recovery?",
    "Best stretches for goalie flexibility?",
    "Tips for tracking pucks through traffic?",
    "How do I improve my rebound control?"
  ]
};

const GENERAL_SUGGESTIONS = [
  "What should I eat before a game?",
  "How can I improve my skating speed?",
  "Best off-ice workout for hockey?",
  "How do I build confidence after a bad game?"
];

export default function AI() {
  const { profile } = useUser();
  
  // Get position-specific suggestions with null guards
  const suggestions = useMemo(() => {
    const position = profile?.position || '';
    const positionQuestions = POSITION_SUGGESTIONS[position] || GENERAL_SUGGESTIONS;
    // Return 3 random position-specific questions
    const shuffled = [...positionQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [profile?.position]);
  
  // Build greeting message with null guards
  const getGreeting = () => {
    if (!profile || !profile.position) {
      return "Hey! I'm Coach AI, your personal hockey training assistant. I'm here to help with workouts, skills, nutrition, and the mental game. What would you like to work on?";
    }
    let msg = `Hey! I'm Coach AI, your personal hockey training assistant. I see you're a ${profile.position}`;
    if (profile.level) msg += ` playing at the ${profile.level} level`;
    if (profile.age) msg += ` and ${profile.age} years old`;
    msg += ". I'm here to help with workouts, skills, nutrition, and the mental game. What would you like to work on?";
    return msg;
  };
  
  const [messages, setMessages] = useState([
    { role: "assistant", content: getGreeting() }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = input;
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const response = await sendChatMessage(
        newMessages,
        profile ? {
          position: profile.position,
          level: profile.level,
          age: profile.age,
          weight: profile.weight,
        } : null
      );
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again in a moment." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <header className="relative z-10 flex-shrink-0 px-5 pt-6 pb-4 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center neon-glow">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div className="flex-1">
              <h1 className="font-heading font-bold text-white text-xl tracking-wide" data-testid="text-coach-title">
                COACH AI
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-3 h-3 text-primary/70" />
                <span className="text-xs text-muted-foreground">Powered by GPT-4</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-5 py-6 min-h-full flex flex-col justify-end">
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                data-testid={`message-${msg.role}-${i}`}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md'
                      : 'bg-card/80 text-white rounded-2xl rounded-tl-md border border-white/10'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start animate-in fade-in duration-300" data-testid="typing-indicator">
                <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center mr-2 flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-card/80 text-white rounded-2xl rounded-tl-md border border-white/10 px-4 py-3 flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>
          <div ref={scrollRef} className="h-4" />
        </div>
      </div>

      <div className="relative z-10 flex-shrink-0 px-5 pt-4 pb-24 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-md mx-auto space-y-3">
          <Card className="bg-card/60 border-white/10 p-2 backdrop-blur-sm">
            <div className="flex gap-2 items-center">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about workouts, diet, or skills..." 
                className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-muted-foreground/60 h-11"
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                data-testid="input-chat"
              />
              <Button 
                size="icon" 
                onClick={handleSend} 
                disabled={!input.trim() || isTyping} 
                className="w-10 h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-40"
                data-testid="button-send"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
          
          <div className="flex justify-center gap-2 flex-wrap">
            {suggestions.map((suggestion, i) => (
              <button 
                key={i}
                onClick={() => setInput(suggestion)} 
                className="text-xs text-muted-foreground hover:text-white hover:bg-white/5 transition-all border border-white/10 rounded-full px-3 py-1.5"
                data-testid={`button-suggestion-${i + 1}`}
              >
                {suggestion.length > 30 ? suggestion.slice(0, 28) + '...' : suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNav />
      </div>
    </div>
  );
}
