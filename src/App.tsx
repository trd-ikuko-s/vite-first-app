// App.tsx

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client.js';
import { WavRecorder, WavStreamPlayer } from './lib/wavtools/index.js';
import './App.scss';
import ErrorBoundary from './ErrorBoundary';
import Header from './pages/Header';
import Setting from './pages/Setting';
import Chatpage from './pages/Chatpage';
import ConversationHistory from './pages/ConversationHistory';

function App() {
  // Setting画面の状態変数
  const [isSettingVisible, setIsSettingVisible] = useState(false);
  // APIとの接続確認
  const [isConnected, setIsConnected] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);

  const isFirstRender = useRef(true);

  // 会話履歴を管理する状態変数
  const [conversationHistory, setConversationHistory] = useState(() => {
    const storedHistory = localStorage.getItem('conversation-history');
    if (storedHistory) {
      const parsedHistory = JSON.parse(storedHistory);
      if (parsedHistory && Array.isArray(parsedHistory)) {
        console.log('Loaded conversationHistory from localStorage:', parsedHistory);
        return parsedHistory;
      }
    }
    return [];
  });
  
  // 現在のセッションインデックス
  const [currentSessionIndex, setCurrentSessionIndex] = useState(() => {
    if (conversationHistory.length > 0) {
      return conversationHistory.length - 1;
    } else {
      return 0;
    }
  });

  // タイトルを保存するための状態変数を追加
  const [conversationTitles, setConversationTitles] = useState(() => {
    const storedTitles = localStorage.getItem('conversation-titles');
    if (storedTitles) {
      const parsedTitles = JSON.parse(storedTitles);
      if (parsedTitles && Array.isArray(parsedTitles)) {
        return parsedTitles;
      }
    }
    return [];
  });

  // タイトルの生成フラグ
  const [isTitleGenerated, setIsTitleGenerated] = useState<boolean[]>([]);


  // メイン画面に表示される会話内容
  const [items, setItems] = useState<ItemType[]>([]);
  // 会話履歴の表示状態
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  // セッティング画面の表示
  const toggleSetting = () => {
    setIsSettingVisible((prev) => !prev);
  };

  // 履歴表示のトグル関数
  const toggleHistory = () => {
    setIsHistoryVisible((prev) => !prev);
  };

  // APIとの接続関連
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const clientRef = useRef<RealtimeClient>(
    new RealtimeClient({
      apiKey: apiKey,
      dangerouslyAllowAPIKeyInBrowser: true,
    })
  );

  const wavRecorderRef = useRef<WavRecorder>(
    new WavRecorder({ sampleRate: 24000 })
  );
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(
    new WavStreamPlayer({ sampleRate: 24000 })
  );

  // currentSessionIndex の値を確認
  useEffect(() => {
    console.log('Current session index:', currentSessionIndex);
    console.log('Conversation history length:', conversationHistory.length);
  }, [currentSessionIndex, conversationHistory]);

  // 右クリック無効
  useEffect(() => {
    const handleContextMenu = (e: any) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // 会話履歴を localStorage に保存
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // 初回レンダリング時は保存しない
    }
  
    // 会話履歴を localStorage に保存
    const serializedHistory = conversationHistory.map((session) =>
      session.map((item) => ({
        id: item.id,
        role: item.role,
        text: item.text,
        timestamp: item.timestamp,
      }))
    );
  
    try {
      localStorage.setItem('conversation-history', JSON.stringify(serializedHistory));
      console.log('Saving conversationHistory:', conversationHistory);
    } catch (error) {
      console.error('Failed to save conversation history to localStorage:', error);
    }
  }, [conversationHistory]);
  
  // conversationTitles が更新されたらローカルストレージに保存
  useEffect(() => {
    try {
      localStorage.setItem('conversation-titles', JSON.stringify(conversationTitles));
    } catch (error) {
      console.error('Failed to save conversation titles to localStorage:', error);
    }
  }, [conversationTitles]);

  // items が更新されたら、現在のセッションを更新
  useEffect(() => {
    if (items.length === 0) {
      return;
    }
  
    // 最初の AI の返答を検出
    const firstAssistantIndex = items.findIndex(
      (item) => item.role === 'assistant' && item.status === 'completed'
    );

    // タイトルが未生成であり、AI の返答が完了している場合にのみ生成
    if (
      firstAssistantIndex !== -1 &&
      !isTitleGenerated[currentSessionIndex]
    ) {
      const assistantMessage =
        items[firstAssistantIndex].formatted?.transcript || '';

      // 最初のユーザー発言を取得
      const firstUserIndex = items.findIndex((item) => item.role === 'user');
      const userMessage =
        items[firstUserIndex]?.formatted?.transcript || '';

      // タイトルを生成
      generateConversationTitle(userMessage, assistantMessage);

      // タイトル生成フラグを更新
      setIsTitleGenerated((prevFlags) => {
        const newFlags = [...prevFlags];
        newFlags[currentSessionIndex] = true;
        return newFlags;
      });
    }
    // 会話履歴の更新処理
    setConversationHistory((prevHistory) => {
      // items が空の場合は何もしない
      if (items.length === 0) {
        return prevHistory;
      }

      const newHistory = [...prevHistory];

      // items から不要なデータを除外
      const sanitizedItems = items.map((item) => ({
        id: item.id,
        role: item.role || '',
        text: item.formatted?.transcript || '',
        timestamp: new Date().toISOString(),
      }));

      newHistory[currentSessionIndex] = sanitizedItems;

      return newHistory;
    });
  }, [items]);

  // タイトルを生成する関数
  const generateConversationTitle = useCallback(
    async (userMessage: string, assistantMessage: string) => {
      // タイトル文字列のクリーンアップ関数を作成
      function cleanTitle(title: string): string {
        // 前後の引用符を削除
        title = title.trim();
        if (title.startsWith('"') && title.endsWith('"')) {
          title = title.substring(1, title.length - 1);
        }
      
        // エスケープ文字を除去
        title = title.replace(/\\/g, '');
      
        return title;
      }

      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
      const prompt = `以下のユーザーとAIの会話内容をもとに、短くてわかりやすい会話のタイトルを考えてください。タイトルのみを出力してください。
  
ユーザーの発言:
${userMessage}

AIの返答:
${assistantMessage}

タイトル:`;
  
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 100,
            n: 1,
            stop: null,
            temperature: 0.7,
          }),
        });
  
        const data = await response.json();
        const titleRaw = data.choices[0].message.content.trim();
        const title = cleanTitle(titleRaw);

        // タイトルを保存
        setConversationTitles((prevTitles) => {
          const newTitles = [...prevTitles];
          newTitles[currentSessionIndex] = title;
          return newTitles;
        });
  
        console.log('Generated conversation title:', title);
      } catch (error) {
        console.error('Failed to generate conversation title:', error);
      }
    },
    [currentSessionIndex]
  );

  // セッション切断
  const disconnectConversation = useCallback(async () => {
    setIsConnected(false);

    const client = clientRef.current;
    client.disconnect();

    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.end();

    const wavStreamPlayer = wavStreamPlayerRef.current;
    await wavStreamPlayer.interrupt();
  }, []);

  // セッション再開
  const startConversation = useCallback(async () => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    // 状態変数を設定
    setItems(client.conversation.getItems());
    setIsPreparing(true);

    // マイクに接続
    await wavRecorder.begin();
    console.log('connect to microphone');

    // オーディオ出力に接続
    await wavStreamPlayer.connect();

    // Realtime APIに接続
    await client.connect();
    console.log('connect to OpenAI');

    setIsPreparing(false);
    setIsConnected(true);
  }, []);

  // 新しいセッションを開始する関数
  const startNewSession = useCallback(async () => {
    // 現在のセッションを終了
    await disconnectConversation();
  
    // items をクリアする前に currentSessionIndex を更新
    setCurrentSessionIndex((prevIndex) => {
      const newIndex = prevIndex + 1;
      // 会話履歴に新しい空のセッションを追加
      setConversationHistory((prevHistory) => [...prevHistory, []]);
      return newIndex;
    });
  
    // items をクリア
    setItems([]);
  
    // 新しいセッションを開始
    await startConversation();
  }, [disconnectConversation, startConversation]);  

  return (
    <ErrorBoundary>
    <>
      <Header
      onSettingClick={toggleSetting}
      onHistoryClick={toggleHistory}
      toggleHistory={toggleHistory}
      />
      <Setting
        isVisible={isSettingVisible}
        onClose={toggleSetting}
        clientRef={clientRef}
        startNewSession={startNewSession}
      />
      <Chatpage
      clientRef={clientRef}
      wavRecorderRef={wavRecorderRef}
      wavStreamPlayerRef={wavStreamPlayerRef}
      disconnectConversation={disconnectConversation}
      isConnected={isConnected}
      setIsConnected={setIsConnected}
      items={items}
      setItems={setItems}
      isPreparing={isPreparing}
      setIsPreparing={setIsPreparing}
      />
      {isHistoryVisible && (
        <ConversationHistory
          conversationHistory={conversationHistory}
          conversationTitles={conversationTitles}
          onClose={toggleHistory}
        />
      )}
    </>
    </ErrorBoundary>
  );
}

export default App;
