import logo from '../assets/logo.svg';
import keyboard from '../assets/keyboard.svg';
import sound from '../assets/sound.svg';


function ConversationHistory({
  className,
  conversationTitles,
  conversationHistory,
  onClose,
  onTitleClick,
}) {
  return (
    <div className={`conversation-history ${className}`}>
      <h2 className='conversation-history-header'>
        <button onClick={onClose}>
          <img src={logo} alt="Logo Icon" />
        </button>
      </h2>
      <ul className="conversation-history-title-list">
      {conversationTitles.map((title, index) => {
          // 該当する会話の最初のユーザー発言を取得
          const conversation = conversationHistory[index] || [];
          const firstUserMessage = conversation.find(
            (msg) => msg.role === 'user'
          );

          // 入力方法に応じてアイコンを選択
          let iconSrc = logo; // デフォルトのアイコン
          if (firstUserMessage?.inputMethod === 'voice') {
            iconSrc = sound;
          } else if (firstUserMessage?.inputMethod === 'text') {
            iconSrc = keyboard;
          }

          return (
            <li key={index} onClick={() => onTitleClick(index)}>
              <img src={iconSrc} alt="Icon" />
              <p>
                {title || `タイトル生成中...`}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ConversationHistory;
