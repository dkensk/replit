import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/layout/BottomNav";
import { Send, Bot } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@/lib/UserContext";
import { sendChatMessage } from "@/lib/api";

export default function AI() {
  const { profile } = useUser();
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hi! I'm Coach AI. I know you're a ${profile.position} playing at the ${profile.level} level. Ask me about your training, nutrition, or skill development!` }
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
      {/* Header */}
      <div className="p-4 bg-card/80 backdrop-blur-md border-b border-white/5 z-10 flex-shrink-0">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <div className="relative">
            <div className="p-2 bg-primary/20 rounded-full text-primary neon-glow animate-pulse-slow">
              <Bot className="w-6 h-6" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-background"></div>
          </div>
          <div>
            <h1 className="font-heading font-bold text-white text-xl flex items-center gap-2" data-testid="text-coach-title">
              Coach AI <Badge variant="outline" className="text-[10px] border-primary/50 text-primary h-5">GPT-4</Badge>
            </h1>
            <p className="text-xs text-muted-foreground">Powered by OpenAI</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-black/20">
        <div className="max-w-md mx-auto p-4 min-h-full flex flex-col justify-end">
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                data-testid={`message-${msg.role}-${i}`}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-card text-white rounded-tl-none border border-white/10'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start animate-in fade-in duration-300" data-testid="typing-indicator">
                <div className="bg-card text-white rounded-2xl rounded-tl-none border border-white/10 p-4 flex gap-1 items-center h-12">
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
          </div>
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 bg-background border-t border-white/5 pb-24">
        <div className="max-w-md mx-auto">
          <div className="flex gap-2">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about workouts, diet, or skills..." 
              className="bg-secondary border-white/10 focus-visible:ring-primary text-white"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              data-testid="input-chat"
            />
            <Button 
              size="icon" 
              onClick={handleSend} 
              disabled={!input.trim() || isTyping} 
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
              data-testid="button-send"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex justify-center mt-2 gap-2">
            <button 
              onClick={() => setInput("Give me a drill for better hands")} 
              className="text-[10px] text-muted-foreground hover:text-primary transition-colors border border-white/5 rounded-full px-2 py-1"
              data-testid="button-suggestion-1"
            >
              "Better hands drill"
            </button>
            <button 
              onClick={() => setInput("What should I eat before a game?")} 
              className="text-[10px] text-muted-foreground hover:text-primary transition-colors border border-white/5 rounded-full px-2 py-1"
              data-testid="button-suggestion-2"
            >
              "Pre-game meal?"
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNav />
      </div>
    </div>
  );
}
