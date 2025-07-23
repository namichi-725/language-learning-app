// 必要なパッケージを読み込む
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config(); // .env ファイルから環境変数を読み込む
const cors = require('cors');

// Expressアプリを初期化
const app = express();
app.use(express.json()); // JSON形式のリクエストを扱えるようにする
app.use(cors()); // フロントエンドからのアクセスを許可する

// Gemini AIを初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// '/generate' というURLへのリクエストを処理する部分
app.post('/generate', async (req, res) => {
    try {
        const { topic, level } = req.body; // フロントエンドから送られてきたトピックとレベルを取得

        // AIへの指示（プロンプト）
        const prompt = `
        以下の要件で文章と単語リストを作成してください。

        # 要件
        - トピック: ${topic}
        - 言語: スペイン語
        - レベル: ${level}
        - 目的: 語学学習

        # 出力形式
        必ず以下のJSON形式で、キーは "article" と "vocabulary" としてください。
        {
          "article": "ここに生成したスペイン語の文章を入れてください。",
          "vocabulary": [
            { "word": "単語1", "meaning": "日本語の意味1" },
            { "word": "単語2", "meaning": "日本語の意味2" },
            { "word": "単語3", "meaning": "日本語の意味3" }
          ]
        }
        `;

        // AIにリクエストを送信
        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();

        // AIからの返答をフロントエンドに送る
        res.json(JSON.parse(responseText));

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'AIの応答取得中にエラーが発生しました。' });
    }
});

// サーバーを起動
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`サーバーがポート${PORT}で起動しました。 http://localhost:${PORT}`);
});