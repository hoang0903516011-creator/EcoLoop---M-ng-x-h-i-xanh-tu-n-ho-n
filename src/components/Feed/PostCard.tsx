import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Sparkles,
  MapPin,
  CheckCircle,
  Send,
  MoreHorizontal,
  Award,
  Shield,
  Users,
  User,
  Recycle,
  CornerDownRight,
  Clock,
  Check,
  X,
  Trash2,
  Pin,
  AlertCircle,
} from 'lucide-react';
import { Post, UserProfile, CommentItem, CommentReply } from '../../types';

interface PostCardProps {
  post: Post;
  currentUser: UserProfile;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, content: string, parentCommentId?: string) => void;
  onSharePost: (postId: string) => void;
  onApprovePost?: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
  onPinPost?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onLikePost,
  onAddComment,
  onSharePost,
  onApprovePost,
  onDeletePost,
  onPinPost,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(post.id, newCommentText.trim());
    setNewCommentText('');
    setShowComments(true);
  };

  const handleSendReply = (parentCommentId: string) => {
    if (!replyText.trim()) return;
    onAddComment(post.id, replyText.trim(), parentCommentId);
    setReplyText('');
    setReplyingToCommentId(null);
  };

  const handleShareClick = () => {
    onSharePost(post.id);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const getRoleBadge = (role: string, badgeName?: string) => {
    switch (role) {
      case 'organization':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            <Users className="w-3 h-3" />
            <span>{badgeName || 'CLB Môi Trường Xác Thực'}</span>
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            <Shield className="w-3 h-3" />
            <span>Quản Trị Viên</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <User className="w-3 h-3" />
            <span>{badgeName || 'Chiến Binh Xanh'}</span>
          </span>
        );
    }
  };

  const isPending = post.status === 'pending';
  const isAdmin = currentUser.role === 'admin';

  return (
    <article
      className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md ${
        isPending ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-gray-100'
      }`}
    >
      {/* Pending Moderation Banner */}
      {isPending && (
        <div className="bg-amber-500 text-white px-5 py-2 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 animate-spin" />
            Bài viết đang ở trạng thái: CHỜ BAN QUẢN TRỊ DUYỆT
          </span>
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onApprovePost?.(post.id)}
                className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                Duyệt bài ngay
              </button>
              <button
                onClick={() => onDeletePost?.(post.id)}
                className="px-2.5 py-1 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs"
              >
                <X className="w-3.5 h-3.5" />
                Từ chối
              </button>
            </div>
          ) : (
            <span className="text-[11px] font-normal opacity-90">Chỉ hiển thị với bạn</span>
          )}
        </div>
      )}

      {/* Post Header */}
      <div className="p-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-11 h-11 rounded-2xl object-cover ring-2 ring-emerald-500/10"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base hover:text-emerald-700 transition-colors cursor-pointer">
                {post.author.name}
              </h3>
              {getRoleBadge(post.author.role, post.author.roleBadge)}
              {post.isPinned && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white flex items-center gap-0.5">
                  <Pin className="w-3 h-3" /> Ghim
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
              <span>{post.createdAt}</span>
              {post.location && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    {post.location}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right side controls: Topic Tag & Admin actions */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 shrink-0">
            {post.topicTag}
          </span>

          {isAdmin && (
            <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
              <button
                onClick={() => onPinPost?.(post.id)}
                className={`p-1.5 rounded-lg text-xs font-semibold ${
                  post.isPinned
                    ? 'bg-amber-100 text-amber-800'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                }`}
                title="Ghim bài viết"
              >
                <Pin className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDeletePost?.(post.id)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Xóa bài viết"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="px-5 pb-3">
        <p className="text-sm sm:text-base text-gray-800 leading-relaxed whitespace-pre-line">
          {post.content}
        </p>
      </div>

      {/* Attached EcoBot Scan Card if present */}
      {post.attachedScanResult && (
        <div className="mx-5 mb-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Recycle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Kết quả quét rác từ EcoBot: {post.attachedScanResult.totalItems} vật thể</span>
              </div>
              <p className="text-xs text-emerald-700 mt-0.5">
                Vật phẩm: {post.attachedScanResult.itemLabels.join(', ')} • Tái chế:{' '}
                {post.attachedScanResult.recyclableRatio}%
              </p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-xl bg-emerald-700 text-white text-xs font-bold shrink-0">
            +{post.attachedScanResult.totalPoints} Điểm
          </div>
        </div>
      )}

      {/* Post Images Gallery */}
      {post.images && post.images.length > 0 && (
        <div
          className={`grid gap-1 px-5 pb-4 ${
            post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          }`}
        >
          {post.images.map((img, idx) => (
            <div key={idx} className="rounded-2xl overflow-hidden aspect-video bg-gray-100">
              <img
                src={img}
                alt="Hình ảnh bài đăng"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      )}

      {/* Interaction Bar */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm text-gray-600">
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => onLikePost(post.id)}
            className={`flex items-center gap-1.5 font-semibold transition-all ${
              post.isLiked
                ? 'text-rose-600 font-bold'
                : 'text-gray-600 hover:text-rose-600'
            }`}
          >
            <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{post.likesCount} Cổ vũ</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 font-semibold text-gray-600 hover:text-emerald-700 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{post.commentsCount} Bình luận</span>
          </button>

          <button
            onClick={handleShareClick}
            className="flex items-center gap-1.5 font-semibold text-gray-600 hover:text-teal-700 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span>{copiedShare ? 'Đã sao chép link!' : `${post.sharesCount} Chia sẻ`}</span>
          </button>
        </div>

        <span className="text-xs text-gray-400 hidden sm:inline">Mạng Xã Hội Xanh</span>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="bg-gray-50/70 border-t border-gray-100 p-5 space-y-4">
          <form onSubmit={handleSendComment} className="flex items-center gap-2.5">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-xl object-cover shrink-0"
            />
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Viết bình luận hoặc chia sẻ hành động xanh..."
              className="flex-1 bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!newCommentText.trim()}
              className="p-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-40 transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="space-y-3.5 pt-2">
            {post.comments.map((comment) => (
              <div key={comment.id} className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <img
                    src={comment.author?.avatar || comment.authorAvatar || ''}
                    alt={comment.author?.name || comment.authorName || 'User'}
                    className="w-7 h-7 rounded-lg object-cover shrink-0 mt-0.5"
                  />
                  <div className="flex-1 bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-gray-900">
                          {comment.author?.name || comment.authorName || 'Thành viên'}
                        </span>
                        {comment.author?.roleBadge && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">
                            {comment.author.roleBadge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400">{comment.createdAt}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-800 mt-1">{comment.content}</p>

                    <div className="mt-2 flex items-center gap-3 text-[11px] text-gray-500 font-medium">
                      <button className="hover:text-rose-600 transition-colors">
                        Thích ({comment.likesCount})
                      </button>
                      <span>•</span>
                      <button
                        onClick={() =>
                          setReplyingToCommentId(
                            replyingToCommentId === comment.id ? null : comment.id
                          )
                        }
                        className="text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        <CornerDownRight className="w-3 h-3" />
                        <span>Trả lời</span>
                      </button>
                    </div>
                  </div>
                </div>

                {comment.replies && comment.replies.length > 0 && (
                  <div className="pl-9 space-y-2">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-2">
                        <img
                          src={reply.author.avatar}
                          alt={reply.author.name}
                          className="w-6 h-6 rounded-md object-cover shrink-0 mt-0.5"
                        />
                        <div className="flex-1 bg-white/90 p-2.5 rounded-xl border border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-gray-900">
                              {reply.author.name}
                            </span>
                            <span className="text-[10px] text-gray-400">{reply.createdAt}</span>
                          </div>
                          <p className="text-xs text-gray-800 mt-0.5">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {replyingToCommentId === comment.id && (
                  <div className="pl-9 pt-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Trả lời ${comment.author?.name || comment.authorName || 'bình luận'}...`}
                      className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => handleSendReply(comment.id)}
                      disabled={!replyText.trim()}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold disabled:opacity-40"
                    >
                      Gửi
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};
