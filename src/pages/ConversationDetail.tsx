import {ReactNode} from 'react';
import { Stack } from 'react-bootstrap'; // 必要に応じてインポート
import userIcon from '../assets/user-icon.png'; // 適切なパスに変更
import assistantIcon from '../assets/assistant-icon.png'; // 適切なパスに変更
import logo from '../assets/logo.svg';
import setting from '../assets/setting.svg';
import record from '../assets/record.svg';
import add from '../assets/add-simple.svg';
import camera from '../assets/camera.svg';
import sound from '../assets/sound.svg';
import keyboard from '../assets/keyboard.svg';



function ConversationDetail({
  className,
  conversation,
  onClose,
  isInputAreaVisible,
  toggleInputarea,
  userText,
}: {
  className: string;
  conversation: {
    id: string;
    role: string;
    text: string;
    timestamp: string;
  }[];
  onClose: () => void;
  isInputAreaVisible: boolean;
  toggleInputarea:  () => void;
  userText: string;
}) {

  // 会話履歴の内容を表示
  const currentConversationHistory: ReactNode = 
  conversation.map((conversationItem) => {
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
            {conversationItem.text}
            </>
          )}
          {conversationItem.role === 'assistant' && (
            <>
            {conversationItem.text}
            </>
          )}
          </div>
        </Stack>
      </Stack>
    );
  })


  return (
    <div className={`conversation-detail ${className}`}>
      <h2 className='conversation-detail-header'>
        <button className="icon-btn" onClick={onClose}>
          <img src={record} alt="record Icon" />
        </button>
        <button className='icon-btn logo' onClick={onClose}>
          <img src={logo} className="logo" alt="Logo Icon" />
        </button>
        <button className='icon-btn' onClick={onClose}>
          <img src={setting} className="setting" alt="Setting Icon" />
        </button>
      </h2>
      <Stack className='conversation-detail-content' data-conversation-content gap={4}>
        {/* 会話やりとり表示エリア */}
        {currentConversationHistory}
      </Stack>
      <div className='controlArea'>
        <Stack className='ControlStack' direction='horizontal'>
          <button className='icon-btn new'
          // onClick={showInputArea}
          >
            <span>
              <img src={add} className="keyboard"></img>
            </span>
          </button>
          <button className='icon-btn keyboard'
          onClick={toggleInputarea}
          >
            <span>
              <img src={keyboard} className="keyboard"></img>
            </span>
          </button>
          <button className='icon-btn camera'>
            <span>
              <img src={camera} className="camera"></img>
            </span>
          </button>
        </Stack>
      </div>
    </div>
  );
}

export default ConversationDetail;
