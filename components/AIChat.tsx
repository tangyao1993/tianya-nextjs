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

type AnalysisType = 'summary' | 'key_points' | 'background' | 'analysis' | 'prediction';

const analysisOptions: Record<AnalysisType, { label: string; prompt: string }> = {
  summary: { label: '内容摘要', prompt: '请为这篇帖子写一份200-300字的摘要' },
  key_points: { label: '核心要点', prompt: '请提炼出这篇帖子的3-5个核心要点' },
  background: { label: '时代背景', prompt: '请分析这篇帖子产生的历史背景和社会环境' },
  analysis: { label: '深度分析', prompt: '请深入分析这篇帖子的观点和逻辑' },
  prediction: { label: '预测验证', prompt: '请分析这篇帖子中的预测性内容' }
};

export const AIChat: React.FC<AIChatProps> = ({ post, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `你好！我是关于《${post.title}》的伴读助手。

你可以：
• 直接向我提问关于这篇帖子的内容
• 点击下方快捷解读按钮，获取AI生成的专业分析

（今日剩余提问次数：3）`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // 从 localStorage 读取今日使用次数
      const today = new Date().toDateString();
      const stored = localStorage.getItem(`ai_usage_${today}`);
      setUsageCount(stored ? parseInt(stored) : 0);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const updateUsageCount = () => {
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    const today = new Date().toDateString();
    localStorage.setItem(`ai_usage_${today}`, newCount.toString());
  };

  const handleQuickAnalysis = async (type: AnalysisType) => {
    if (isLoading) return;

    const option = analysisOptions[type];
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: `📊 快捷解读：${option.label}`,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API Key 未配置');
      }

      const model = new ChatOpenAI({
        modelName: 'gpt-3.5-turbo',
        temperature: 0.7,
        openAIApiKey: apiKey,
      });

      const parser = new StringOutputParser();

      // 使用 content_text 或 content
      const postContent = post.content_text || post.content || '';
      const contentForAnalysis = postContent.substring(0, 3000);

      const prompt = `你是一个专业的文学和社会分析助手。

${option.prompt}

帖子标题：《${post.title}》${post.author ? `，作者：${post.author}` : ''}${post.category ? `，分类：${post.category}` : ''}

帖子内容：
${contentForAnalysis}

请用中文回答，格式清晰，内容专业，分点列出。`;

      const chain = model.pipe(parser);
      const answer = await chain.invoke(prompt);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: answer,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMessage]);
      updateUsageCount();
    } catch (e: any) {
      console.error('AI service error:', e);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: `抱歉，AI服务调用失败：${e.message || '未知错误'}`,
        timestamp: Date.now(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

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

    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API Key 未配置');
      }

      const model = new ChatOpenAI({
        modelName: 'gpt-3.5-turbo',
        temperature: 0.7,
        openAIApiKey: apiKey,
      });

      const parser = new StringOutputParser();

      // 使用 content_text 或 content
      const postContent = post.content_text || post.content || '';
      const contentForChat = postContent.substring(0, 2000);

      const prompt = `你是一个关于天涯神帖《${post.title}》的伴读助手。帖子内容如下：

标题：${post.title}
${post.author ? `作者：${post.author}` : ''}
${post.category ? `分类：${post.category}` : ''}

内容摘要：
${contentForChat}...

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
      updateUsageCount();
    } catch (e: any) {
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
      <div className="bg-white w-full max-w-md h-[700px] max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/60">

        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <div>
                <div className="font-bold text-base">伴读助手</div>
                <div className="text-[10px] opacity-90 text-emerald-50">AI解读 · 智能问答</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Limit Info */}
        <div className="bg-emerald-50/80 border-b border-emerald-100 px-4 py-2 text-xs text-emerald-800 flex justify-between items-center">
            <span className="truncate max-w-[200px]">{post.title}</span>
            <span className="bg-white px-2 py-0.5 rounded-full border border-emerald-200 text-emerald-600 font-medium">今日剩余: {Math.max(0, 3 - usageCount)}</span>
        </div>

        {/* Quick Analysis Buttons */}
        <div className="p-3 bg-slate-50 border-b border-slate-100">
          <div className="text-xs text-slate-500 mb-2 px-1">📊 快捷解读（消耗1次提问）</div>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(analysisOptions) as [AnalysisType, typeof analysisOptions[keyof typeof analysisOptions]][]).slice(0, 3).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => handleQuickAnalysis(key)}
                disabled={isLoading || usageCount >= 3}
                className="px-3 py-2 bg-white border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {(Object.entries(analysisOptions) as [AnalysisType, typeof analysisOptions[keyof typeof analysisOptions]][]).slice(3).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => handleQuickAnalysis(key)}
                disabled={isLoading || usageCount >= 3}
                className="px-3 py-2 bg-white border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {label}
              </button>
            ))}
          </div>
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
                {msg.text.split('\n').map((line, idx) => (
                  <p key={idx} className={line.trim() ? 'mb-1' : 'mb-2'}>{line || '\u00A0'}</p>
                ))}
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
