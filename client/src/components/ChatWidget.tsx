import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: "Hello! Welcome to Harvest Commodities. How can we help you today?", isUser: false }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: inputValue, isUser: true }]);
    const userText = inputValue;
    setInputValue("");

    // Simulate bot response
    setTimeout(() => {
      let response = "Thank you for your message. Our team will get back to you shortly.";
      
      if (userText.toLowerCase().includes("price") || userText.toLowerCase().includes("quote")) {
        response = "For current commodity prices and quotes, please email our trading desk at jericho.ang@theharvestman.com.";
      } else if (userText.toLowerCase().includes("rice") || userText.toLowerCase().includes("sugar")) {
        response = "We offer premium grades of Rice and Sugar. Would you like to see our product specifications?";
      }

      setMessages(prev => [...prev, { text: response, isUser: false }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      <div 
        className={cn(
          "transition-all duration-300 ease-in-out origin-bottom-right",
          isOpen 
            ? "opacity-100 scale-100 translate-y-0 mb-4" 
            : "opacity-0 scale-95 translate-y-10 pointer-events-none h-0 mb-0"
        )}
      >
        <Card className="w-[350px] h-[500px] shadow-2xl border-primary/20 flex flex-col overflow-hidden">
          <CardHeader className="bg-sidebar text-sidebar-foreground p-4 flex flex-row items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-2.5 w-2.5 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-sidebar" />
                <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold border border-primary/30">
                  HC
                </div>
              </div>
              <div>
                <CardTitle className="text-base font-heading tracking-wide">Harvest Support</CardTitle>
                <p className="text-xs text-muted-foreground/80">Online • Typically replies instantly</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground hover:bg-white/10" onClick={() => setIsOpen(false)}>
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 flex flex-col bg-background relative">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "flex w-full",
                    msg.isUser ? "justify-end" : "justify-start"
                  )}
                >
                  <div 
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                      msg.isUser 
                        ? "bg-primary text-primary-foreground rounded-br-none" 
                        : "bg-secondary text-secondary-foreground rounded-bl-none border border-border"
                    )}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-card">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a message..." 
                  className="flex-1 bg-background focus-visible:ring-primary"
                />
                <Button type="submit" size="icon" className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toggle Button */}
      <Button 
        onClick={() => setIsOpen(!isOpen)}
        size="lg" 
        className={cn(
          "h-14 w-14 rounded-full shadow-xl transition-all duration-300 hover:scale-105",
          isOpen ? "bg-destructive hover:bg-destructive/90 rotate-90" : "bg-primary hover:bg-primary/90"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-7 w-7 text-primary-foreground" />
        )}
      </Button>
    </div>
  );
}
