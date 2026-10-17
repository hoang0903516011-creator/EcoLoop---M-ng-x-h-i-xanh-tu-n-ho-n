import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Bookmark,
  Clock,
  X,
} from 'lucide-react';
import { storage } from '../services/storageService';
import { Article, UserProfile } from '../types';

export const LibraryModule: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>(storage.getArticles());
  const [currentUser, setCurrentUser] = useState<UserProfile>(storage.getCurrentUser());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);

  useEffect(() => {
    const update = () => {
      setArticles(storage.getArticles());
      setCurrentUser(storage.getCurrentUser());
    };
    return storage.subscribe(update);
  }, []);

  const handleToggleSave = (articleId: string) => {
    storage.toggleSaveArticle(articleId);
  };

  const categories = [
    'all',
    'Phân loại rác',
    'Tái chế DIY',
    'Kinh tế tuần hoàn',
  ];

  const filteredArticles = articles.filter((art) => {
    const matchesCat = selectedCategory === 'all' || art.category === selectedCategory;
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-emerald-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-emerald-600" />
              <span>Thư Viện Xanh & Cẩm Nang Tái Chế</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Kiến thức phân loại rác theo Luật BVMT 2020, giải pháp tái chế DIY và mô hình kinh tế tuần hoàn
            </p>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm cẩm nang phân loại rác, hướng dẫn tái chế pin cũ, chai nhựa..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedCategory === c
                    ? 'bg-emerald-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {c === 'all' ? 'Tất cả' : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((art) => {
          const isSaved = art.savedBy.includes(currentUser.id);
          return (
            <div
              key={art.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-emerald-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {art.category}
                  </span>
                  <button
                    onClick={() => handleToggleSave(art.id)}
                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-700 hover:text-amber-500 transition-colors"
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>
                </div>
                <div className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>{art.author}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {art.readTime}
                    </span>
                  </div>
                  <h3
                    onClick={() => setReadingArticle(art)}
                    className="font-bold text-sm text-gray-900 leading-snug cursor-pointer group-hover:text-emerald-700 transition-colors"
                  >
                    {art.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                    {art.summary}
                  </p>
                </div>
              </div>
              <div className="p-5 pt-0 border-t border-gray-50 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">{art.publishedAt}</span>
                <button
                  onClick={() => setReadingArticle(art)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
                >
                  Đọc cẩm nang
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reading Article Modal */}
      {readingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="relative h-56">
              <img
                src={readingArticle.image}
                alt={readingArticle.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setReadingArticle(null)}
                className="absolute top-4 right-4 p-2 bg-black/60 text-white hover:bg-black/80 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="absolute bottom-4 left-4 bg-emerald-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">
                {readingArticle.category}
              </span>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>Tác giả: {readingArticle.author}</span>
                  <span>{readingArticle.publishedAt} · {readingArticle.readTime}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 leading-snug">
                  {readingArticle.title}
                </h2>
              </div>
              <p className="text-xs font-semibold text-emerald-900 bg-emerald-50 p-3.5 rounded-2xl leading-relaxed border border-emerald-100">
                {readingArticle.summary}
              </p>
              <div className="text-xs text-gray-700 leading-relaxed space-y-3 whitespace-pre-line">
                {Array.isArray(readingArticle.content)
                  ? readingArticle.content.join('\n\n')
                  : readingArticle.content}
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleSave(readingArticle.id)}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>
                    {readingArticle.savedBy.includes(currentUser.id) ? 'Đã lưu cẩm nang' : 'Lưu vào danh sách'}
                  </span>
                </button>
                <button
                  onClick={() => {
                    storage.addEcoPoints(5, 'Đọc cẩm nang thư viện xanh', 'Tích lũy kiến thức môi trường');
                    setReadingArticle(null);
                  }}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Đã đọc xong (+5 pts)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
