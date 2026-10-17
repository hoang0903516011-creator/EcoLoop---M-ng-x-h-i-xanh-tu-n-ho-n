import {
  UserProfile,
  RecyclingPoint,
  Post,
  GreenEvent,
  Article,
  EcoReward,
  PointTransaction,
  AppNotification,
  ChatMessage,
  GreenLevel,
  PostType,
  UserRole,
  DelightexGame,
} from '../types';
import {
  SEED_USERS,
  SEED_RECYCLING_POINTS,
  SEED_POSTS,
  SEED_EVENTS,
  SEED_ARTICLES,
  SEED_REWARDS,
  SEED_TRANSACTIONS,
  SEED_NOTIFICATIONS,
  SEED_DELIGHTEX_GAMES,
} from '../data/seedData';

type Listener = () => void;

class StorageService {
  private listeners: Set<Listener> = new Set();
  private storageVersion = 'v4_ecoloop_cantho';

  private calculateLevel(points: number): GreenLevel {
    if (points >= 3500) return 'Level 5 – Planet Guardian';
    if (points >= 1501) return 'Level 4 – Eco Hero';
    if (points >= 601) return 'Level 3 – Green Warrior';
    if (points >= 201) return 'Level 2 – Eco Explorer';
    return 'Level 1 – Green Starter';
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((cb) => cb());
  }

  private getItem<T>(key: string, defaultVal: T): T {
    try {
      const data = localStorage.getItem(`ecoloop_${this.storageVersion}_${key}`);
      return data ? JSON.parse(data) : defaultVal;
    } catch (e) {
      console.warn(`Error reading ${key} from storage`, e);
      return defaultVal;
    }
  }

  private setItem<T>(key: string, val: T): void {
    try {
      localStorage.setItem(`ecoloop_${this.storageVersion}_${key}`, JSON.stringify(val));
    } catch (e) {
      console.warn(`Error saving ${key} to storage`, e);
    }
  }

  // --- Current User ---
  public getCurrentUser(): UserProfile {
    return this.getItem<UserProfile>('current_user', SEED_USERS[0]);
  }

  public setCurrentUser(user: UserProfile): void {
    this.setItem('current_user', user);
    this.notify();
  }

  public switchUserByRole(role: UserRole): UserProfile {
    const target =
      SEED_USERS.find(
        (u) =>
          u.role.toLowerCase() === role.toLowerCase() ||
          (role === 'USER' && (u.role === 'individual' || u.role === 'USER')) ||
          (role === 'ORGANIZATION' && (u.role === 'organization' || u.role === 'ORGANIZATION')) ||
          (role === 'ADMIN' && (u.role === 'admin' || u.role === 'ADMIN'))
      ) || SEED_USERS[0];
    this.setCurrentUser(target);
    return target;
  }

  public updateProfile(updates: Partial<UserProfile>): void {
    const current = this.getCurrentUser();
    const updated = { ...current, ...updates };
    this.setItem('current_user', updated);
    this.notify();
  }

  // --- EcoPoints & Transactions ---
  public addEcoPoints(amount: number, title: string, description: string): boolean {
    const user = this.getCurrentUser();
    const newPoints = Math.max(0, user.ecoPoints + amount);
    const newLevel = this.calculateLevel(newPoints);
    user.ecoPoints = newPoints;
    user.level = newLevel;
    this.setItem('current_user', user);

    const transactions = this.getTransactions();
    const newTx: PointTransaction = {
      id: `tx-${Date.now()}`,
      userId: user.id,
      amount,
      type: amount >= 0 ? 'earn' : 'spend',
      title,
      description,
      createdAt: 'Vừa xong',
    };
    this.setItem('transactions', [newTx, ...transactions]);

    if (amount > 0) {
      this.addNotification({
        title: `+${amount} EcoPoints thưởng!`,
        message: title,
        type: 'points',
      });
    }

    this.notify();
    return true;
  }

  public deductEcoPoints(amount: number, title: string, description: string): boolean {
    const user = this.getCurrentUser();
    if (user.ecoPoints < amount) return false;
    user.ecoPoints = user.ecoPoints - amount;
    user.level = this.calculateLevel(user.ecoPoints);
    this.setItem('current_user', user);

    const transactions = this.getTransactions();
    const newTx: PointTransaction = {
      id: `tx-${Date.now()}`,
      userId: user.id,
      amount: -amount,
      type: 'spend',
      title,
      description,
      createdAt: 'Vừa xong',
    };
    this.setItem('transactions', [newTx, ...transactions]);
    this.notify();
    return true;
  }

  public getTransactions(): PointTransaction[] {
    return this.getItem<PointTransaction[]>('transactions', SEED_TRANSACTIONS);
  }

  // --- Recycling Points (EcoMap) ---
  public getRecyclingPoints(): RecyclingPoint[] {
    return this.getItem<RecyclingPoint[]>('recycling_points', SEED_RECYCLING_POINTS);
  }

  public addRecyclingPoint(point: Omit<RecyclingPoint, 'id'>): RecyclingPoint {
    const points = this.getRecyclingPoints();
    const newPoint: RecyclingPoint = {
      ...point,
      id: `point-${Date.now()}`,
    };
    const updated = [newPoint, ...points];
    this.setItem('recycling_points', updated);
    this.notify();
    return newPoint;
  }

  public verifyRecyclingPoint(id: string): void {
    const points = this.getRecyclingPoints();
    const updated = points.map((p) => (p.id === id ? { ...p, verified: true } : p));
    this.setItem('recycling_points', updated);
    this.notify();
  }

  // --- Green Social Feed (Posts) ---
  public getPosts(): Post[] {
    return this.getItem<Post[]>('posts', SEED_POSTS);
  }

  public createPost(data: {
    content: string;
    postType: PostType;
    images?: string[];
    location?: string;
    materialType?: string;
  }): Post {
    const user = this.getCurrentUser();
    const posts = this.getPosts();
    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      authorRole: user.role,
      authorSchool: user.schoolOrOrg,
      postType: data.postType,
      content: data.content,
      images: data.images || [],
      location: data.location || user.location,
      materialType: data.materialType,
      likes: [],
      emotions: { greenHeart: 1, thankful: 0, inspiring: 0 },
      comments: [],
      sharesCount: 0,
      savedBy: [],
      createdAt: 'Vừa xong',
      status: 'approved',
    };
    this.setItem('posts', [newPost, ...posts]);
    user.postsCount = (user.postsCount || 0) + 1;
    this.setItem('current_user', user);

    this.addEcoPoints(20, 'Đăng bài viết chia sẻ sống xanh', 'Lan tỏa lối sống tuần hoàn');
    this.notify();
    return newPost;
  }

  public deletePost(postId: string): boolean {
    const posts = this.getPosts();
    const updated = posts.filter((p) => p.id !== postId);
    this.setItem('posts', updated);
    this.notify();
    return true;
  }

  public togglePinPost(postId: string): void {
    const posts = this.getPosts();
    const updated = posts.map((p) => (p.id === postId ? { ...p, isPinned: !p.isPinned } : p));
    this.setItem('posts', updated);
    this.notify();
  }

  public toggleLikePost(postId: string, emotion: 'greenHeart' | 'thankful' | 'inspiring' = 'greenHeart'): void {
    const posts = this.getPosts();
    const user = this.getCurrentUser();
    const updated = posts.map((p) => {
      if (p.id !== postId) return p;
      const likesList = p.likes || [];
      const isLiked = likesList.includes(user.id);
      const newLikes = isLiked ? likesList.filter((id) => id !== user.id) : [...likesList, user.id];
      const newEmotions = { ...(p.emotions || { greenHeart: 0, thankful: 0, inspiring: 0 }) };
      newEmotions[emotion] = Math.max(0, (newEmotions[emotion] || 0) + (isLiked ? -1 : 1));
      return {
        ...p,
        likes: newLikes,
        emotions: newEmotions,
      };
    });
    this.setItem('posts', updated);
    this.notify();
  }

  public addComment(postId: string, content: string): void {
    const posts = this.getPosts();
    const user = this.getCurrentUser();
    const updated = posts.map((p) => {
      if (p.id !== postId) return p;
      return {
        ...p,
        comments: [
          ...p.comments,
          {
            id: `c-${Date.now()}`,
            authorId: user.id,
            authorName: user.name,
            authorAvatar: user.avatar,
            content,
            createdAt: 'Vừa xong',
          },
        ],
      };
    });
    this.setItem('posts', updated);
    this.notify();
  }

  public toggleSavePost(postId: string): boolean {
    const posts = this.getPosts();
    const user = this.getCurrentUser();
    let isSaved = false;
    const updated = posts.map((p) => {
      if (p.id !== postId) return p;
      const savedList = p.savedBy || [];
      const hasSaved = savedList.includes(user.id);
      isSaved = !hasSaved;
      return {
        ...p,
        savedBy: hasSaved ? savedList.filter((id) => id !== user.id) : [...savedList, user.id],
      };
    });
    this.setItem('posts', updated);
    this.notify();
    return isSaved;
  }

  // --- Green Events ---
  public getEvents(): GreenEvent[] {
    return this.getItem<GreenEvent[]>('events', SEED_EVENTS);
  }

  public registerEvent(eventId: string): boolean {
    const events = this.getEvents();
    const user = this.getCurrentUser();
    let success = false;
    const updated = events.map((ev) => {
      if (ev.id !== eventId) return ev;
      if (ev.registeredUserIds.includes(user.id)) return ev;
      if (ev.registeredCount >= ev.maxParticipants) return ev;
      success = true;
      return {
        ...ev,
        registeredCount: ev.registeredCount + 1,
        registeredUserIds: [...ev.registeredUserIds, user.id],
      };
    });
    if (success) {
      this.setItem('events', updated);
      user.eventsJoined = (user.eventsJoined || 0) + 1;
      this.setItem('current_user', user);
      this.addNotification({
        title: 'Đăng ký chiến dịch thành công!',
        message: 'Bạn đã đăng ký tham gia chiến dịch bảo vệ môi trường.',
        type: 'event',
      });
      this.notify();
    }
    return success;
  }

  public unregisterEvent(eventId: string): void {
    const events = this.getEvents();
    const user = this.getCurrentUser();
    const updated = events.map((ev) => {
      if (ev.id !== eventId) return ev;
      return {
        ...ev,
        registeredCount: Math.max(0, ev.registeredCount - 1),
        registeredUserIds: ev.registeredUserIds.filter((id) => id !== user.id),
      };
    });
    this.setItem('events', updated);
    user.eventsJoined = Math.max(0, (user.eventsJoined || 1) - 1);
    this.setItem('current_user', user);
    this.notify();
  }

  public createEvent(
    newEvent: Omit<GreenEvent, 'id' | 'registeredCount' | 'registeredUserIds' | 'attendedUserIds' | 'organizationId'> & {
      organizationId?: string;
    }
  ): GreenEvent {
    const events = this.getEvents();
    const created: GreenEvent = {
      organizationId: newEvent.organizationId || this.getCurrentUser().id,
      ...newEvent,
      id: `event-${Date.now()}`,
      registeredCount: 1,
      registeredUserIds: [this.getCurrentUser().id],
      attendedUserIds: [],
    };
    this.setItem('events', [created, ...events]);
    this.notify();
    return created;
  }

  public checkInEventUser(eventId: string, targetUserId: string, pointsAward: number): void {
    const events = this.getEvents();
    const updated = events.map((ev) => {
      if (ev.id !== eventId) return ev;
      if (ev.attendedUserIds.includes(targetUserId)) return ev;
      return {
        ...ev,
        attendedUserIds: [...ev.attendedUserIds, targetUserId],
      };
    });
    this.setItem('events', updated);
    const current = this.getCurrentUser();
    if (current.id === targetUserId) {
      this.addEcoPoints(pointsAward, `Điểm danh tham gia sự kiện`, `Được ban tổ chức xác nhận`);
    }
    this.notify();
  }

  // --- Eco Rewards ---
  public getRewards(): EcoReward[] {
    return this.getItem<EcoReward[]>('rewards', SEED_REWARDS);
  }

  public updateRewardQuantity(rewardId: string, delta: number): void {
    const rewards = this.getRewards();
    const updated = rewards.map((r) =>
      r.id === rewardId ? { ...r, remainingQuantity: Math.max(0, r.remainingQuantity + delta) } : r
    );
    this.setItem('rewards', updated);
    this.notify();
  }

  public redeemReward(rewardId: string): { success: boolean; message: string } {
    const rewards = this.getRewards();
    const user = this.getCurrentUser();
    const reward = rewards.find((r) => r.id === rewardId);
    if (!reward) return { success: false, message: 'Không tìm thấy quà tặng.' };
    if (reward.remainingQuantity <= 0) return { success: false, message: 'Phần quà này hiện đã hết suất.' };
    if (user.ecoPoints < reward.ecoPointsCost) {
      return {
        success: false,
        message: `Bạn cần ${reward.ecoPointsCost} EcoPoints nhưng hiện chỉ có ${user.ecoPoints} EcoPoints.`,
      };
    }

    this.addEcoPoints(-reward.ecoPointsCost, `Đổi thưởng: ${reward.name}`, `Nhà tài trợ: ${reward.sponsor}`);
    const updatedRewards = rewards.map((r) => {
      if (r.id !== rewardId) return r;
      return { ...r, remainingQuantity: r.remainingQuantity - 1 };
    });
    this.setItem('rewards', updatedRewards);
    this.addNotification({
      title: 'Đổi quà thành công!',
      message: `Bạn đã đổi thành công "${reward.name}". Vui lòng kiểm tra mã QR trong ví Eco.`,
      type: 'points',
    });
    this.notify();
    return { success: true, message: `Chúc mừng bạn đã đổi thành công "${reward.name}"!` };
  }

  // --- Articles ---
  public getArticles(): Article[] {
    return this.getItem<Article[]>('articles', SEED_ARTICLES);
  }

  public toggleSaveArticle(articleId: string): boolean {
    const articles = this.getArticles();
    const user = this.getCurrentUser();
    let isSaved = false;
    const updated = articles.map((a) => {
      if (a.id !== articleId) return a;
      const hasSaved = a.savedBy.includes(user.id);
      isSaved = !hasSaved;
      return {
        ...a,
        savedBy: hasSaved ? a.savedBy.filter((id) => id !== user.id) : [...a.savedBy, user.id],
      };
    });
    this.setItem('articles', updated);
    this.notify();
    return isSaved;
  }

  // --- Notifications ---
  public getNotifications(): AppNotification[] {
    return this.getItem<AppNotification[]>('notifications', SEED_NOTIFICATIONS);
  }

  public addNotification(notif: Omit<AppNotification, 'id' | 'userId' | 'read' | 'createdAt'>): void {
    const list = this.getNotifications();
    const user = this.getCurrentUser();
    const item: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      userId: user.id,
      read: false,
      createdAt: 'Vừa xong',
    };
    this.setItem('notifications', [item, ...list]);
    this.notify();
  }

  public markNotificationRead(id: string): void {
    const list = this.getNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.setItem('notifications', updated);
    this.notify();
  }

  public markAllNotificationsRead(): void {
    const list = this.getNotifications();
    const updated = list.map((n) => ({ ...n, read: true }));
    this.setItem('notifications', updated);
    this.notify();
  }

  // --- Chat Messages ---
  public getMessages(): ChatMessage[] {
    return this.getItem<ChatMessage[]>('messages', [
      {
        id: 'msg-1',
        senderId: 'user-le-thao',
        senderName: 'Lê Thu Thảo',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        receiverId: 'user-duy-duyen',
        text: 'Chào bạn Duyên, mình thấy bạn có đăng bài chia sẻ gom pin. Chiều nay mình mang 2 túi ve chai qua cổng trường giao lưu nhé!',
        timestamp: '10:30',
      },
      {
        id: 'msg-2',
        senderId: 'user-duy-duyen',
        senderName: 'Nguyễn Duy Duyên',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        receiverId: 'user-le-thao',
        text: 'Dạ tuyệt vời quá Thảo ơi, khoảng 15h mình ở phòng đoàn trường đón bạn nha!',
        timestamp: '10:35',
      },
    ]);
  }

  public sendMessage(receiverId: string, text: string, image?: string): ChatMessage {
    const user = this.getCurrentUser();
    const messages = this.getMessages();
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      receiverId,
      text,
      image,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    this.setItem('messages', [...messages, newMsg]);
    this.notify();
    return newMsg;
  }

  // --- Delightex 3D Games ---
  public getDelightexGames(): DelightexGame[] {
    return this.getItem<DelightexGame[]>('delightex_games', SEED_DELIGHTEX_GAMES);
  }

  public updateDelightexGame(id: string, updates: Partial<DelightexGame>): void {
    const games = this.getDelightexGames();
    const updated = games.map((g) => (g.id === id ? { ...g, ...updates } : g));
    this.setItem('delightex_games', updated);
    this.notify();
  }

  // Reset demo data
  public resetToSeed(): void {
    localStorage.clear();
    this.setItem('current_user', SEED_USERS[0]);
    this.setItem('recycling_points', SEED_RECYCLING_POINTS);
    this.setItem('posts', SEED_POSTS);
    this.setItem('events', SEED_EVENTS);
    this.setItem('articles', SEED_ARTICLES);
    this.setItem('rewards', SEED_REWARDS);
    this.setItem('transactions', SEED_TRANSACTIONS);
    this.setItem('notifications', SEED_NOTIFICATIONS);
    this.setItem('delightex_games', SEED_DELIGHTEX_GAMES);
    this.notify();
  }
}

export const storage = new StorageService();
