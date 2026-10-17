import React, { useState, useEffect } from 'react';
import {
  Heart,
  Bookmark,
  Send,
  MapPin,
  Tag,
  Coins,
  Sparkles,
  MessageSquare,
  MessageCircle,
} from 'lucide-react';
import { storage } from '../services/storageService';
import { Post, PostType, UserProfile } from '../types';

interface SocialFeedModuleProps {
  onOpenChatWithUser?: (authorId: string, authorName: string) => void;
}

export const SocialFeedModule: React.FC<SocialFeedModuleProps> = ({ onOpenChatWithUser }) => {
  const [posts, setPosts] = useState<Post[]>(storage.getPosts());
  const [currentUser, setCurrentUser] = useState<UserProfile>(storage.getCurrentUser());
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<PostType>('Chia sẻ sống xanh');
  const [newPostImage, setNewPostImage] = useState('');
  const [newPostLocation, setNewPostLocation] = useState('');
  const [newPostMaterial, setNewPostMaterial] = useState('');
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});

  useEffect(() => {
    const update = () => {
      setPosts(storage.getPosts());
      setCurrentUser(storage.getCurrentUser());
    };
    return storage.subscribe(update);
  }, []);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    storage.createPost({
      content: newPostContent.trim(),
      postType: newPostType,
      images: newPostImage ? [newPostImage] : [],
      location: newPostLocation || currentUser.location || 'TP. Cần Thơ',
      materialType: newPostMaterial || undefined,
    });

    setNewPostContent('');
    setNewPostImage('');
    setNewPostLocation('');
    setNewPostMaterial('');
  };

  const handleLike = (postId: string, emotion: 'greenHeart' | 'thankful' | 'inspiring') => {
    storage.toggleLikePost(postId, emotion);
  };

  const handleSave = (postId: string) => {
    storage.toggleSavePost(postId);
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;
    storage.addComment(postId, text.trim());
    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  const filteredPosts = posts.filter((p) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'saved') return (p.savedBy || []).includes(currentUser.id);
    if (activeFilter === 'give') return p.postType === 'Cho tặng đồ cũ';
    if (activeFilter === 'exchange') return p.postType === 'Trao đổi ve chai';
    if (activeFilter === 'event') return p.postType === 'Tìm người tham gia sự kiện';
    return true;
  });

  return (
    <div className="space-y-6 pb-16 max-w-3xl mx-auto">
      {/* Create Post Box */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-emerald-100 space-y-4">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover border border-emerald-200"
          />
          <div>
            <h3 className="font-bold text-sm text-gray-900">{currentUser.name}</h3>
            <p className="text-[11px] text-emerald-700 font-medium">
              Đăng bài chia sẻ nhận ngay <span className="font-bold text-amber-600 font-mono">+20 EcoPoints</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleCreatePost} className="space-y-3">
          {/* Post Type Selector */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {([
              'Chia sẻ sống xanh',
              'Cho tặng đồ cũ',
              'Trao đổi ve chai',
              'Tìm người tham gia sự kiện',
            ] as PostType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setNewPostType(type)}
                className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
                  newPostType === type
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <textarea
            rows={3}
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder={
              newPostType === 'Cho tặng đồ cũ'
                ? 'Mô tả đồ dùng, sách vở hoặc quần áo bạn muốn tặng lại cho học sinh, sinh viên...'
                : newPostType === 'Trao đổi ve chai'
                ? 'Bạn đang có ve chai gì cần trao đổi hoặc cần hỗ trợ gom vỏ lon, chai nhựa...'
                : newPostType === 'Tìm người tham gia sự kiện'
                ? 'Kêu gọi bạn bè cùng tham gia chiến dịch dọn rác, trồng cây...'
                : 'Chia sẻ câu chuyện, kinh nghiệm phân loại rác hoặc hành động sống xanh hôm nay...'
            }
            className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none transition-all"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <input
              type="text"
              value={newPostLocation}
              onChange={(e) => setNewPostLocation(e.target.value)}
              placeholder="Địa điểm hẹn gặp (VD: Cổng trường THCS Thốt Nốt, Cần Thơ...)"
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="text"
              value={newPostImage}
              onChange={(e) => setNewPostImage(e.target.value)}
              placeholder="Dán link ảnh đồ vật / hoạt động (tùy chọn)"
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Bài viết sẽ đăng ngay lên bảng tin cộng đồng</span>
            </div>
            <button
              type="submit"
              disabled={!newPostContent.trim()}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Đăng bài viết</span>
              <Coins className="w-3.5 h-3.5 text-amber-300" />
            </button>
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
            activeFilter === 'all' ? 'bg-emerald-700 text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'
          }`}
        >
          Tất cả bài viết
        </button>
        <button
          onClick={() => setActiveFilter('give')}
          className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
            activeFilter === 'give' ? 'bg-emerald-700 text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'
          }`}
        >
          Cho tặng đồ cũ ({posts.filter((p) => p.postType === 'Cho tặng đồ cũ').length})
        </button>
        <button
          onClick={() => setActiveFilter('exchange')}
          className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
            activeFilter === 'exchange'
              ? 'bg-emerald-700 text-white'
              : 'bg-white border text-gray-700 hover:bg-gray-50'
          }`}
        >
          Trao đổi ve chai
        </button>
        <button
          onClick={() => setActiveFilter('event')}
          className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
            activeFilter === 'event' ? 'bg-emerald-700 text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'
          }`}
        >
          Tìm đồng đội
        </button>
        <button
          onClick={() => setActiveFilter('saved')}
          className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
            activeFilter === 'saved' ? 'bg-emerald-700 text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'
          }`}
        >
          Đã lưu ({posts.filter((p) => (p.savedBy || []).includes(currentUser.id)).length})
        </button>
      </div>

      {/* Posts Stream */}
      <div className="space-y-5">
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-gray-400 text-xs shadow-xs border border-gray-100">
            Chưa có bài viết nào trong mục này. Hãy là người đầu tiên chia sẻ hành động xanh!
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isLiked = (post.likes || []).includes(currentUser.id);
            const isSaved = (post.savedBy || []).includes(currentUser.id);
            return (
              <div
                key={post.id}
                className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 space-y-4 hover:border-emerald-200 transition-colors"
              >
                {/* Author row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      className="w-10 h-10 rounded-full object-cover border border-emerald-100"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-gray-900">{post.authorName}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            post.postType === 'Cho tặng đồ cũ'
                              ? 'bg-amber-100 text-amber-900'
                              : post.postType === 'Trao đổi ve chai'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {post.postType}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {post.authorSchool || 'Thành viên EcoLoop'} · {post.createdAt}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {post.authorId !== currentUser.id && (
                      <button
                        onClick={() => {
                          if (onOpenChatWithUser && post.authorId && post.authorName) {
                            onOpenChatWithUser(post.authorId, post.authorName);
                          }
                        }}
                        className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full transition-colors flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Nhắn tin</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleSave(post.id)}
                      className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${
                        isSaved ? 'text-amber-500 fill-amber-500' : 'text-gray-400'
                      }`}
                      title="Lưu bài viết"
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <p className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                {/* Location / Material tags */}
                {(post.location || post.materialType) && (
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    {post.location && (
                      <span className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{post.location}</span>
                      </span>
                    )}
                    {post.materialType && (
                      <span className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                        <Tag className="w-3.5 h-3.5 text-teal-600" />
                        <span>{post.materialType}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Images */}
                {post.images && post.images.length > 0 && (
                  <div className="rounded-2xl overflow-hidden max-h-80 bg-gray-100 border border-gray-100">
                    {post.images.map((img, idx) => (
                      <img key={idx} src={img} alt="Hình ảnh bài viết" className="w-full h-full object-cover" />
                    ))}
                  </div>
                )}

                {/* Reactions & Stats Bar */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleLike(post.id, 'greenHeart')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-colors ${
                        isLiked ? 'bg-emerald-100 text-emerald-800 font-bold' : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-emerald-600 text-emerald-600' : ''}`} />
                      <span>{post.emotions?.greenHeart || 0} Tim xanh</span>
                    </button>
                    <button
                      onClick={() => handleLike(post.id, 'thankful')}
                      className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                      <span>🙏 {post.emotions?.thankful || 0} Cảm ơn</span>
                    </button>
                    <button
                      onClick={() => handleLike(post.id, 'inspiring')}
                      className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                      <span>💡 {post.emotions?.inspiring || 0} Ý tưởng</span>
                    </button>
                  </div>

                  <span className="text-gray-400 text-xs flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {post.comments.length} bình luận
                  </span>
                </div>

                {/* Comments List */}
                {post.comments.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-gray-50 bg-gray-50/50 p-3 rounded-2xl">
                    {post.comments.map((cmt) => (
                      <div key={cmt.id} className="flex items-start gap-2.5 text-xs">
                        <img
                          src={cmt.authorAvatar}
                          alt={cmt.authorName}
                          className="w-6 h-6 rounded-full object-cover mt-0.5"
                        />
                        <div className="bg-white p-2.5 rounded-2xl shadow-2xs flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900">{cmt.authorName}</span>
                            <span className="text-[10px] text-gray-400">{cmt.createdAt}</span>
                          </div>
                          <p className="text-gray-700 mt-0.5">{cmt.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add comment input */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={commentInputs[post.id] || ''}
                    onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                    placeholder="Viết bình luận hoặc nhắn gửi..."
                    className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    className="p-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
