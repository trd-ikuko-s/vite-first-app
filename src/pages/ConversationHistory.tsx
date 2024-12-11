import React from 'react';
import logo from '../assets/logo.svg';


function ConversationHistory({
  className,
  conversationTitles,
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
        {conversationTitles.map((title, index) => (
          <li key={index} onClick={() => onTitleClick(index)}>
            <img src={logo} alt="Logo Icon" />
            <p>
              {title || `タイトル生成中...`}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ConversationHistory;
