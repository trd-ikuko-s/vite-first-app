import OpenAI from "openai";

/**
 * recognizeImageWithGPT4V関数
 * --------------------------
 * 指定された画像URLをGPT-4 Vで解析し、画像に何が写っているかを説明するテキストを取得します。
 * 
 * @param imageUrl - 解析したい画像のURL
 * @param apiKey - OpenAIのAPIキー
 * @returns 画像の内容に関する説明テキスト
 */
export async function recognizeImageWithGPT4V(imageDataUrl: string, apiKey: string): Promise<string> {
  // OpenAIクライアントを初期化
  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true,
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "この画像には何が映っているか日本語で説明して" },
            {
              type: "image_url",
              image_url: {
                url: imageDataUrl, 
              },
            },
          ],
        },
      ],
    });

    // response.choices[0].message.content に回答テキストがある想定
    const firstChoice = response.choices[0];
    if (!firstChoice || !firstChoice.message || typeof firstChoice.message.content !== "string") {
      throw new Error("GPT-4 Vから適切な応答を取得できませんでした。");
    }

    return firstChoice.message.content;
  } catch (error) {
    console.error("画像認識中にエラーが発生しました:", error);
    throw error;
  }
}
