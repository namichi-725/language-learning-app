'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft, Send, Bot, User, Loader2, BookOpen, Copy, Save, Globe } from 'lucide-react';
import Link from 'next/link';
import { UserDataManager, InterfaceLanguage } from '@/lib/userDataManager';
import { getTranslation } from '@/lib/translations';

interface GeneratedContent {
  article: string;
  vocabulary: Array<{
    word: string;
    meaning: string;
    reading?: string; // 日本語の場合
  }>;
}

type UserType = 'user1' | 'user2';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [interfaceLanguage, setInterfaceLanguage] = useState<InterfaceLanguage>('spanish');

  useEffect(() => {
    // URLパラメータからユーザーを取得
    const params = new URLSearchParams(window.location.search);
    const user = params.get('user') as UserType;
    if (user === 'user1' || user === 'user2') {
      setCurrentUser(user);
      setLevel(user === 'user1' ? 'B1' : 'N3'); // デフォルトレベル
      
      // 両方のユーザーで言語設定を読み込む
      const settings = UserDataManager.getUserSettings(user);
      setInterfaceLanguage(settings.interfaceLanguage);
    }
  }, []);

  const t = getTranslation(interfaceLanguage);

  const handleLanguageSwitch = (language: InterfaceLanguage) => {
    if (currentUser) {
      setInterfaceLanguage(language);
      UserDataManager.updateInterfaceLanguage(currentUser, language);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">ユーザーが選択されていません</p>
          <Link href="/" className="text-indigo-600 hover:text-indigo-500">
            メインページに戻る
          </Link>
        </div>
      </div>
    );
  }

  const levels = currentUser === 'user1' 
    ? [
        { value: 'A1', label: 'A1 (初級)' },
        { value: 'A2', label: 'A2 (初級+)' },
        { value: 'B1', label: 'B1 (中級)' },
        { value: 'B2', label: 'B2 (中級+)' },
        { value: 'C1', label: 'C1 (上級)' },
        { value: 'C2', label: 'C2 (上級+)' },
      ]
    : [
        { value: 'N5', label: 'N5 (初級)' },
        { value: 'N4', label: 'N4 (初級+)' },
        { value: 'N3', label: 'N3 (中級)' },
        { value: 'N2', label: 'N2 (中級+)' },
        { value: 'N1', label: 'N1 (上級)' },
      ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading || !currentUser) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: `トピック: ${topic} (レベル: ${level})`,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const apiEndpoint = currentUser === 'user1' ? '/api/generate' : '/api/generate-japanese';
      console.log('Current user:', currentUser);
      console.log('API endpoint:', apiEndpoint);
      console.log('Sending data:', { topic, level });
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, level }),
      });

      const data = await response.json();

      if (!response.ok) {
        // APIからのエラーメッセージを使用
        const errorMessage = data.error || 'APIリクエストに失敗しました';
        throw new Error(errorMessage);
      }

      setGeneratedContent(data);

      const language = currentUser === 'user1' ? 'スペイン語' : '日本語';
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `${topic}についての${level}レベルの${language}文章を生成しました。`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setTopic('');
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Error:', error);
      
      let errorMessage = 'エラーが発生しました。もう一度お試しください。';
      
      // 503エラー（Service Unavailable）の場合
      if (err.message?.includes('Gemini APIが一時的に混雑') || 
          err.message?.includes('Service Unavailable')) {
        errorMessage = 'AI サービスが一時的に混雑しています。30秒ほど待ってから再試行してください。';
      }
      // その他のエラーメッセージがある場合はそれを使用
      else if (err.message && err.message !== 'APIリクエストに失敗しました') {
        errorMessage = err.message;
      }
      
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: errorMessage,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: トースト通知を追加
  };

  const saveContent = () => {
    if (!generatedContent || !currentUser) return;
    
    const savedData = {
      topic,
      level,
      content: generatedContent,
      timestamp: new Date().toISOString(),
    };
    
    UserDataManager.saveArticle(currentUser, savedData);
    alert('文章が保存されました！');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-500">
                <ArrowLeft className="h-5 w-5" />
                <span>{currentUser === 'user1' ? '戻る' : t.chat.backToHome}</span>
              </Link>
              <div className="flex items-center space-x-2">
                <Bot className="h-8 w-8 text-indigo-600" />
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentUser === 'user1' ? 'AI学習チャット - スペイン語' : 
                   `AI ${currentUser === 'user2' && interfaceLanguage === 'spanish' ? 'Chat de Aprendizaje' : 
                         currentUser === 'user2' && interfaceLanguage === 'english' ? 'Learning Chat' : '学習チャット'} - ${
                    currentUser === 'user2' && interfaceLanguage === 'spanish' ? 'Japonés' :
                    currentUser === 'user2' && interfaceLanguage === 'english' ? 'Japanese' : '日本語'
                  }`}
                </h1>
              </div>
            </div>
            {/* 言語切り替えボタン */}
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-gray-500" />
              <select
                  value={interfaceLanguage}
                  onChange={(e) => handleLanguageSwitch(e.target.value as InterfaceLanguage)}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="spanish">{t.common.spanish}</option>
                  <option value="english">{t.common.english}</option>
                  <option value="japanese">{t.common.japanese}</option>
                </select>
              </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* 左側: チャットインターフェース */}
          <div className="space-y-6">
            {/* チャット履歴 */}
            <div className="bg-white rounded-xl shadow-lg p-6 h-96 overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">チャット履歴</h3>
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>興味のあるトピックを入力して学習を始めましょう！</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-3 ${
                        message.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.type === 'ai' && (
                        <div className="flex-shrink-0">
                          <Bot className="h-8 w-8 text-indigo-600" />
                        </div>
                      )}
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      {message.type === 'user' && (
                        <div className="flex-shrink-0">
                          <User className="h-8 w-8 text-gray-600" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 入力フォーム */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                    レベル選択
                  </label>
                  <select
                    id="level"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {levels.map((lvl) => (
                      <option key={lvl.value} value={lvl.value}>
                        {lvl.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                    興味のあるトピック
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      id="topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="例: 旅行、料理、スポーツ、映画..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={!topic.trim() || isLoading}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      <span>{isLoading ? '生成中...' : '送信'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* 右側: 生成されたコンテンツ */}
          <div className="space-y-6">
            {generatedContent ? (
              <>
                {/* スペイン語文章 */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <BookOpen className="h-5 w-5" />
                      <span>生成された文章</span>
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(generatedContent.article)}
                        className="p-2 text-gray-500 hover:text-gray-700"
                        title="コピー"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={saveContent}
                        className="p-2 text-indigo-600 hover:text-indigo-700"
                        title="保存"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="prose prose-lg">
                    <p className="text-gray-800 leading-relaxed">{generatedContent.article}</p>
                  </div>
                </div>

                {/* 単語帳 */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">重要単語</h3>
                  
                  {/* 表形式の語彙表示 */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 text-left py-3 px-4 font-semibold text-gray-900">
                            {currentUser === 'user2' ? '語彙 + 読み仮名' : '語彙'}
                          </th>
                          <th className="border border-gray-200 text-left py-3 px-4 font-semibold text-gray-900">意味</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedContent.vocabulary.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-gray-200 py-3 px-4">
                              <span className="font-medium text-gray-900">{item.word}</span>
                              {item.reading && (
                                <span className="text-sm text-gray-500 ml-1">（{item.reading}）</span>
                              )}
                            </td>
                            <td className="border border-gray-200 py-3 px-4 text-gray-600">{item.meaning}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-center h-96">
                <div className="text-center text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>トピックを送信すると、ここに生成された文章が表示されます</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
