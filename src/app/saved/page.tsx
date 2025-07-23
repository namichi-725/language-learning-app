'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Trash2, Calendar, Target, Globe } from 'lucide-react';
import Link from 'next/link';
import { UserDataManager, SavedArticle as SavedArticleType, InterfaceLanguage } from '@/lib/userDataManager';
import { getTranslation } from '@/lib/translations';

type UserType = 'user1' | 'user2';

export default function SavedPage() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [savedArticles, setSavedArticles] = useState<SavedArticleType[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<SavedArticleType | null>(null);
  const [interfaceLanguage, setInterfaceLanguage] = useState<InterfaceLanguage>('spanish');

  useEffect(() => {
    // URLパラメータからユーザーを取得
    const params = new URLSearchParams(window.location.search);
    const user = params.get('user') as UserType;
    if (user === 'user1' || user === 'user2') {
      setCurrentUser(user);
      
      // User 2の場合は言語設定を読み込む
      if (user === 'user2') {
        const settings = UserDataManager.getUserSettings(user);
        setInterfaceLanguage(settings.interfaceLanguage);
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      const articles = UserDataManager.getArticles(currentUser);
      setSavedArticles(articles);
    }
  }, [currentUser]);

  const t = getTranslation(interfaceLanguage);

  const handleLanguageSwitch = (language: InterfaceLanguage) => {
    if (currentUser === 'user2') {
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

  const deleteArticle = (articleId: string) => {
    if (!currentUser) return;
    UserDataManager.deleteArticle(currentUser, articleId);
    const updatedArticles = UserDataManager.getArticles(currentUser);
    setSavedArticles(updatedArticles);
    if (selectedArticle?.id === articleId) {
      setSelectedArticle(null);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ja-JP');
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
                <span>戻る</span>
              </Link>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-green-600" />
                <h1 className="text-2xl font-bold text-gray-900">
                  保存した文章 - {currentUser === 'user1' ? 'スペイン語' : '日本語'}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* 左側: 保存した文章リスト */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                保存済み文章 ({savedArticles.length}件)
              </h3>
              
              {savedArticles.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>保存された文章がありません</p>
                  <Link href="/chat" className="text-indigo-600 hover:text-indigo-500 mt-2 inline-block">
                    チャットで文章を生成する
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {savedArticles.map((article, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedArticle === article
                          ? 'border-indigo-200 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedArticle(article)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{article.topic}</h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center space-x-1">
                              <Target className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-500">{article.level}レベル</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-500">
                                {formatDate(article.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteArticle(article.id);
                          }}
                          className="p-2 text-red-500 hover:text-red-700"
                          title="削除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右側: 選択された文章の詳細 */}
          <div className="space-y-6">
            {selectedArticle ? (
              <>
                {/* 文章表示 */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {selectedArticle.topic} ({selectedArticle.level}レベル)
                    </h3>
                    <p className="text-sm text-gray-500">
                      保存日時: {formatDate(selectedArticle.timestamp)}
                    </p>
                  </div>
                  <div className="prose prose-lg">
                    <p className="text-gray-800 leading-relaxed">
                      {selectedArticle.content.article}
                    </p>
                  </div>
                </div>

                {/* 単語帳 */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">重要単語</h3>
                  <div className="space-y-3">
                    {selectedArticle.content.vocabulary.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <span className="font-medium text-gray-900">{item.word}</span>
                          {item.reading && (
                            <span className="text-sm text-gray-500 ml-2">({item.reading})</span>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-600">{item.meaning}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-center h-96">
                <div className="text-center text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>左側から文章を選択してください</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
