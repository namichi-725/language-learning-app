import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function POST(request: NextRequest) {
  try {
    const { topic, level } = await request.json();
    console.log('Japanese API called with:', { topic, level });

    const prompt = `以下の要件で文章と単語リストを作成してください。

# 要件
- トピック: ${topic}
- 言語: 日本語
- レベル: ${level}（日本語能力試験基準）
- 目的: 日本語学習

# 重要な指示
以下のJSON形式で回答してください。マークダウンのコードブロックは使用せず、純粋なJSONのみを返してください。

{
  "article": "ここに${level}レベルの日本語で書かれた${topic}についての文章を入れてください。文章は400-600文字程度で、学習に適した内容にしてください。漢字にはふりがなを適切につけてください。複数の段落に分けて、読みやすい構成にしてください。",
  "vocabulary": [
    { "word": "重要な単語1", "meaning": "その単語の意味や使い方の説明1", "reading": "よみかた1" },
    { "word": "重要な単語2", "meaning": "その単語の意味や使い方の説明2", "reading": "よみかた2" },
    { "word": "重要な単語3", "meaning": "その単語の意味や使い方の説明3", "reading": "よみかた3" },
    { "word": "重要な単語4", "meaning": "その単語の意味や使い方の説明4", "reading": "よみかた4" },
    { "word": "重要な単語5", "meaning": "その単語の意味や使い方の説明5", "reading": "よみかた5" },
    { "word": "重要な単語6", "meaning": "その単語の意味や使い方の説明6", "reading": "よみかた6" },
    { "word": "重要な単語7", "meaning": "その単語の意味や使い方の説明7", "reading": "よみかた7" }
  ]
}`;

    let retries = 3;
    while (retries > 0) {
      try {
        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();
        console.log('Japanese API response received successfully');

        // Markdownのコードブロックを除去してJSONを抽出
        let cleanedResponse = responseText;
        
        // ```json と ``` を除去
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          cleanedResponse = jsonMatch[1];
        }
        
        // 先頭と末尾の空白文字や改行を除去
        cleanedResponse = cleanedResponse.trim();
        
        // JSONレスポンスをパースして返す
        const parsedResponse = JSON.parse(cleanedResponse);
        
        return NextResponse.json(parsedResponse);
      } catch (apiError: unknown) {
        const err = apiError as { status?: number; message?: string };
        console.error(`Japanese API attempt failed (${4 - retries}/3):`, apiError);
        
        // 503エラーまたはService Unavailableの場合はリトライ
        if (err.status === 503 || 
            err.message?.includes('Service Unavailable') ||
            err.message?.includes('503')) {
          retries--;
          if (retries > 0) {
            console.log(`Retrying Japanese API in 3 seconds... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            continue;
          }
        }
        throw apiError;
      }
    }
    
    throw new Error('Max retries exceeded for Japanese API');
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    console.error('Error generating Japanese content:', error);
    
    // 503 Service Unavailableエラーの特別処理
    if (err.status === 503 || 
        err.message?.includes('Service Unavailable') ||
        err.message?.includes('503')) {
      return NextResponse.json(
        { 
          error: 'Gemini APIが一時的に混雑しています。少し時間をおいてから再試行してください。',
          details: 'Service temporarily unavailable'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: '日本語コンテンツの生成に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
