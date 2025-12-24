'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ViewState } from '@/types';

interface HeaderProps {
  onNavigateHome: () => void;
  currentView: ViewState;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateHome, currentView }) => {
  const [visits, setVisits] = useState(0);
  const [online, setOnline] = useState(0);

  useEffect(() => {
    // Initialize with some random values
    setVisits(1256789);
    setOnline(186);

    const interval = setInterval(() => {
      // Fluctuate online users slightly
      setOnline(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return Math.max(100, prev + change);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={onNavigateHome}
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-serif font-bold text-lg shadow-md group-hover:shadow-sky-200 group-hover:scale-105 transition-all duration-300">
              天
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-wide group-hover:text-sky-700 transition-colors">
              天涯<span className="text-sky-600">遗珠</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/mineru-test"
              className="text-xs font-semibold text-slate-600 border border-slate-200 px-3 py-1 rounded-full hover:border-sky-300 hover:text-sky-700 hover:bg-sky-50 transition-colors"
            >
              MinerU 测试
            </Link>
            <div className="hidden md:flex items-center space-x-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>在线: {online}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-md border border-slate-100">
                 <span>总访问: {visits.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-auto py-10">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="mb-4">
           <span className="font-serif text-slate-400 text-lg">天涯遗珠</span>
        </div>
        <p className="text-slate-400 text-sm mb-2">
          © 2024 - 致敬互联网黄金时代
        </p>
        <p className="text-slate-300 text-xs">
          本站内容源自网络收集，仅供学习交流，AI回答仅供参考。
        </p>
      </div>
    </footer>
  );
};
