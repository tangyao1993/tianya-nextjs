'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Post, ChatMessage } from '@/types';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';

interface AIChatProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

export const AIChat: React.FC<AIChatProps> = ({ post, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `你好！我是关于《${post.title}》的伴读助手。你对这篇帖子有什么疑问吗？或者想探讨什么细节？（今日剩余提问次数：3）`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUsageCount(0);
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (usageCount >= 3) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'model',
          text: '您今天的提问次数已用完（3次/天）。请明天再来，或者静心阅读原文体会其中深意。',
          timestamp: Date.now(),
          isError: true
        }
      ]);
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setUsageCount(prev => prev + 1);

    try {
      // 使用 LangChain 处理消息
      const model = new ChatOpenAI({
        modelName: "gpt-3.5-turbo",
        temperature: 0.7,
        openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      });

      const parser = new StringOutputParser();

      const prompt = `你是一个关于天涯神帖《${post.title}》的伴读助手。帖子内容如下：

${post.content.substring(0, 1000)}...

请根据用户的问题，结合帖子的内容进行回答。回答要简洁、准确、有帮助。

用户问题：${input}`;

      const chain = model.pipe(parser);
      const answer = await chain.invoke(prompt);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: answer,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (e) {
      console.error('AI service error:', e);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: '抱歉，AI服务暂时不可用。请检查 API 配置或稍后重试。',
        timestamp: Date.now(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md h-[600px] max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/60">

        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <div>
                <div className="font-bold text-base">伴读助手</div>
                <div className="text-[10px] opacity-90 text-emerald-50">Powered by LangChain</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Limit Info */}
        <div className="bg-emerald-50/80 border-b border-emerald-100 px-4 py-2 text-xs text-emerald-800 flex justify-between items-center">
            <span className="truncate max-w-[200px]">当前: {post.title}</span>
            <span className="bg-white px-2 py-0.5 rounded-full border border-emerald-200 text-emerald-600 font-medium">今日剩余: {Math.max(0, 3 - usageCount)}</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-sm'
                  : msg.isError
                    ? 'bg-red-50 text-red-600 border border-red-100'
                    : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={usageCount >= 3 ? "今日次数已用完" : "输入您的问题..."}
              disabled={isLoading || usageCount >= 3}
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm disabled:bg-slate-50 disabled:text-slate-400 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim() || usageCount >= 3}
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-200 disabled:shadow-none"
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};