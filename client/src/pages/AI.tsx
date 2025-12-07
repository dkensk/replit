import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@/lib/UserContext";

export default function AI() {
  const { profile } = useUser();
  const [messages, setMessages] = useState([
    { role: "system", content: `Hi! I'm Coach AI. I know you're a ${profile.position} playing at the ${profile.level} level. Ask me about your training, nutrition, or skill development!` }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const generateSmartResponse = (query: string) => {
    const lower = query.toLowerCase();
    
    // Workout Logic
    if (lower.includes("workout") || lower.includes("lift") || lower.includes("strength") || lower.includes("gym")) {
      const responses = [
        "Based on your profile, focusing on explosive power is key. Have you tried the 'Legs - Explosive' split yet?",
        "Remember to prioritize form over weight. For a defenseman, strong hips and core are essential for battles in the corners.",
        "Don't skip the warm-up! 10 minutes of dynamic stretching will prevent injury and improve your performance on the ice."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Diet Logic
    if (lower.includes("diet") || lower.includes("food") || lower.includes("eat") || lower.includes("protein") || lower.includes("calor")) {
      const responses = [
        "Nutrition is fuel. Make sure you're hitting that protein target to help your muscles recover after practice.",
        "If you're feeling sluggish on the ice, try increasing your carb intake before games. Oatmeal is a great pre-game meal.",
        "Hydration is just as important as food. Aim for at least 3-4 liters of water a day, especially on training days."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Skills Logic
    if (lower.includes("skill") || lower.includes("hands") || lower.includes("shoot") || lower.includes("skat")) {
      const responses = [
        "For better hands, try the 'Figure 8' stickhandling drill for 10 minutes a day. Consistency is key.",
        "Shooting power comes from the legs and core, not just the arms. Transfer your weight through the stick flex.",
        "Edge work separates good players from great ones. The 'Mohawk Transitions' drill is excellent for mobility."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Default
    const defaults = [
      "That's an interesting point. Could you tell me more about your specific goals for this season?",
      "I'm here to help optimize your training. Try asking about specific drills or meal ideas!",
      "Consistency is the secret to success in hockey. Keep showing up every day."
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsTyping(true);

    // Simulate AI "thinking" time
    setTimeout(() => {
      const response = generateSmartResponse(userMsg);
      setMessages(prev => [...prev, { role: "system", content: response }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-80px)]">
        <div className="p-4 bg-card/80 backdrop-blur-md border-b border-white/5 z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2 bg-primary/20 rounded-full text-primary neon-glow animate-pulse-slow">
                <Bot className="w-6 h-6" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-background"></div>
            </div>
            <div>
              <h1 className="font-heading font-bold text-white text-xl flex items-center gap-2">
                Coach AI <Badge variant="outline" className="text-[10px] border-primary/50 text-primary h-5">BETA</Badge>
              </h1>
              <p className="text-xs text-muted-foreground">Powered by Hockey Intelligence</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4 bg-black/20">
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
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
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="bg-card text-white rounded-2xl rounded-tl-none border border-white/10 p-4 flex gap-1 items-center h-12">
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-4 bg-background border-t border-white/5">
          <div className="flex gap-2">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about workouts, diet, or skills..." 
              className="bg-secondary border-white/10 focus-visible:ring-primary text-white"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button size="icon" onClick={handleSend} disabled={!input.trim() || isTyping} className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex justify-center mt-2 gap-2">
            <button onClick={() => setInput("Give me a drill for better hands")} className="text-[10px] text-muted-foreground hover:text-primary transition-colors border border-white/5 rounded-full px-2 py-1">
              "Better hands drill"
            </button>
            <button onClick={() => setInput("What should I eat before a game?")} className="text-[10px] text-muted-foreground hover:text-primary transition-colors border border-white/5 rounded-full px-2 py-1">
              "Pre-game meal?"
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

import { Badge } from "@/components/ui/badge";
