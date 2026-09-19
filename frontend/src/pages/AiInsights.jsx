import { useState } from 'react';
import api from '../api/axios';
import { Send, Bot, User } from 'lucide-react';

export default function AiInsights() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your FinSight AI Assistant. How can I help you analyze your finances today?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/chat', { prompt: input });
      const aiMessage = { id: Date.now() + 1, text: data.response, sender: 'ai' };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI chat error", error);
      const errorMessage = { id: Date.now() + 1, text: "Sorry, I'm having trouble connecting right now.", sender: 'ai' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text">AI Financial Assistant</h1>
        <p className="text-sm text-muted-text mt-1">Ask questions about your spending habits, savings, and financial health.</p>
      </div>

      <div className="flex-1 bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-primary ml-3' : 'bg-secondary mr-3'}`}>
                  {msg.sender === 'user' ? <User className="w-5 h-5 text-surface" /> : <Bot className="w-5 h-5 text-surface" />}
                </div>
                <div className={`px-4 py-3 rounded-2xl ${msg.sender === 'user' ? 'bg-primary text-surface rounded-tr-none' : 'bg-background border border-border text-text rounded-tl-none'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex max-w-[80%] flex-row">
                <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-secondary mr-3">
                  <Bot className="w-5 h-5 text-surface" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-background border border-border text-text rounded-tl-none flex space-x-1 items-center">
                  <div className="w-2 h-2 bg-muted-text rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-text rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-muted-text rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-border bg-background">
          <form onSubmit={sendMessage} className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about your expenses..."
              className="flex-1 min-w-0 appearance-none rounded-full border border-border px-4 py-2 text-text bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex items-center justify-center p-2 rounded-full border border-transparent bg-primary text-surface shadow-sm hover:bg-secondary focus:outline-none disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
