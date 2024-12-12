/**
 * fileToBase64関数
 * --------------------------
 * 解析したい画像のFileオブジェクトを受け取り、Base64化します。
 * 
 * @param file - 解析したい画像のFileオブジェクト
 */

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Base64変換に失敗しました'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
