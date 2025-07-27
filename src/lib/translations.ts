// 言語別翻訳データ
export type InterfaceLanguage = 'spanish' | 'english' | 'japanese';

interface Translations {
  // ホームページ
  home: {
    title: string;
    selectUser: string;
    user1Description: string;
    user2Description: string;
    userStats: string;
    totalArticles: string;
    favoriteTopics: string;
    recentActivity: string;
    startLearning: string;
    viewSaved: string;
  };
  
  // チャットページ
  chat: {
    backToHome: string;
    levelSelection: string;
    topicPlaceholder: string;
    send: string;
    generating: string;
    generatedArticle: string;
    importantWords: string;
    vocabulary: string;
    meaning: string;
    copy: string;
    save: string;
    startMessage: string;
    errorMessage: string;
    apiOverloadMessage: string;
    contentSaved: string;
  };
  
  // 保存済みページ
  saved: {
    backToHome: string;
    savedArticles: string;
    noArticles: string;
    delete: string;
    confirmDelete: string;
  };
  
  // 共通
  common: {
    languageSwitch: string;
    spanish: string;
    english: string;
    japanese: string;
  };
}

export const translations: Record<InterfaceLanguage, Translations> = {
  spanish: {
    home: {
      title: 'Aplicación de Aprendizaje de Idiomas',
      selectUser: 'Seleccionar Usuario',
      user1Description: 'NAMICHI - Aprendizaje de Español (DELE)',
      user2Description: 'JOSÉ - Aprendizaje de Japonés (JLPT)',
      userStats: 'Estadísticas del Usuario',
      totalArticles: 'Total de Artículos',
      favoriteTopics: 'Temas Favoritos',
      recentActivity: 'Actividad Reciente',
      startLearning: 'Comenzar Aprendizaje',
      viewSaved: 'Ver Guardados',
    },
    
    chat: {
      backToHome: 'Volver al Inicio',
      levelSelection: 'Selección de Nivel',
      topicPlaceholder: 'Ej: viajes, cocina, deportes, películas...',
      send: 'Enviar',
      generating: 'Generando...',
      generatedArticle: 'Artículo Generado',
      importantWords: 'Palabras Importantes',
      vocabulary: 'Vocabulario + Lectura',
      meaning: 'Significado',
      copy: 'Copiar',
      save: 'Guardar',
      startMessage: '¡Ingresa un tema de tu interés para comenzar a aprender!',
      errorMessage: 'Ocurrió un error. Por favor, intenta de nuevo.',
      apiOverloadMessage: 'El servicio de IA está temporalmente saturado. Espera 30 segundos e intenta de nuevo.',
      contentSaved: '¡Artículo guardado!',
    },
    
    saved: {
      backToHome: 'Volver al Inicio',
      savedArticles: 'Artículos Guardados',
      noArticles: 'No hay artículos guardados aún.',
      delete: 'Eliminar',
      confirmDelete: '¿Estás seguro de que quieres eliminar este artículo?',
    },
    
    common: {
      languageSwitch: 'Cambiar Idioma',
      spanish: 'Español',
      english: 'English',
      japanese: '日本語',
    },
  },
  
  english: {
    home: {
      title: 'Language Learning App',
      selectUser: 'Select User',
      user1Description: 'NAMICHI - Spanish Learning (DELE)',
      user2Description: 'JOSÉ - Japanese Learning (JLPT)',
      userStats: 'User Statistics',
      totalArticles: 'Total Articles',
      favoriteTopics: 'Favorite Topics',
      recentActivity: 'Recent Activity',
      startLearning: 'Start Learning',
      viewSaved: 'View Saved',
    },
    
    chat: {
      backToHome: 'Back to Home',
      levelSelection: 'Level Selection',
      topicPlaceholder: 'e.g: travel, cooking, sports, movies...',
      send: 'Send',
      generating: 'Generating...',
      generatedArticle: 'Generated Article',
      importantWords: 'Important Words',
      vocabulary: 'Vocabulary + Reading',
      meaning: 'Meaning',
      copy: 'Copy',
      save: 'Save',
      startMessage: 'Enter a topic of interest to start learning!',
      errorMessage: 'An error occurred. Please try again.',
      apiOverloadMessage: 'AI service is temporarily overloaded. Wait 30 seconds and try again.',
      contentSaved: 'Article saved!',
    },
    
    saved: {
      backToHome: 'Back to Home',
      savedArticles: 'Saved Articles',
      noArticles: 'No articles saved yet.',
      delete: 'Delete',
      confirmDelete: 'Are you sure you want to delete this article?',
    },
    
    common: {
      languageSwitch: 'Switch Language',
      spanish: 'Español',
      english: 'English',
      japanese: '日本語',
    },
  },
  
  japanese: {
    home: {
      title: '言語学習アプリ',
      selectUser: 'ユーザーを選択',
      user1Description: 'NAMICHI - スペイン語学習（DELE）',
      user2Description: 'JOSÉ - 日本語学習（JLPT）',
      userStats: 'ユーザー統計',
      totalArticles: '総記事数',
      favoriteTopics: 'お気に入りトピック',
      recentActivity: '最近のアクティビティ',
      startLearning: '学習開始',
      viewSaved: '保存済み表示',
    },
    
    chat: {
      backToHome: 'ホームに戻る',
      levelSelection: 'レベル選択',
      topicPlaceholder: '例：旅行、料理、スポーツ、映画...',
      send: '送信',
      generating: '生成中...',
      generatedArticle: '生成された記事',
      importantWords: '重要な単語',
      vocabulary: '語彙 + 読解',
      meaning: '意味',
      copy: 'コピー',
      save: '保存',
      startMessage: '興味のあるトピックを入力して学習を始めましょう！',
      errorMessage: 'エラーが発生しました。もう一度お試しください。',
      apiOverloadMessage: 'AIサービスが一時的に混雑しています。30秒待ってから再試行してください。',
      contentSaved: '記事が保存されました！',
    },
    
    saved: {
      backToHome: 'ホームに戻る',
      savedArticles: '保存済み記事',
      noArticles: 'まだ記事が保存されていません。',
      delete: '削除',
      confirmDelete: 'この記事を削除してもよろしいですか？',
    },
    
    common: {
      languageSwitch: '言語切り替え',
      spanish: 'Español',
      english: 'English',
      japanese: '日本語',
    },
  },
};

export const getTranslation = (language: InterfaceLanguage): Translations => {
  return translations[language] || translations.spanish;
};
