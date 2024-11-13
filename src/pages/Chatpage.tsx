import { useEffect, useRef, useCallback, useState } from 'react';

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
    // if (client.getTurnDetectionType() === 'server_vad') {
    //   await wavRecorder.record((data) => client.appendInputAudio(data.mono));
    // }
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

  // // 会話ログのオートスクロール
  useEffect(() => {
    const conversationEls = [].slice.call(
      document.body.querySelectorAll('chatStack')
    );
    for (const el of conversationEls) {
      const conversationEl = el as HTMLDivElement;
      conversationEl.scrollTop = conversationEl.scrollHeight;
    }
  }, [items]);

  // // Realtimeセットアップ
  useEffect(() => {
    // Get refs
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const client = clientRef.current;

    // Set instructions
    client.updateSession({ instructions: instructions });
    // Set transcription, otherwise we don't get user transcriptions back
    client.updateSession({ input_audio_transcription: { model: 'whisper-1' } });
    // Set Voice
    client.updateSession({ voice: "echo"});

    // 連続音声検知モード
    client.updateSession({
      turn_detection: { type: 'server_vad' },
    });

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

    return () => {
      // cleanup; resets to defaults
      client.reset();
    };
  }, []);

  return (
    <>
    <div className='chatPage'>
      <Stack className='chatContainerStack' gap={4}>
        {/* ユーザーの会話 */}
        <Stack className='chatStack user' direction='horizontal' gap={1}>
          <img className='chat-icon user' src={userIcon}/>
          <Stack className='chatContentStack'>
          <div className='chat-name user'>質問</div>
          <div className='chat-content user'>質問内容です。長い文章が改行されずに続くとこのような表示になります。</div>
          </Stack>
        </Stack>
        {/* AIの返答 */}
        <Stack className='chatStack' direction='horizontal' gap={1}>
          <img className='chat-icon' src={assistantIcon}/>
          <Stack className='chatContentStack'>
          <div className='chat-name'>回答</div>
          <div className='chat-content'>回答の内容です。長い文章が改行されずに続くとこのような表示になります。</div>
          </Stack>
        </Stack>
        {/* ユーザーの会話 */}
        <Stack className='chatStack user' direction='horizontal' gap={1}>
          <img className='chat-icon user' src={userIcon}/>
          <Stack className='chatContentStack'>
          <div className='chat-name user'>質問</div>
          <div className='chat-content user'>質問内容です。長い文章が改行されずに続くとこのような表示になります。</div>
          </Stack>
        </Stack>
        {/* AIの返答 */}
        <Stack className='chatStack' direction='horizontal' gap={1}>
          <img className='chat-icon' src={assistantIcon}/>
          <Stack className='chatContentStack'>
          <div className='chat-name'>回答</div>
          <div className='chat-content'>回答の内容です。長い文章が改行されずに続くとこのような表示になります。</div>
          </Stack>
        </Stack>
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
        {/* サウンドボタンは位置がずれる */}
        <div className='soundbtn-area'>
          <button className='icon-btn sound'>
            <span>
              <img src={sound} className="sound"></img>
            </span>
          </button>
        </div>
        <button className='icon-btn keyboard'>
          <span>
            <img src={keyboard} className="keyboard"></img>
          </span>
        </button>
      </Stack>
    </div>
  </>
  )
}

export default Chatpage;