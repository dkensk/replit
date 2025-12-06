import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot } from "lucide-react";
import { useState } from "react";

export default function AI() {
  const [messages, setMessages] = useState([
    { role: "system", content: "Hi! I'm Coach AI. I can help adjust your plan, answer diet questions, or give tips on your skills. What's on your mind?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
    // Mock response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "system", content: "That's a great question. Based on your goal to gain muscle, I'd recommend increasing your protein intake slightly on heavy training days." }]);
    }, 1000);
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-80px)]">
        <div className="p-4 bg-card/80 backdrop-blur-md border-b border-white/5 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-full text-primary neon-glow">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-white text-xl">Coach AI</h1>
              <p className="text-xs text-muted-foreground">Always here to help</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-secondary text-white rounded-tl-none border border-white/5'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 bg-background border-t border-white/5">
          <div className="flex gap-2">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about workouts, diet, or skills..." 
              className="bg-secondary border-white/10 focus-visible:ring-primary"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button size="icon" onClick={handleSend} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
