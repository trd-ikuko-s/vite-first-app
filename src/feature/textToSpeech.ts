// textToSpeech.ts

import OpenAI from "openai";

/**
 * textToSpeech関数
 * ---------------
 * OpenAIのText-to-Speechモデルを使って、入力されたテキストから音声データ(MP3相当)を生成します。
 * 生成された音声はArrayBufferとして受け取り、Blobに変換して返します。
 * 
 * @param text - 音声化したいテキスト
 * @param apiKey - OpenAIのAPIキー
 * @param voice - 使用したい声の種類(デフォルト: 'alloy')
 * 
 * @returns 音声データのBlobを返します。
 * 
 */
export async function textToSpeech(
  text: string, 
  apiKey: string, 
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" = "alloy"
): Promise<Blob> {
  // OpenAIクライアントを初期化
  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true,
  });

  try {
    // OpenAIのText-to-Speechエンドポイントにリクエスト
    const mp3Response = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice,
      input: text,
    });

    // mp3ResponseはOpenAIライブラリ特有のレスポンスで、
    // arrayBuffer()メソッドが使える
    const arrayBuffer = await mp3Response.arrayBuffer();
    
    // ArrayBufferからBlobを生成（MP3データとして扱える）
    const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
    return blob;
  } catch (error) {
    console.error("textToSpeechでエラーが発生しました:", error);
    throw error; 
  }
}
