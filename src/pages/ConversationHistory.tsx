// ConversationHistory.tsx

import React from 'react';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client.js';

function ConversationHistory({
  conversationHistory,
  onClose,
}: {
  conversationHistory: {
    id: string;
    role: string;
    text: string;
    timestamp: string;
  }[][];
  onClose: () => void;
}) {
  return (
    <div className="conversation-history">
      <h2>会話履歴</h2>
      <button onClick={onClose}>閉じる</button>
      {conversationHistory.filter((session) => session.length > 0).length === 0 ? (
        <p>まだ会話履歴がありません。</p>
      ) : (
        conversationHistory.map((conversation, index) =>
          conversation.length > 0 ? (
            <div key={index} className="conversation">
              <h3>会話 {index + 1}</h3>
              <ul>
              {conversation.map((item, idx) => (
                <li key={idx}>
                  <strong>{item.role === 'user' ? 'ユーザー' : 'AI'}</strong>:
                  {item.text}
                </li>
              ))}
              </ul>
            </div>
          ) : null
        )
      )}
    </div>
  );
}

export default ConversationHistory;
