import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const AIChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: 'Bonjour ! Je suis l’assistant virtuel de l’Africa Pool & Spa Expo 2026. Je suis ici pour répondre à toutes vos questions concernant l’organisation, l’accès, les exposants, ou pour vous aider à réserver votre stand ou badge.'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    // Append user message
    const userMsg: ChatMessage = { role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    setErrorStatus(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmed,
          history: messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Une erreur est survenue lors de la communication.');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'model', text: data.text }]);
    } catch (err: any) {
      console.error(err);
      setErrorStatus("Erreur de connexion. Il se peut que la clé API Gemini soit en cours de configuration.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const quickPrompts = [
    "Dates de l'Exposition ?",
    "Où se trouve l'OFEC ?",
    "Comment réserver un stand ?",
    "Puis-je avoir un badge gratuit ?"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[2000]" id="ai-chat-assistant-container">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3.5 bg-gradient-to-r from-gold via-gold-light to-gold text-navy font-bold rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 group ring-4 ring-gold/15"
          title="Consulter l'Assistant IA"
          id="ai-assistant-fab"
        >
          <Sparkles className="h-5 w-5 animate-pulse text-navy" />
          <span className="text-xs uppercase tracking-wider font-extrabold pr-0.5">Demander à l'IA</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-navy opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-navy"></span>
          </span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div 
          className="w-[360px] sm:w-[400px] h-[550px] bg-[#051025] border-2 border-gold/40 rounded-2xl shadow-3xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300"
          id="ai-chat-window"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-navy to-[#050f22] border-b border-gold/35 px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-white text-xs font-bold font-sans uppercase tracking-wider flex items-center gap-1.5">
                  Copilote IA de l'Expo
                </h4>
                <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                  Alimenté par Gemini 3.5
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-1.5 hover:bg-white/5 rounded-full transition-colors"
              id="ai-close-chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 font-sans bg-[#020918]">
            {messages.map((msg, index) => (
              <div 
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gold text-navy font-medium rounded-tr-none'
                      : 'bg-navy border border-white/10 text-gray-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-navy border border-white/10 text-gray-400 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                  <span>L'assistant réfléchit...</span>
                </div>
              </div>
            )}

            {errorStatus && (
              <div className="p-3 bg-red-950/40 border border-red-800/40 rounded-xl flex items-start gap-2 text-[11px] text-red-300">
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p>{errorStatus}</p>
                  <button 
                    onClick={() => handleSendMessage(messages[messages.length - 1]?.text || 'Bonjour')}
                    className="mt-1 font-bold text-gold underline block hover:text-white"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Panel */}
          {messages.length === 1 && (
            <div className="px-4 py-2 border-t border-white/5 bg-[#030d22]">
              <span className="text-[9px] uppercase tracking-wider font-bold text-gold/60 block mb-1.5">Suggestions :</span>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-[10px] bg-white/5 hover:bg-gold/15 text-gray-300 border border-white/10 hover:border-gold/30 rounded-lg px-2.5 py-1 text-left transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer Input Area */}
          <form 
            onSubmit={handleFormSubmit}
            className="p-3.5 border-t border-gold/25 bg-[#051025] flex items-center gap-2"
          >
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Écrivez votre message..."
              disabled={isLoading}
              className="flex-1 bg-[#020a1a] border border-white/10 text-white placeholder-gray-500 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-gold/60"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="h-8.5 w-8.5 bg-gold hover:bg-gold-light disabled:bg-gray-800 disabled:text-gray-500 text-navy font-bold rounded-xl flex items-center justify-center transition-colors shadow-md"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
