'use client';

import React, { useState, useEffect } from 'react';
import { Post, ViewState } from '@/types';
import { Header, Footer } from '@/components/Layout';
import { AIChat } from '@/components/AIChat';
import { marked } from 'marked';

// Category Badge Component
const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  const colors: Record<string, string> = {
    '煮酒论史': 'bg-amber-100 text-amber-800 border-amber-200',
    '莲蓬鬼话': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    '房产观澜': 'bg-sky-100 text-sky-800 border-sky-200',
    '天涯杂谈': 'bg-slate-100 text-slate-700 border-slate-200',
    '情感天地': 'bg-rose-100 text-rose-800 border-rose-200',
    '职场天地': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    '经济专栏': 'bg-orange-100 text-orange-800 border-orange-200',
    '国学经典': 'bg-purple-100 text-purple-800 border-purple-200',
  };
  const colorClass = colors[category] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`text-[11px] px-2.5 py-1 rounded-md border ${colorClass} font-medium tracking-wide`}>
      {category}
    </span>
  );
};

// Markdown 渲染组件
const MarkdownContent: React.FC<{ content: string }> = ({ content }) => {
  const [html, setHtml] = useState('');

  useEffect(() => {
    // 配置 marked
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
    setHtml(marked(content) as string);
  }, [content]);

  return (
    <div
      className="prose prose-slate max-w-none prose-headings:font-serif prose-p:text-lg prose-p:leading-loose prose-p:text-justify"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

// Home View Component
const HomeView: React.FC<{ onSelectPost: (post: Post) => void }> = ({ onSelectPost }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<string[]>(['全部']);
  const [filter, setFilter] = useState('全部');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // 获取分类
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCategories(['全部', ...data.data]);
        }
      })
      .catch(err => console.error('获取分类失败:', err));
  }, []);

  // 获取帖子列表
  useEffect(() => {
    setLoading(true);
    setError(null);

    const categoryParam = filter === '全部' ? '' : `?category=${encodeURIComponent(filter)}`;
    fetch(`/api/posts${categoryParam}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPosts(data.data);
        } else {
          setError(data.error || '获取数据失败');
        }
      })
      .catch(err => {
        console.error('获取帖子失败:', err);
        setError('获取数据失败，请稍后重试');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filter]);

  if (loading) {
    return (
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mb-4"></div>
          <p className="text-slate-500">加载中...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="text-center py-20">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            重新加载
          </button>
        </div>
      </main>
    );
  }

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
        {posts.map(post => (
          <div
            key={post.id}
            onClick={() => onSelectPost(post)}
            className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-xl hover:shadow-sky-100/50 hover:-translate-y-1 transition-all duration-300 border border-slate-200 hover:border-sky-200 cursor-pointer flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-4">
              {post.category && <CategoryBadge category={post.category} />}
              <span className="text-xs text-slate-400 font-mono">
                {post.date || new Date(post.created_at).toLocaleDateString('zh-CN')}
              </span>
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
                   {post.author ? post.author.charAt(0) : '?'}
                </div>
                <span className="font-medium text-slate-600">{post.author || '佚名'}</span>
              </div>
              <div className="flex items-center gap-3">
                 <span className="flex items-center gap-1">
                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                   {post.view_count ? (post.view_count / 10000).toFixed(1) + '万' : '0'}
                 </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          暂无该分类的帖子
        </div>
      )}
    </main>
  );
};

// Detail View Component
const DetailView: React.FC<{ postId: string; onBack: () => void }> = ({ postId, onBack }) => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/posts/${postId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const postData = data.data;
          // 解析 tags JSON 字符串
          if (typeof postData.tags === 'string') {
            try {
              postData.tags = JSON.parse(postData.tags);
            } catch {
              postData.tags = [];
            }
          }
          setPost(postData);
        } else {
          setError(data.error || '获取数据失败');
        }
      })
      .catch(err => {
        console.error('获取帖子详情失败:', err);
        setError('获取数据失败，请稍后重试');
      })
      .finally(() => {
        setLoading(false);
      });

    window.scrollTo(0, 0);
  }, [postId]);

  if (loading) {
    return (
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mb-4"></div>
          <p className="text-slate-500">加载中...</p>
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="text-center py-20">
          <p className="text-red-500 mb-4">{error || '帖子不存在'}</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            返回首页
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full relative">
      <article className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-20">
        {/* Post Header */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/30">
          {post.category && (
            <div className="flex items-center gap-3 mb-5">
              <CategoryBadge category={post.category} />
              <span className="text-sm text-slate-400 font-mono">
                {post.date || new Date(post.created_at).toLocaleDateString('zh-CN')}
              </span>
            </div>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 leading-tight font-serif">
            {post.title}
          </h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-sm">
                {post.author ? post.author.charAt(0) : '?'}
              </div>
              <span className="text-sm font-medium text-slate-700">{post.author || '佚名'}</span>
            </div>
            <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              浏览：{(post.view_count || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="p-8 md:p-12">
          {post.content ? (
            <MarkdownContent content={post.content} />
          ) : (
            <div className="prose prose-slate max-w-none text-slate-700 leading-loose">
              {post.content_text?.split('\n').map((para, idx) => (
                para.trim() ? <p key={idx} className="mb-6 text-justify indent-8 text-lg">{para}</p> : <br key={idx} />
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="px-8 pb-6">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
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

      {/* Back Button */}
      <div className="mb-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-sky-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回列表
        </button>
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
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const handleSelectPost = (post: Post) => {
    setSelectedPostId(post.id);
    setViewState(ViewState.DETAIL);
  };

  const handleNavigateHome = () => {
    setViewState(ViewState.HOME);
    setSelectedPostId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-sky-100 selection:text-sky-900">
      <Header onNavigateHome={handleNavigateHome} currentView={viewState} />

      {viewState === ViewState.HOME && (
        <HomeView onSelectPost={handleSelectPost} />
      )}

      {viewState === ViewState.DETAIL && selectedPostId && (
        <DetailView postId={selectedPostId} onBack={handleNavigateHome} />
      )}

      <Footer />
    </div>
  );
}
