'use client';

import React, { useState } from 'react';
import { Post, ViewState } from '@/types';
import { MOCK_POSTS } from '@/data/posts';
import { Header, Footer } from '@/components/Layout';
import { AIChat } from '@/components/AIChat';

// Category Badge Component
const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  const colors: Record<string, string> = {
    '煮酒论史': 'bg-amber-100 text-amber-800 border-amber-200',
    '莲蓬鬼话': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    '房产观澜': 'bg-sky-100 text-sky-800 border-sky-200',
    '天涯杂谈': 'bg-slate-100 text-slate-700 border-slate-200',
    '情感天地': 'bg-rose-100 text-rose-800 border-rose-200',
    '职场天地': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  };
  const colorClass = colors[category] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`text-[11px] px-2.5 py-1 rounded-md border ${colorClass} font-medium tracking-wide`}>
      {category}
    </span>
  );
};

// Home View Component
const HomeView: React.FC<{ onSelectPost: (post: Post) => void }> = ({ onSelectPost }) => {
  const [filter, setFilter] = useState('全部');
  const categories = ['全部', ...Array.from(new Set(MOCK_POSTS.map(p => p.category)))];

  const filteredPosts = filter === '全部'
    ? MOCK_POSTS
    : MOCK_POSTS.filter(p => p.category === filter);

  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Hero Section */}
      <div className="mb-14 text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 tracking-tight">
          重温<span className="text-sky-600 relative inline-block mx-2 after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-1 after:bg-sky-200 after:-z-10">天涯</span>神帖
        </h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          收录互联网早期的思想遗珠。无论是历史宏大叙事，还是现实深刻剖析，这里都有你想要的答案。
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
              filter === cat
                ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-200'
                : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map(post => (
          <div
            key={post.id}
            onClick={() => onSelectPost(post)}
            className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-xl hover:shadow-sky-100/50 hover:-translate-y-1 transition-all duration-300 border border-slate-200 hover:border-sky-200 cursor-pointer flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-4">
              <CategoryBadge category={post.category} />
              <span className="text-xs text-slate-400 font-mono">{post.date}</span>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-3 group-hover:text-sky-700 transition-colors line-clamp-2 leading-snug">
              {post.title}
            </h3>

            <p className="text-slate-500 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">
              {post.summary}
            </p>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[10px]">
                   {post.author.charAt(0)}
                </div>
                <span className="font-medium text-slate-600">{post.author}</span>
              </div>
              <div className="flex items-center gap-3">
                 <span className="flex items-center gap-1">
                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                   {(post.views / 10000).toFixed(1)}万
                 </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          暂无该分类的帖子
        </div>
      )}
    </main>
  );
};

// Detail View Component
const DetailView: React.FC<{ post: Post }> = ({ post }) => {
  const [showChat, setShowChat] = useState(false);

  // Scroll to top on mount
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [post.id]);

  return (
    <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full relative">
      <article className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-20">
        {/* Post Header */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/30">
          <div className="flex items-center gap-3 mb-5">
            <CategoryBadge category={post.category} />
            <span className="text-sm text-slate-400 font-mono">{post.date}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 leading-tight font-serif">
            {post.title}
          </h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-sm">
                {post.author.charAt(0)}
              </div>
              <span className="text-sm font-medium text-slate-700">{post.author}</span>
            </div>
            <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              浏览：{(post.views).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="p-8 md:p-12 prose prose-slate max-w-none text-slate-700 leading-loose">
          {post.content.split('\n').map((para, idx) => (
            para.trim() ? <p key={idx} className="mb-6 text-justify indent-8 text-lg">{para}</p> : <br key={idx} />
          ))}
        </div>

      </article>

      {/* Sticky Action Button */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center z-20 pointer-events-none">
        <button
          onClick={() => setShowChat(true)}
          className="pointer-events-auto bg-gradient-to-r from-emerald-500 to-teal-600 text-white pl-5 pr-6 py-3.5 rounded-full shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-200 hover:scale-105 transition-all duration-300 flex items-center gap-2.5 font-medium border border-white/20"
        >
          <div className="bg-white/20 p-1 rounded-full">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <span>向 AI 提问</span>
        </button>
      </div>

      {/* Recommended Section */}
      <div className="mb-12">
        <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
           <span className="w-1 h-5 bg-sky-500 rounded-full"></span>
           相关推荐
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MOCK_POSTS.filter(p => p.id !== post.id).slice(0, 2).map(p => (
            <div key={p.id} className="p-5 bg-white rounded-xl border border-slate-200 text-slate-600 hover:border-sky-300 hover:shadow-sm transition-all cursor-not-allowed opacity-60">
              <span className="font-bold block mb-2 text-slate-800 line-clamp-1">{p.title}</span>
              <span className="text-xs text-slate-400 block">（正在阅读当前帖子，需返回主页切换）</span>
            </div>
          ))}
        </div>
      </div>

      <AIChat
        post={post}
        isOpen={showChat}
        onClose={() => setShowChat(false)}
      />
    </main>
  );
};

// Main App
export default function Home() {
  const [viewState, setViewState] = useState<ViewState>(ViewState.HOME);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const handleSelectPost = (post: Post) => {
    setSelectedPost(post);
    setViewState(ViewState.DETAIL);
  };

  const handleNavigateHome = () => {
    setViewState(ViewState.HOME);
    setSelectedPost(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-sky-100 selection:text-sky-900">
      <Header onNavigateHome={handleNavigateHome} currentView={viewState} />

      {viewState === ViewState.HOME && (
        <HomeView onSelectPost={handleSelectPost} />
      )}

      {viewState === ViewState.DETAIL && selectedPost && (
        <DetailView post={selectedPost} />
      )}

      <Footer />
    </div>
  );
}