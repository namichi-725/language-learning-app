// ユーザー別データ管理用のユーティリティ
export type UserType = 'user1' | 'user2';
export type InterfaceLanguage = 'spanish' | 'english';

export interface SavedArticle {
  id: string;
  topic: string;
  level: string;
  content: {
    article: string;
    vocabulary: Array<{
      word: string;
      meaning: string;
      reading?: string; // 日本語学習用
    }>;
  };
  timestamp: string;
  userId: UserType;
}

export interface UserStats {
  totalArticles: number;
  favoriteTopics: string[];
  levelDistribution: Record<string, number>;
  lastActivity: string;
}

export interface UserSettings {
  interfaceLanguage: InterfaceLanguage;
}

// ユーザー別のローカルストレージキー
const getUserStorageKey = (userId: UserType) => `savedArticles_${userId}`;
const getUserStatsKey = (userId: UserType) => `userStats_${userId}`;
const getUserSettingsKey = (userId: UserType) => `userSettings_${userId}`;

export class UserDataManager {
  static saveArticle(userId: UserType, article: Omit<SavedArticle, 'id' | 'userId'>) {
    const storageKey = getUserStorageKey(userId);
    const existingArticles = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const newArticle: SavedArticle = {
      ...article,
      id: Date.now().toString(),
      userId,
    };
    
    existingArticles.push(newArticle);
    localStorage.setItem(storageKey, JSON.stringify(existingArticles));
    
    // 統計情報を更新
    this.updateUserStats(userId, newArticle);
    
    return newArticle;
  }

  static getArticles(userId: UserType): SavedArticle[] {
    const storageKey = getUserStorageKey(userId);
    return JSON.parse(localStorage.getItem(storageKey) || '[]');
  }

  static deleteArticle(userId: UserType, articleId: string) {
    const storageKey = getUserStorageKey(userId);
    const articles = this.getArticles(userId);
    const updatedArticles = articles.filter(article => article.id !== articleId);
    localStorage.setItem(storageKey, JSON.stringify(updatedArticles));
  }

  static updateUserStats(userId: UserType, article: SavedArticle) {
    const statsKey = getUserStatsKey(userId);
    const existingStats = JSON.parse(localStorage.getItem(statsKey) || '{}');
    
    const stats: UserStats = {
      totalArticles: (existingStats.totalArticles || 0) + 1,
      favoriteTopics: this.updateFavoriteTopics(existingStats.favoriteTopics || [], article.topic),
      levelDistribution: this.updateLevelDistribution(existingStats.levelDistribution || {}, article.level),
      lastActivity: new Date().toISOString(),
    };
    
    localStorage.setItem(statsKey, JSON.stringify(stats));
  }

  static getUserStats(userId: UserType): UserStats {
    const statsKey = getUserStatsKey(userId);
    return JSON.parse(localStorage.getItem(statsKey) || '{}');
  }

  private static updateFavoriteTopics(existingTopics: string[], newTopic: string): string[] {
    const topics = [...existingTopics];
    const index = topics.indexOf(newTopic);
    
    if (index > -1) {
      topics.splice(index, 1);
    }
    
    topics.unshift(newTopic);
    return topics.slice(0, 5); // 上位5つまで保持
  }

  private static updateLevelDistribution(existingDistribution: Record<string, number>, level: string): Record<string, number> {
    return {
      ...existingDistribution,
      [level]: (existingDistribution[level] || 0) + 1,
    };
  }

  // 言語設定の保存
  static saveUserSettings(userId: UserType, settings: UserSettings): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(getUserSettingsKey(userId), JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save user settings:', error);
    }
  }

  // 言語設定の取得
  static getUserSettings(userId: UserType): UserSettings {
    if (typeof window === 'undefined') {
      return { interfaceLanguage: 'spanish' }; // デフォルト
    }
    
    try {
      const stored = localStorage.getItem(getUserSettingsKey(userId));
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load user settings:', error);
    }
    
    // デフォルト設定
    return { interfaceLanguage: 'spanish' };
  }

  // 言語設定の更新
  static updateInterfaceLanguage(userId: UserType, language: InterfaceLanguage): void {
    const currentSettings = this.getUserSettings(userId);
    this.saveUserSettings(userId, {
      ...currentSettings,
      interfaceLanguage: language,
    });
  }
}
