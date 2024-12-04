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
  

  // items が更新されたら、現在のセッションを更新
  useEffect(() => {
    if (items.length === 0) {
      // items が空の場合は何もしない
      return;
    }
  
    setConversationHistory((prevHistory) => {
      const newHistory = [...prevHistory];
  
      // items から不要なデータを除外
      const sanitizedItems = items.map((item) => ({
        id: item.id,
        role: item.role || '',
        text: item.formatted?.text || item.formatted.transcript || '',
        timestamp: new Date().toISOString(),
      }));
  
      newHistory[currentSessionIndex] = sanitizedItems;
  
      console.log('Updating conversationHistory with sanitizedItems:', sanitizedItems);
  
      return newHistory;
    });
  }, [items]);  

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
          onClose={toggleHistory}
        />
      )}
    </>
    </ErrorBoundary>
  );
}

export default App;
