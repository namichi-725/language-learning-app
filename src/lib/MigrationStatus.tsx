import { useState } from 'react';
import { UserDataManager } from './userDataManagerSupabase';
import type { UserType } from './userDataManagerSupabase';

interface MigrationStatusProps {
  onMigrationComplete?: () => void;
}

export function MigrationStatus({ onMigrationComplete }: MigrationStatusProps) {
  const [migrating, setMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<string>('');

  const handleMigration = async () => {
    if (typeof window === 'undefined') return;
    
    setMigrating(true);
    setMigrationStatus('移行を開始しています...');

    try {
      // ローカルストレージのデータをチェック
      const user1Data = localStorage.getItem('savedArticles_user1');
      const user2Data = localStorage.getItem('savedArticles_user2');

      if (!user1Data && !user2Data) {
        setMigrationStatus('移行するデータが見つかりません。');
        setMigrating(false);
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
      
      if (onMigrationComplete) {
        onMigrationComplete();
      }
    } catch (error) {
      console.error('Migration error:', error);
      setMigrationStatus(`移行中にエラーが発生しました: ${error}`);
    } finally {
      setMigrating(false);
    }
  };

  // ローカルストレージにデータがあるかチェック
  const hasLocalData = typeof window !== 'undefined' && 
    (localStorage.getItem('savedArticles_user1') || localStorage.getItem('savedArticles_user2'));

  if (!hasLocalData) {
    return null; // ローカルデータがない場合は表示しない
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-2">
        データ移行
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
        disabled={migrating}
        className={`px-4 py-2 rounded font-medium ${
          migrating
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {migrating ? '移行中...' : 'データを移行する'}
      </button>
    </div>
  );
}
