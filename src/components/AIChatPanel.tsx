import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, HelpCircle, Code2, ShieldAlert } from 'lucide-react';
import { ChatMessage, AnalysisResult } from '../types/debug';
import { sendChatMessage } from '../services/gemini/chat';

interface AIChatPanelProps {
  analysisResult?: AnalysisResult;
  chatHistory: ChatMessage[];
  onUpdateHistory: (messages: ChatMessage[]) => void;
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({
  analysisResult,
  chatHistory,
  onUpdateHistory,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickPrompts = [
    "Explain like I'm a beginner",
    "Show me another solution",
    "Why does this happen?",
    "Can you optimize the fix?",
    "Write a test for this"
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...chatHistory, userMsg];
    onUpdateHistory(newHistory);
    setInputMessage('');
    setIsTyping(true);

    try {
      const responseText = await sendChatMessage(text, newHistory, analysisResult);
      const assistantMsg: ChatMessage = {
        id: 'msg-assistant-' + Date.now(),
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      onUpdateHistory([...newHistory, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-900 border-l border-white/10 w-full lg:w-96 shrink-0">
      
      {/* Panel Header */}
      <div className="p-4 border-b border-white/10 bg-dark-850 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide">HELPING HAND AI</h3>
            <div className="text-[10px] text-brand-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Session Context Loaded</span>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 bg-dark-950/40 border-b border-white/5 flex gap-1.5 overflow-x-auto text-[11px]">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 rounded-lg bg-dark-800 border border-white/10 text-slate-300 hover:text-white hover:border-brand-500/40 shrink-0 transition-all text-[11px]"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Conversation Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {chatHistory.length === 0 ? (
          <div className="text-center py-10 text-slate-400 space-y-3">
            <Bot className="w-8 h-8 text-brand-400 mx-auto opacity-60" />
            <p className="text-xs">Ask questions about your error, request alternative code solutions, or generate unit tests.</p>
          </div>
        ) : (
          chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-6 h-6 rounded-md bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3 space-y-1 ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-br-none'
                    : 'bg-dark-800 border border-white/10 text-slate-200 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed font-sans">{msg.text}</div>
                <div className="text-[9px] text-slate-400 text-right font-mono">{msg.timestamp}</div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-6 h-6 rounded-md bg-slate-700 flex items-center justify-center text-white shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))
        )}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-brand-400 font-mono italic animate-pulse">
            <Bot className="w-4 h-4" />
            <span>Helping Hand AI is analyzing...</span>
          </div>
        )}
      </div>

      {/* Chat Input Area */}
      <div className="p-3 border-t border-white/10 bg-dark-850">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask Helping Hand AI a question..."
            className="flex-1 rounded-xl bg-dark-900 border border-white/10 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500 placeholder:text-slate-600"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="p-2 rounded-xl bg-brand-600 text-white disabled:opacity-40 hover:bg-brand-500 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
