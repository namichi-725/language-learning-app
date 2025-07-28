import { supabase } from './supabase'

// 型定義
export type UserType = 'user1' | 'user2';
export type InterfaceLanguage = 'spanish' | 'english' | 'japanese';

export interface SavedArticle {
  id: string;
  topic: string;
  level: string;
  content: {
    article: string;
    vocabulary: Array<{
      word: string;
      meaning: string;
      reading?: string;
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

export interface UserProfile {
  id: string;
  user_type: UserType;
  name: string;
  description: string;
  interface_language: InterfaceLanguage;
  total_articles: number;
  created_at: string;
  updated_at: string;
}

export class UserDataManager {
  // ユーザープロファイルの取得または作成
  static async ensureUserProfile(userType: UserType): Promise<UserProfile> {
    try {
      // 既存のプロファイルを確認
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_type', userType)
        .single();

      if (existingProfile && !fetchError) {
        return existingProfile;
      }

      // プロファイルが存在しない場合は作成
      const defaultProfile = {
        user_type: userType,
        name: userType === 'user1' ? 'NAMICHI' : 'JOSÉ',
        description: userType === 'user1' 
          ? 'スペイン語学習者、スペインのニュースを読むのが好き'
          : 'スペイン語話者、日本語を学習中',
        interface_language: 'spanish' as InterfaceLanguage
      };

      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert(defaultProfile)
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create user profile: ${createError.message}`);
      }

      return newProfile;
    } catch (error) {
      console.error('Error ensuring user profile:', error);
      throw error;
    }
  }

  // 記事の保存
  static async saveArticle(userId: UserType, article: Omit<SavedArticle, 'id' | 'userId'>): Promise<void> {
    try {
      const userProfile = await this.ensureUserProfile(userId);

      const { error } = await supabase
        .from('saved_articles')
        .insert({
          user_id: userProfile.id,
          topic: article.topic,
          level: article.level,
          article_content: article.content.article,
          vocabulary: article.content.vocabulary
        });

      if (error) {
        throw new Error(`Failed to save article: ${error.message}`);
      }

      // ユーザー統計を更新
      await this.updateUserStats(userId, article.topic, article.level);
    } catch (error) {
      console.error('Error saving article:', error);
      throw error;
    }
  }

  // 記事の取得
  static async getArticles(userId: UserType): Promise<SavedArticle[]> {
    try {
      const userProfile = await this.ensureUserProfile(userId);

      const { data, error } = await supabase
        .from('saved_articles')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch articles: ${error.message}`);
      }

      return (data || []).map(article => ({
        id: article.id,
        topic: article.topic,
        level: article.level,
        content: {
          article: article.article_content,
          vocabulary: article.vocabulary
        },
        timestamp: article.created_at,
        userId
      }));
    } catch (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
  }

  // 記事の削除
  static async deleteArticle(userId: UserType, articleId: string): Promise<void> {
    try {
      const userProfile = await this.ensureUserProfile(userId);

      const { error } = await supabase
        .from('saved_articles')
        .delete()
        .eq('id', articleId)
        .eq('user_id', userProfile.id);

      if (error) {
        throw new Error(`Failed to delete article: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  }

  // ユーザー統計の更新
  private static async updateUserStats(userId: UserType, topic: string, level: string): Promise<void> {
    try {
      const userProfile = await this.ensureUserProfile(userId);

      // 記事数を更新
      await supabase
        .from('user_profiles')
        .update({ 
          total_articles: userProfile.total_articles + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id);

      // お気に入りトピックを更新
      const { data: existingTopic } = await supabase
        .from('favorite_topics')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('topic', topic)
        .single();

      if (existingTopic) {
        // 既存のトピックのカウントを増加
        await supabase
          .from('favorite_topics')
          .update({ 
            count: existingTopic.count + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingTopic.id);
      } else {
        // 新しいトピックを追加
        await supabase
          .from('favorite_topics')
          .insert({
            user_id: userProfile.id,
            topic,
            count: 1
          });
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }

  // ユーザー統計の取得
  static async getUserStats(userId: UserType): Promise<UserStats> {
    try {
      const userProfile = await this.ensureUserProfile(userId);

      // お気に入りトピックを取得
      const { data: favoriteTopics } = await supabase
        .from('favorite_topics')
        .select('topic, count')
        .eq('user_id', userProfile.id)
        .order('count', { ascending: false })
        .limit(10);

      // レベル分布を取得
      const { data: articles } = await supabase
        .from('saved_articles')
        .select('level')
        .eq('user_id', userProfile.id);

      const levelDistribution: Record<string, number> = {};
      articles?.forEach(article => {
        levelDistribution[article.level] = (levelDistribution[article.level] || 0) + 1;
      });

      return {
        totalArticles: userProfile.total_articles,
        favoriteTopics: favoriteTopics?.map(t => t.topic) || [],
        levelDistribution,
        lastActivity: userProfile.updated_at
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        totalArticles: 0,
        favoriteTopics: [],
        levelDistribution: {},
        lastActivity: new Date().toISOString()
      };
    }
  }

  // ユーザー設定の取得
  static async getUserSettings(userId: UserType): Promise<UserSettings> {
    try {
      const userProfile = await this.ensureUserProfile(userId);
      return {
        interfaceLanguage: userProfile.interface_language
      };
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return { interfaceLanguage: 'spanish' };
    }
  }

  // 言語設定の更新
  static async updateInterfaceLanguage(userId: UserType, language: InterfaceLanguage): Promise<void> {
    try {
      const userProfile = await this.ensureUserProfile(userId);

      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          interface_language: language,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id);

      if (error) {
        throw new Error(`Failed to update interface language: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating interface language:', error);
      throw error;
    }
  }

  // ローカルストレージからのデータ移行（一回限り）
  static async migrateFromLocalStorage(userId: UserType): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const storageKey = `savedArticles_${userId}`;
      const localData = localStorage.getItem(storageKey);
      
      if (!localData) return;

      const articles: SavedArticle[] = JSON.parse(localData);
      
      for (const article of articles) {
        await this.saveArticle(userId, {
          topic: article.topic,
          level: article.level,
          content: article.content,
          timestamp: article.timestamp
        });
      }

      // 移行完了後、ローカルストレージをクリア
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`userStats_${userId}`);
      localStorage.removeItem(`userSettings_${userId}`);
      
      console.log(`Successfully migrated ${articles.length} articles for ${userId}`);
    } catch (error) {
      console.error('Error migrating from localStorage:', error);
    }
  }
}
