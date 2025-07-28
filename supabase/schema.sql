-- ユーザープロファイル
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('user1', 'user2')),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  interface_language VARCHAR(20) NOT NULL DEFAULT 'spanish' CHECK (interface_language IN ('spanish', 'english', 'japanese')),
  total_articles INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 保存済み記事
CREATE TABLE saved_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  topic VARCHAR(200) NOT NULL,
  level VARCHAR(20) NOT NULL,
  article_content TEXT NOT NULL,
  vocabulary JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- お気に入りトピック
CREATE TABLE favorite_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  topic VARCHAR(200) NOT NULL,
  count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, topic)
);

-- インデックス
CREATE INDEX idx_saved_articles_user_id ON saved_articles(user_id);
CREATE INDEX idx_saved_articles_created_at ON saved_articles(created_at);
CREATE INDEX idx_favorite_topics_user_id ON favorite_topics(user_id);
CREATE INDEX idx_user_profiles_user_type ON user_profiles(user_type);

-- 更新日時を自動で更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_saved_articles_updated_at BEFORE UPDATE ON saved_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_favorite_topics_updated_at BEFORE UPDATE ON favorite_topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 初期データ
INSERT INTO user_profiles (user_type, name, description, interface_language) VALUES
('user1', 'NAMICHI', 'スペイン語学習者、スペインのニュースを読むのが好き', 'spanish'),
('user2', 'JOSÉ', 'スペイン語話者、日本語を学習中', 'spanish');
