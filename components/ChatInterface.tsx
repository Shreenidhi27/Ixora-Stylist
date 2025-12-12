import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UserProfile } from '../types';
import { chatWithIxora } from '../services/geminiService';
import { Send, Sparkles } from 'lucide-react';
import OutfitCard from './OutfitCard';

interface Props {
  userProfile: UserProfile;
}

const ChatInterface: React.FC<Props> = ({ userProfile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello ${userProfile.name}. I'm Ixora. How are you feeling today? I can help you style a look for an upcoming event or just refresh your daily vibe.`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatWithIxora(messages, userProfile, input);
      
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        outfit: response.outfit,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] lg:max-w-[70%] rounded-2xl p-4 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-stone-800 text-white rounded-br-none'
                  : 'bg-white text-stone-800 border border-stone-100 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              {msg.outfit && (
                <div className="mt-4">
                  <OutfitCard outfit={msg.outfit} />
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-none p-4 shadow-sm border border-stone-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-500 animate-spin" />
              <span className="text-stone-500 text-sm italic">Ixora is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-[60px] md:bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 md:pl-24 lg:pl-64">
        <div className="max-w-4xl mx-auto relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for outfit advice..."
            className="flex-1 bg-stone-100 border-none rounded-full py-3 px-5 focus:ring-2 focus:ring-rose-300 outline-none text-stone-800"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white p-3 rounded-full transition-colors shadow-md"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;