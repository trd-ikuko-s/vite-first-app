import { useEffect, useRef, useCallback, useState, ReactNode } from 'react';

import { RealtimeClient } from '@openai/realtime-api-beta';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client.js';
import { WavRecorder, WavStreamPlayer } from '../lib/wavtools/index.js';
// import { instructions } from '../utils/conversation_config.js';
// import { WavRenderer } from '../utils/wav_renderer';

import {instructions} from '../utils/conversation_config';
import camera from '../assets/camera.svg';
import sound from '../assets/sound.svg';
import keyboard from '../assets/keyboard.svg';
import Stack from 'react-bootstrap/Stack';
import userIcon from '../assets/user-icon.png';
import assistantIcon from '../assets/assistant-icon.png';


function Chatpage() {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const wavRecorderRef = useRef<WavRecorder>(
    new WavRecorder({ sampleRate: 24000 })
  );
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(
    new WavStreamPlayer({ sampleRate: 24000 })
  );
  const clientRef = useRef<RealtimeClient>(
    new RealtimeClient({
        apiKey: apiKey,
        dangerouslyAllowAPIKeyInBrowser: true,
      }
    )
  );

  // 必要な変数一覧
  const [items, setItems] = useState<ItemType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isPreparing, setIsPreparing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [canPushToTalk, setCanPushToTalk] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  // //ボタンクリック時のアクション一覧

  // //セッション開始
  const connectConversation = useCallback(async () => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    // Set state variables
    setItems(client.conversation.getItems());
    setIsPreparing(true);

    // Connect to microphone
    await wavRecorder.begin();
    console.log('connect to microphone');

    // Connect to audio output
    await wavStreamPlayer.connect();

    // Connect to realtime API
    await client.connect();
    console.log('connect to OpenAI');

    // testメッセージなのでコメントアウト
    // client.sendUserMessageContent([
    //   {
    //     type: `input_text`,
    //     text: `Hello!`,
    //     // text: `For testing purposes, I want you to list ten car brands. Number each item, e.g. "one (or whatever number you are one): the item name".`
    //   },
    // ]);

    // 音声検知モードにした場合
    if (client.getTurnDetectionType() === 'server_vad') {
      await wavRecorder.record((data) => client.appendInputAudio(data.mono));
    }
    setIsPreparing(false);
    setIsConnected(true);
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

  // push-to-talk modeでの録音開始
  const startRecording = async () => {
    setIsRecording(true);
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const trackSampleOffset = await wavStreamPlayer.interrupt();
    if (trackSampleOffset?.trackId) {
      const { trackId, offset } = trackSampleOffset;
      await client.cancelResponse(trackId, offset);
    }
    await wavRecorder.record((data) => client.appendInputAudio(data.mono));
  };

  // // push-to-talk modeでの録音停止
  const stopRecording = async () => {
    setIsRecording(false);
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.pause();
    client.createResponse();
  };

    // イベントの共通部分を持つカスタム型を定義
  type ButtonEvent = React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>;

  //録音ボタンを押し続けている時
  const handleMouseDown = (e: ButtonEvent) => {
    e.preventDefault();
    // 共通の処理をここに書く
    startRecording();
    //クラス追加
    if (isConnected) {
      e.currentTarget.classList.add('is-recording');
    }
  };

  //録音ボタンを離した時
  const handleMouseUp = (e: ButtonEvent) => {
    e.preventDefault();
    // 共通の処理をここに書く
    stopRecording();
      //クラス追加
    e.currentTarget.classList.remove('is-recording');
  };

  //Text送信
  const sendTextMessage = () => {
    const client = clientRef.current;
    console.log(`「${newMessage}」を送信します`);
    (!isConnected)
    ? null
    : (!newMessage)
    ? null
    : client.sendUserMessageContent([{
      type: `input_text`,
      text: newMessage,
    },]);
    setNewMessage('');
  }
  

  // Push to Talk と VAD の切り替え
  const changeTurnEndType = async (value: string) => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    if (value === 'none' && wavRecorder.getStatus() === 'recording') {
      await wavRecorder.pause();
    }
    client.updateSession({
      turn_detection: value === 'none' ? null : { type: 'server_vad' },
    });
    if (value === 'server_vad' && client.isConnected()) {
      await wavRecorder.record((data) => client.appendInputAudio(data.mono));
    }
    setCanPushToTalk(value === 'none');
  };

  // // 会話ログのオートスクロール
  useEffect(() => {
    const conversationEls = [].slice.call(
      document.body.querySelectorAll('[data-conversation-content]')
    );
    for (const el of conversationEls) {
      const conversationEl = el as HTMLDivElement;
      conversationEl.scrollTop = conversationEl.scrollHeight;
    }
  }, [items]);

  // // Realtimeセットアップ ※初回のみ
  useEffect(() => {
    // Get refs
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const client = clientRef.current;

    // Set instructions
    client.updateSession({ instructions: instructions });
    // Set transcription, otherwise we don't get user transcriptions back
    client.updateSession({ input_audio_transcription: { model: 'whisper-1' } });
    // Set Voice
    client.updateSession({ voice: "ballad"});

    // 連続音声検知モード
    // client.updateSession({
    //   turn_detection: { type: 'server_vad' },
    // });

    client.on('error', (event: any) => console.error(event));
    client.on('conversation.interrupted', async () => {
      const trackSampleOffset = await wavStreamPlayer.interrupt();
      if (trackSampleOffset?.trackId) {
        const { trackId, offset } = trackSampleOffset;
        await client.cancelResponse(trackId, offset);
      }
    });
    client.on('conversation.updated', async ({ item, delta }: any) => {
      const items = client.conversation.getItems();
      if (delta?.audio) {
        wavStreamPlayer.add16BitPCM(delta.audio, item.id);
      }
      if (item.status === 'completed' && item.formatted.audio?.length) {
        const wavFile = await WavRecorder.decode(
          item.formatted.audio,
          24000,
          24000
        );
        item.formatted.file = wavFile;
      }
      setItems(items);
    });

    setItems(client.conversation.getItems());
    connectConversation();

    return () => {
      // cleanup; resets to defaults
      client.reset();
    };
  }, []);

  // 会話履歴の表示内容を変数に保存
  const conversationHistory: ReactNode = 
  items.map((conversationItem) => {
    return (
      <Stack className={`chatStack ${conversationItem.role || ''}`} key={conversationItem.id} direction='horizontal' gap={1}>
        {conversationItem.role === "user" ? 
        <img className={`chat-icon ${conversationItem.role || ''}`} src= {userIcon} />
        : conversationItem.role === "assistant" ?
          <img className={`chat-icon ${conversationItem.role || ''}`} src= {assistantIcon} />
        : <></>
        }
        <Stack className='chatContentStack'>
          <div className={`chat-name ${conversationItem.role || ''}`}>{conversationItem.role === "user" ? "質問" : conversationItem.role === "assistant" ? "回答" : ""}</div>
          <div className={`chat-content ${conversationItem.role || ''}`}>
          {conversationItem.role === 'user' && (
            <>
            {conversationItem.formatted.transcript ||
              (conversationItem.formatted.audio?.length
                ? '(音声を認識中...)'
                : conversationItem.formatted.text ||
                '(メッセージを送信)')}
            </>
          )}
          {conversationItem.role === 'assistant' && (
            <>
            {conversationItem.formatted.transcript ||
              conversationItem.formatted.text ||
              '応答が中断されました'}
            </>
          )}
          </div>
        </Stack>
      </Stack>
    );
  })

  // ページのレンダリング
  
  return (
    <>
    <div className='chatPage'>
      <div className='chat-status-msg'>
        {items.length ?  ``: isPreparing ? `接続準備中...` : isConnected ? `質問してください` : `接続されていません`}
      </div>
      <Stack className='chatContainerStack' data-conversation-content gap={4}>
        {/* 会話やりとり表示エリア */}
        {conversationHistory}
      </Stack>
    </div>
    {/* コントロールボタンエリア */}
    <div className='controlArea'>
      <Stack className='ControlStack' direction='horizontal'>
        <button className='icon-btn camera'>
          <span>
            <img src={camera} className="camera"></img>
          </span>
        </button>
        <div className='soundbtn-area'>
          <button className='icon-btn sound'
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={(e) => {
              e.preventDefault();
              handleMouseDown(e);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleMouseUp(e);
            }}
            onContextMenu={(e) => e.preventDefault()} // 右クリックメニューの無効化
          >
            <span>
              <img src={sound} className="sound"></img>
            </span>
          </button>
        </div>
        <button className='icon-btn keyboard'
        onClick={disconnectConversation}
        >
          <span>
            <img src={keyboard} className="keyboard"></img>
          </span>
        </button>
      </Stack>
      <div className='text-message-area'>
        <textarea
        className='text-area'
        value={newMessage}
        onInput={(e: React.FormEvent<HTMLTextAreaElement>) => setNewMessage(e.target.value)}
        />
        <div className='text-control-area'>
          <button
            onClick={sendTextMessage}
          >送信</button>
        </div>
      </div>
    </div>
  </>
  )
}

export default Chatpage;