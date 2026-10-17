export type UserRole = 'USER' | 'ORGANIZATION' | 'ADMIN' | 'individual' | 'organization' | 'admin';

export type GreenLevel =
  | 'Level 1 – Green Starter'
  | 'Level 2 – Eco Explorer'
  | 'Level 3 – Green Warrior'
  | 'Level 4 – Eco Hero'
  | 'Level 5 – Planet Guardian';

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt?: string;
}

export interface UserStats {
  postsCount: number;
  scansCount: number;
  campaignsJoined: number;
  recycledKg: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  handle?: string;
  avatar: string;
  coverPhoto?: string;
  role: UserRole;
  roleBadge?: string;
  bio: string;
  organizationName?: string;
  organizationInfo?: {
    establishedYear?: string;
    focusAreas?: string[];
    website?: string;
    contactEmail?: string;
    description?: string;
    phone?: string;
    address?: string;
    [key: string]: any;
  };
  schoolOrOrg?: string;
  location: string;
  ecoPoints: number;
  greenRank?: string;
  level?: GreenLevel;
  wasteRecycledKg?: number;
  eventsJoined?: number;
  challengesCompleted?: number;
  postsCount?: number;
  badges: Badge[];
  joinedDate?: string;
  stats?: UserStats;
}

export type WasteCategory =
  | 'Pin'
  | 'Nhựa'
  | 'Giấy'
  | 'Kim loại'
  | 'Đồ điện tử'
  | 'Quần áo'
  | 'Đồ gia dụng'
  | 'Rác hữu cơ';

export interface RecyclingPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  operatingHours: string;
  acceptedWastes: (WasteCategory | string)[];
  phone: string;
  image: string;
  verified: boolean;
  type: 'collection' | 'recycling' | 'reward_exchange';
  description?: string;
}

export type PostType =
  | 'Chia sẻ sống xanh'
  | 'Tìm người tham gia sự kiện'
  | 'Cho tặng đồ cũ'
  | 'Trao đổi ve chai'
  | 'Bật mí lối sống xanh'
  | 'Trạm thu gom'
  | string;

export interface PostComment {
  id: string;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  author?: {
    id: string;
    name: string;
    avatar: string;
    role?: any;
    roleBadge?: string;
  };
  content: string;
  createdAt: string;
  likesCount?: number;
  isLiked?: boolean;
  replies?: any[];
}

export type CommentItem = PostComment;
export type CommentReply = any;
export type AttachedScanResult = any;

export interface Post {
  id: string;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  authorRole?: UserRole;
  authorSchool?: string;
  author?: any;
  postType?: PostType;
  topicTag?: string;
  content: string;
  images: string[];
  location?: string;
  materialType?: string;
  likes?: string[]; // user IDs
  likesCount?: number;
  isLiked?: boolean;
  emotions?: {
    greenHeart?: number;
    thankful?: number;
    inspiring?: number;
  };
  comments: PostComment[];
  commentsCount?: number;
  sharesCount: number;
  savedBy?: string[]; // user IDs
  createdAt: string;
  status?: 'approved' | 'pending' | 'flagged';
  isPinned?: boolean;
  attachedScanResult?: any;
}

export type EventCategory =
  | 'Dọn rác'
  | 'Trồng cây'
  | 'Đổi quà'
  | 'Tái chế DIY'
  | 'Workshop môi trường'
  | 'Chiến dịch xanh'
  | 'Hoạt động tình nguyện'
  | string;

export interface GreenEvent {
  id: string;
  title: string;
  organizationId: string;
  organizationName: string;
  organizationAvatar?: string;
  category: EventCategory;
  dateTime: string;
  location: string;
  city?: string;
  registeredCount: number;
  maxParticipants: number;
  ecoPointsReward: number;
  image: string;
  description: string;
  registeredUserIds: string[];
  attendedUserIds: string[];
  schedule?: { time: string; activity: string }[];
  certificateProvided?: boolean;
  status?: 'upcoming' | 'ongoing' | 'finished';
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  category:
    | 'Phân loại rác'
    | 'Tái chế DIY'
    | 'Chính sách & Luật'
    | 'Sống xanh sinh viên'
    | 'Kinh tế tuần hoàn'
    | 'Biến đổi khí hậu'
    | 'Môi trường học đường'
    | string;
  author: string;
  readTime: string;
  image: string;
  content: string[] | string;
  tags: string[];
  likes: number;
  savedBy: string[];
  publishedAt: string;
}

export interface EcoReward {
  id: string;
  name: string;
  category: 'Cây xanh' | 'Vật dụng sinh thái' | 'Voucher' | 'Quà tái chế' | string;
  ecoPointsCost: number;
  remainingQuantity: number;
  image: string;
  sponsor: string;
  description: string;
}

export interface PointTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earn' | 'spend';
  title: string;
  description: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'event' | 'points' | 'badge' | 'social';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId?: string;
  text: string;
  image?: string;
  imageUrl?: string;
  timestamp: string;
  isBot?: boolean;
}

export interface ChatConversation {
  id: string;
  name?: string;
  title?: string;
  avatar: string;
  type?: string;
  roleBadge?: string;
  badge?: string;
  isBot?: boolean;
  isOnline?: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  [key: string]: any;
}


export interface MinigameItem {
  id: string;
  name?: string;
  title?: string;
  subtitle?: string;
  category?: string;
  correctBin?: 'organic' | 'recyclable' | 'hazardous' | 'other';
  image?: string;
  thumbnail?: string;
  url?: string;
  description?: string;
  pointsReward?: number;
  badgeReward?: string;
  playCount?: number;
  completed?: boolean;
}

export interface DelightexGame {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  badge: string;
  image: string;
  iframeUrl: string;
  description: string;
  pointsReward: number;
  author: string;
  learningObjectives: string[];
  controlsGuide: {
    mouse: string;
    keyboard: string;
    interaction: string;
  };
}

export interface EcoQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
}

export interface GreenChallenge {
  id: string;
  title: string;
  description: string;
  points: number;
  completedDays: boolean[];
  isCompleted: boolean;
}

export interface AIEventPlan {
  title: string;
  summary: string;
  description: string;
  targetAudience?: string;
  estimatedVolunteers?: string;
  volunteerCountEstimate?: string;
  timeline: { time: string; activity: string; personInCharge?: string }[];
  equipmentNeeded: string[];
  equipmentList?: { item: string; quantity: string; note: string }[];
  safetyNotes: string[];
  safetyRules?: string[];
  communicationMessage: string;
  communicationPlan?: { channel: string; action: string; timing: string }[];
  checklist?: { phase: string; tasks: string[] }[];
  isFallback?: boolean;
}

// -------------------------------------------------------------
// ROBOTIC & VISION SCANNER TYPES (GIỮ NGUYÊN VẸN CHO ECOBOT SCANNER)
// -------------------------------------------------------------
export type WasteCategoryKey = 'recyclable' | 'organic' | 'residual' | 'hazardous' | 'ewaste';

export interface DetectedWasteItem {
  id: string;
  label: string;
  category: WasteCategoryKey;
  categoryName: string;
  binColor: string;
  confidence: number;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
  handlingInstructions: string[];
  upcyclingTip: string;
  ecoPoints: number;
}

export interface ScanResult {
  overview: string;
  totalItems: number;
  recyclableRatio: number;
  totalEcoPoints: number;
  items: DetectedWasteItem[];
  annotatedImage?: string | null;
}
