'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { BookOpen, Users, MessageSquare, Archive, BarChart3, Globe, Database } from 'lucide-react';
import { UserDataManager, UserStats, InterfaceLanguage } from '@/lib/userDataManager';
import { getTranslation } from '@/lib/translations';

export default function Home() {
  const [selectedUser, setSelectedUser] = useState<'user1' | 'user2' | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [interfaceLanguage, setInterfaceLanguage] = useState<InterfaceLanguage>('spanish');
  const [migrationStatus, setMigrationStatus] = useState<string>('');
  const [isMigrating, setIsMigrating] = useState(false);
  const [showMigration, setShowMigration] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (selectedUser) {
        try {
          const stats = await UserDataManager.getUserStats(selectedUser);
          setUserStats(stats);
          
          // 両方のユーザーで言語設定を読み込む
          const settings = await UserDataManager.getUserSettings(selectedUser);
          setInterfaceLanguage(settings.interfaceLanguage);
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };

    loadUserData();
  }, [selectedUser]);

  // ローカルデータの存在チェック
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasLocalData = localStorage.getItem('savedArticles_user1') || localStorage.getItem('savedArticles_user2');
      setShowMigration(!!hasLocalData);
    }
  }, []);

  const t = getTranslation(interfaceLanguage);

  const handleLanguageSwitch = async (language: InterfaceLanguage) => {
    if (selectedUser) {
      setInterfaceLanguage(language);
      try {
        await UserDataManager.updateInterfaceLanguage(selectedUser, language);
      } catch (error) {
        console.error('Error updating language:', error);
      }
    }
  };

  const handleMigration = async () => {
    if (typeof window === 'undefined') return;
    
    setIsMigrating(true);
    setMigrationStatus('移行を開始しています...');

    try {
      // ローカルストレージのデータをチェック
      const user1Data = localStorage.getItem('savedArticles_user1');
      const user2Data = localStorage.getItem('savedArticles_user2');

      if (!user1Data && !user2Data) {
        setMigrationStatus('移行するデータが見つかりません。');
        setIsMigrating(false);
        return;
      }

      let migratedCount = 0;

      if (user1Data) {
        setMigrationStatus('NAMICHI のデータを移行中...');
        await UserDataManager.migrateFromLocalStorage('user1');
        const articles = JSON.parse(user1Data);
        migratedCount += articles.length;
      }

      if (user2Data) {
        setMigrationStatus('JOSÉ のデータを移行中...');
        await UserDataManager.migrateFromLocalStorage('user2');
        const articles = JSON.parse(user2Data);
        migratedCount += articles.length;
      }

      setMigrationStatus(`移行完了！${migratedCount}件の記事を移行しました。`);
      setShowMigration(false);
      
      // 選択されたユーザーのデータを再読み込み
      if (selectedUser) {
        const stats = await UserDataManager.getUserStats(selectedUser);
        setUserStats(stats);
      }
    } catch (error) {
      console.error('Migration error:', error);
      setMigrationStatus(`移行中にエラーが発生しました: ${error}`);
    } finally {
      setIsMigrating(false);
    }
  };

  const getUserInfo = (userId: 'user1' | 'user2') => {
    if (userId === 'user1') {
      return {
        name: 'NAMICHI',
        description: 'スペイン語学習アカウント',
        language: 'スペイン語',
        color: 'indigo'
      };
    } else {
      return {
        name: 'JOSÉ',
        description: selectedUser === 'user2' && interfaceLanguage === 'spanish'
          ? 'Cuenta de Aprendizaje de Japonés'
          : selectedUser === 'user2' && interfaceLanguage === 'english'
          ? 'Japanese Learning Account'
          : '日本語学習アカウント',
        language: selectedUser === 'user2' && interfaceLanguage === 'spanish'
          ? 'Japonés'
          : selectedUser === 'user2' && interfaceLanguage === 'english'
          ? 'Japanese'
          : '日本語',
        color: 'green'
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                {t.home.title}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* 言語切り替えボタン（ユーザー選択後に表示） */}
              {selectedUser && (
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
              )}
              <span className="text-sm text-gray-500">
                {selectedUser ? getUserInfo(selectedUser).language : 'スペイン語 ⇄ 日本語'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 移行コンポーネント */}
        {showMigration && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <Database className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  データベース移行
                </h3>
                <p className="text-blue-700 mb-4">
                  ローカルに保存されたデータをデータベースに移行します。
                  移行後は、ページを更新しても、他のデバイスからでもデータにアクセスできます。
                </p>
                
                {migrationStatus && (
                  <div className="mb-4 p-3 bg-white rounded border">
                    <p className="text-sm text-gray-700">{migrationStatus}</p>
                  </div>
                )}

                <button
                  onClick={handleMigration}
                  disabled={isMigrating}
                  className={`px-4 py-2 rounded font-medium ${
                    isMigrating
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isMigrating ? '移行中...' : 'データを移行する'}
                </button>
              </div>
            </div>
          </div>
        )}

        {!selectedUser ? (
          /* ユーザー選択画面 */
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              ユーザーを選択してください
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <button
                onClick={() => setSelectedUser('user1')}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-indigo-200"
              >
                <Users className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">NAMICHI</h3>
                <p className="text-gray-600">スペイン語学習アカウント</p>
                <p className="text-sm text-indigo-600 mt-2">DELE A1-C2 レベル対応</p>
              </button>
              
              <button
                onClick={() => setSelectedUser('user2')}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-green-200"
              >
                <Users className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">JOSÉ</h3>
                <p className="text-gray-600">日本語学習アカウント</p>
                <p className="text-sm text-green-600 mt-2">JLPT N5-N1 レベル対応</p>
              </button>
            </div>
          </div>
        ) : (
          /* 選択されたユーザーのダッシュボード */
          <div>
            {/* ユーザー情報ヘッダー */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className={`h-4 w-4 rounded-full ${selectedUser === 'user1' ? 'bg-indigo-600' : 'bg-green-600'}`}></div>
                <span className="font-medium text-gray-900">
                  {getUserInfo(selectedUser).name} - {selectedUser === 'user1' ? 
                    `${getUserInfo(selectedUser).language}学習` : 
                    `${getUserInfo(selectedUser).language} ${selectedUser === 'user2' && interfaceLanguage === 'spanish' ? 'Aprendizaje' : selectedUser === 'user2' && interfaceLanguage === 'english' ? 'Learning' : '学習'}`
                  }
                </span>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                {selectedUser === 'user1' ? 'ユーザー変更' : 
                  selectedUser === 'user2' && interfaceLanguage === 'spanish' ? 'Cambiar Usuario' :
                  selectedUser === 'user2' && interfaceLanguage === 'english' ? 'Change User' : 'ユーザー変更'
                }
              </button>
            </div>

            {/* 機能メニュー */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <MessageSquare className="h-8 w-8 text-indigo-600" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedUser === 'user1' ? 'AI学習チャット' : 
                      interfaceLanguage === 'spanish' ? 'Chat de Aprendizaje AI' :
                      interfaceLanguage === 'english' ? 'AI Learning Chat' : 'AI学習チャット'}
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  {selectedUser === 'user1' ? 
                    `興味のあるトピックについて、指定したレベルで${getUserInfo(selectedUser).language}の文章を生成` :
                    interfaceLanguage === 'spanish' ? 
                      `Genera artículos en ${getUserInfo(selectedUser).language} sobre temas de interés en el nivel especificado` :
                    interfaceLanguage === 'english' ? 
                      `Generate ${getUserInfo(selectedUser).language} articles on topics of interest at the specified level` :
                      `興味のあるトピックについて、指定したレベルで${getUserInfo(selectedUser).language}の文章を生成`
                  }
                </p>
                <Link href={`/chat?user=${selectedUser}`}>
                  <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                    {selectedUser === 'user1' ? 'チャットを開始' :
                      interfaceLanguage === 'spanish' ? 'Comenzar Chat' :
                      interfaceLanguage === 'english' ? 'Start Chat' : 'チャットを開始'}
                  </button>
                </Link>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <Archive className="h-8 w-8 text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedUser === 'user1' ? '保存した文章' :
                      interfaceLanguage === 'spanish' ? 'Artículos Guardados' :
                      interfaceLanguage === 'english' ? 'Saved Articles' : '保存した文章'}
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  {selectedUser === 'user1' ? '過去に生成した文章を確認・復習' :
                    interfaceLanguage === 'spanish' ? 'Revisar y estudiar artículos generados anteriormente' :
                    interfaceLanguage === 'english' ? 'Review and study previously generated articles' : '過去に生成した文章を確認・復習'}
                </p>
                <Link href={`/saved?user=${selectedUser}`}>
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                    {selectedUser === 'user1' ? '文章を確認' :
                      interfaceLanguage === 'spanish' ? 'Ver Artículos' :
                      interfaceLanguage === 'english' ? 'View Articles' : '文章を確認'}
                  </button>
                </Link>
              </div>

              {/* 統計情報 */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedUser === 'user1' ? 'ユーザー統計' :
                      interfaceLanguage === 'spanish' ? 'Estadísticas de Usuario' :
                      interfaceLanguage === 'english' ? 'User Statistics' : 'ユーザー統計'}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{userStats?.totalArticles || 0}</div>
                    <div className="text-sm text-gray-600">
                      {selectedUser === 'user1' ? '生成文章数' :
                        interfaceLanguage === 'spanish' ? 'Artículos Generados' :
                        interfaceLanguage === 'english' ? 'Generated Articles' : '生成文章数'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{userStats?.favoriteTopics?.length || 0}</div>
                    <div className="text-sm text-gray-600">
                      {selectedUser === 'user1' ? 'お気に入りトピック' :
                        interfaceLanguage === 'spanish' ? 'Temas Favoritos' :
                        interfaceLanguage === 'english' ? 'Favorite Topics' : 'お気に入りトピック'}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedUser === 'user1' ? '人気トピック:' :
                      interfaceLanguage === 'spanish' ? 'Temas Populares:' :
                      interfaceLanguage === 'english' ? 'Popular Topics:' : '人気トピック:'}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(userStats?.favoriteTopics || []).slice(0, 3).map((topic, index) => (
                      <span key={index} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
