import React, { useEffect, useState, useCallback, useRef } from 'react';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client.js';
import { WavRecorder, WavStreamPlayer } from './lib/wavtools/index.js';
import './App.scss';
import Header from './pages/Header';
import Setting from './pages/Setting';
import Chatpage from './pages/Chatpage';

function App() {
  // Setting画面の状態変数
  const [isSettingVisible, setIsSettingVisible] = useState(false);
  // APIとの接続確認
  const [isConnected, setIsConnected] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  // メイン画面に表示される会話内容
  const [items, setItems] = useState<ItemType[]>([]);
  // セッティング画面の表示
  const toggleSetting = () => {
    setIsSettingVisible((prev) => !prev);
  };

  // APIとの接続関連
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  // clientRefをAppコンポーネントで定義（または必要に応じて変更）
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

  //右クリック無効
  useEffect(() => {
    const handleContextMenu = (e:any) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // // セッション切断
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


  return (
    <>
      <Header onSettingClick={toggleSetting}/>
      <Setting
        isVisible={isSettingVisible}
        onClose={toggleSetting}
        clientRef={clientRef}
        disconnectConversation={disconnectConversation}
        startConversation={startConversation}
        setIsConnected={setIsConnected}
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
    </>
  )
}

export default App
