import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function POST(request: NextRequest) {
  try {
    const { topic, level } = await request.json();

    const prompt = `以下の要件で文章と単語リストを作成してください。

# 要件
- トピック: ${topic}
- 言語: スペイン語
- レベル: ${level}
- 目的: 語学学習

# 重要な指示
以下のJSON形式で回答してください。マークダウンのコードブロックは使用せず、純粋なJSONのみを返してください。

{
  "article": "ここに${level}レベルのスペイン語で書かれた${topic}についての文章を入れてください。文章は200-300語程度で、学習に適した内容にしてください。",
  "vocabulary": [
    { "word": "重要な単語1", "meaning": "日本語の意味1" },
    { "word": "重要な単語2", "meaning": "日本語の意味2" },
    { "word": "重要な単語3", "meaning": "日本語の意味3" },
    { "word": "重要な単語4", "meaning": "日本語の意味4" },
    { "word": "重要な単語5", "meaning": "日本語の意味5" }
  ]
}`;

    let retries = 3;
    while (retries > 0) {
      try {
        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();

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
      } catch (apiError: any) {
        console.error(`Spanish API attempt failed (${4 - retries}/3):`, apiError);
        
        // 503エラーまたはService Unavailableの場合はリトライ
        if (apiError.status === 503 || 
            apiError.message?.includes('Service Unavailable') ||
            apiError.message?.includes('503')) {
          retries--;
          if (retries > 0) {
            console.log(`Retrying Spanish API in 3 seconds... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            continue;
          }
        }
        throw apiError;
      }
    }
    
    throw new Error('Max retries exceeded for Spanish API');
  } catch (error: any) {
    console.error('Error generating content:', error);
    console.error('Response text was:', error instanceof SyntaxError ? 'Invalid JSON format' : 'Unknown error');
    
    // 503 Service Unavailableエラーの特別処理
    if (error.status === 503 || 
        error.message?.includes('Service Unavailable') ||
        error.message?.includes('503')) {
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
        error: 'コンテンツの生成に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
