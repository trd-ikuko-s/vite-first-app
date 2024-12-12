import go from '../assets/go.svg';
import logo from '../assets/logo.svg';
import addIcon from '../assets/add.svg';
import setting from '../assets/setting.svg';
import React, { useState, useEffect, useRef } from 'react';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client.js';

// ボイスの選択肢
type VoiceOptions = 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'sage' | 'shimmer' | 'verse' | undefined;
// ボイスの選択肢
const voiceOptions = [
  'alloy',
  'echo',
  'shimmer',
  'ash',
  'ballad',
  'coral',
  'sage',
  'verse',
];

// 設定アイテムの型定義
type SettingItem = {
id: number | string;
character: string;
instructions: string;
voice: VoiceOptions;
};
// デフォルト設定
const defaultSetting: SettingItem = {
  id: 'default', // 特別なIDを設定
  character: 'デフォルト',
  voice: 'ballad' as VoiceOptions,
  instructions: `あなたは日本人でユーモアにあふれたフレンドリーな男性の関西人アシスタントです。
一人称は「ウチ」で、常に流暢な関西弁で話します。
私の会社に勤める先輩社員になったつもりで、悩みに寄り添い、共感したりしながら、質問や相談に対するベストな提案を行います。
もしも、こちらが日本語以外で話しかけた時は、よく聞きとれなかったということを伝えながらもう一度話しかけるように促します。
Personality:
早口気味に話します。
明るくはきはきとした口調で、くだけた態度で話します。`,
};

// コンポーネントの定義
function Setting({
  isVisible,
  onClose,
  clientRef,
  startNewSession,
}: {
  isVisible: boolean;
  onClose: () => void;
  clientRef: React.RefObject<RealtimeClient>;
  startNewSession: () => Promise<void>;
}) {

  // マウント回数をチェック
  useEffect(() => {
    console.log('Setting component mounted');
    return () => {
      console.log('Setting component unmounted');
    };
  }, []);
  

  //すべての設定項目を保持する状態
  const [settingContents, setSettingContents] = useState<SettingItem[]>([defaultSetting]);

  // 選択した設定内容の情報
  const [selectedItem, setSelectedItem] = useState<{
    id: number| string;
    character: string;
    instructions: string;
    voice: VoiceOptions;
  } | null>(null);

  // 「追加ウィンドウ」の表示状態
  const [isAddWindowVisible, setIsAddWindowVisible] = useState(false);
  // 「設定内容表示ウィンドウ」の表示状態
  const [isDetailWindowVisible, setIsDetailWindowVisible] = useState(false);

  // 新しい設定の入力値を管理する状態
  const [newCharacter, setNewCharacter] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newVoice, setNewVoice] = useState<VoiceOptions>('alloy');

   // バリデーションエラーメッセージの状態
  const [characterError, setCharacterError] = useState('');
  const [instructionsError, setInstructionsError] = useState('');

  // 編集用の入力値を管理する状態
  const [editCharacter, setEditCharacter] = useState('');
  const [editInstructions, setEditInstructions] = useState('');
  const [editVoice, setEditVoice] = useState<VoiceOptions>('alloy');

  // 編集画面のバリデーションエラーメッセージ
  const [editCharacterError, setEditCharacterError] = useState('');
  const [editInstructionsError, setEditInstructionsError] = useState('');
  // isInitialized フラグを定義
  const isInitialized = useRef(false);

  // アプリ起動時にローカルストレージからデータを読み込む
  useEffect(() => {
    if (!isInitialized.current) {
      // 初期化処理をここに記述
      const storedSettings = localStorage.getItem('setting-contents');
      if (storedSettings) {
        try {
          const parsedSettings: SettingItem[] = JSON.parse(storedSettings);

          // デフォルト設定が存在しない場合のみ追加
          const hasDefault = parsedSettings.some((item) => item.id === 'default');
          if (!hasDefault) {
            parsedSettings.unshift(defaultSetting);
          }

          setSettingContents(parsedSettings);
          console.log('Loaded from localStorage:', parsedSettings);
        } catch (error) {
          console.error('Failed to parse localStorage data:', error);
        }
      } else {
        // ローカルストレージにデータがない場合、デフォルト設定を使用
        setSettingContents([defaultSetting]);
        console.log('No data in localStorage, using default setting');
      }

      isInitialized.current = true; // 初期化済みフラグを設定
    }
  }, []);


  // settingContentsが更新されたらローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('setting-contents', JSON.stringify(settingContents));
  }, [settingContents]);

  // ユーザーが入力した内容を settingContents に追加し、ローカルストレージに保存
  // 新しい設定を追加する関数
  const handleAddSetting = () => {
    let hasError = false;

    // バリデーション
    if (!newCharacter.trim()) {
      setCharacterError('キャラクター名が入力されていません');
      hasError = true;
    } else {
      setCharacterError('');
    }

    if (!newInstructions.trim()) {
      setInstructionsError('インストラクションが入力されていません');
      hasError = true;
    } else {
      setInstructionsError('');
    }

    if (newCharacter.length > 18) {
      setCharacterError('キャラクター名は18文字以内で入力してください');
      hasError = true;
    }

    if (newInstructions.length > 500) {
      setInstructionsError('インストラクションは500文字以内で入力してください');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    const newId = Date.now(); // 一意のIDを生成
    const newSetting = {
      id: newId,
      character: newCharacter,
      instructions: newInstructions,
      voice: newVoice,
    };

    // 設定を追加
    setSettingContents([...settingContents, newSetting]);

    // 入力フィールドをクリア
    setNewCharacter('');
    setNewInstructions('');
    setNewVoice('alloy');

    // エラーメッセージをクリア
    setCharacterError('');
    setInstructionsError('');

    // 「追加ウィンドウ」を閉じる
    setIsAddWindowVisible(false);
  };

  // リストアイテムをクリックしたときの関数
  const handleListItemClick = (item: SettingItem) => {
    setSelectedItem(item);
    setEditCharacter(item.character);
    setEditVoice(item.voice);
    setEditInstructions(item.instructions);
    setIsDetailWindowVisible(true);
  };
  

  // 編集内容を保存する関数
  const handleSaveDetail = () => {
    // バリデーション
    let hasError = false;
  
    if (!editCharacter.trim()) {
      setEditCharacterError('キャラクター名が入力されていません');
      hasError = true;
    } else {
      setEditCharacterError('');
    }
  
    if (!editInstructions.trim()) {
      setEditInstructionsError('インストラクションが入力されていません');
      hasError = true;
    } else {
      setEditInstructionsError('');
    }
  
    if (hasError || !selectedItem) {
      return;
    }
  
    // `settingContents` 内の該当アイテムを更新
    setSettingContents((prevContents) =>
      prevContents.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              character: editCharacter,
              voice: editVoice,
              instructions: editInstructions,
            }
          : item
      )
    );
  
    // ウインドウを閉じる
    setIsDetailWindowVisible(false);
  };

  const handleCancelDetail = () => {
    // 編集ウインドウを閉じる
    setIsDetailWindowVisible(false);
  };

  // 設定を削除
  const handleDelete = () => {
    if (!selectedItem) {
      return;
    }
  
    // デフォルト設定の削除を防ぐ場合
    if (selectedItem.id === 'default') {
      alert('デフォルト設定は削除できません。');
      return;
    }
  
    // ユーザーに確認を取る
    if (!window.confirm('本当にこの設定を削除しますか？')) {
      return;
    }
  
    // `settingContents` からアイテムを削除
    setSettingContents((prevContents) =>
      prevContents.filter((item) => item.id !== selectedItem.id)
    );
  
    // ウインドウを閉じる
    setIsDetailWindowVisible(false);
  };
  
  
  // 設定を保存して会話を開始する関数
  const handleSaveAndStartConversation = async () => {
    try {
      handleSaveDetail();

      if (clientRef.current) {
        const client = clientRef.current;
        client.updateSession({ voice: editVoice });
        client.updateSession({ instructions: editInstructions });
      }

      // ウインドウを閉じる
      setIsDetailWindowVisible(false);
      onClose();

      // 新しいセッションを開始
      await startNewSession();
    } catch (error) {
      console.error('エラーが発生しました:', error);
      // エラー処理
    }
  };
  
  
  

  // ページレンダリング
  return (
    <div className={`settingPanel ${isVisible ? 'visible' : ''}`}>
      <div className="settingHeader">
        <button className="closeBtn" onClick={onClose}>
        <span>
          <img src={go} className="go-back" alt="go-back Icon" ></img>
        </span>
        </button>
        <span>
          <img src={logo} className="logo" alt="logo Icon" ></img>
        </span>
        <span className='spacer'></span>
      </div>
      <div className="settingContent">
        {/* 設定項目をここに追加 */}
        <h2><span><img src={setting} className="setting-main-icon" alt="setting main title Icon" ></img>セッティング</span></h2>
        <ul className='setting-list-container'>
          {/* 動的にリストアイテムを表示 */}
          {settingContents.map((item) => (
            <li
              key={item.id}
              className={`setting-list-item ${item.id === 'default' ? 'default' : ''}`}
              onClick={() => handleListItemClick(item)}
            >
              <img src={setting} className="setting-list-icon" alt="setting list title Icon" />
              <p className='setting-list-title'>{item.character}</p>
              <img src={go} className="go" alt="go Icon" />
            </li>
          ))}
        </ul>
        {/* 追加ウィンドウ */}
        {isAddWindowVisible && (
          <div className='setting-add-window'>
            <div className='setting-add-content'>
              <h2>新しい設定を追加</h2>
              <label>
                キャラクター名:
                <input
                  id="add-setting-character"
                  name="add-setting-character"
                  type='text'
                  value={newCharacter}
                  onChange={(e) => setNewCharacter(e.target.value)}
                  maxLength={18}
                />
              {characterError && <p className="error-message">{characterError}</p>}
              </label>
              <label>
                ボイス:
                <select
                  id="add-setting-voice"
                  name="add-setting-voice"
                  value={newVoice}
                  onChange={(e) => setNewVoice(e.target.value as VoiceOptions)}
                >
                  {voiceOptions.map((voice) => (
                    <option key={voice} value={voice}>{voice}</option>
                  ))}
                </select>
              </label>
              <label>
                インストラクション:
                <textarea
                  id="add-setting-instructions"
                  name="add-setting-instructions"
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  maxLength={500}
                ></textarea>
              {instructionsError && <p className="error-message">{instructionsError}</p>}
              </label>
              <div className='button-group'>
                <button onClick={handleAddSetting}>保存</button>
                <button onClick={() => setIsAddWindowVisible(false)}>キャンセル</button>
              </div>
            </div>
          </div>
        )}
        {/* 設定内容表示ウインドウ */}
          <div className={`setting-detail-window ${isDetailWindowVisible ? 'visible' : ''}`}>
            <div className='setting-detail-content'>
              <div className='setting-detail-header'>
                <img src={logo} className="logo" alt="logo Icon" ></img>
                <h2>設定内容</h2>
              </div>
              <label>
                キャラクター名:
                <input
                  id="edit-setting-character"
                  name="edit-setting-character"
                  type='text'
                  value={editCharacter}
                  onChange={(e) => setEditCharacter(e.target.value)}
                  maxLength={18}
                />
              </label>
              {editCharacterError && <p className="error-message">{editCharacterError}</p>}

              <label>
                ボイス:
                <select
                  id="edit-setting-voice" 
                  name="edit-setting-voice"
                  value={editVoice}
                  onChange={(e) => setEditVoice(e.target.value as VoiceOptions)}
                >
                  {voiceOptions.map((voice) => (
                    <option key={voice} value={voice}>{voice}</option>
                  ))}
                </select>
              </label>

              <label>
                インストラクション:
                <textarea
                  id="edit-setting-instructions"
                  name="edit-setting-instructions"
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  maxLength={500}
                ></textarea>
              </label>
              {editInstructionsError && <p className="error-message">{editInstructionsError}</p>}

              {/* ボタンエリア */}
              <div className='button-group'>
                <button onClick={handleSaveDetail}>保存</button>
                <button onClick={handleCancelDetail}>キャンセル</button>
                <button onClick={handleDelete}>削除</button>
              </div>
              <button className='full-width-button' onClick={handleSaveAndStartConversation}>設定を保存して会話を開始</button>
            </div>
          </div>
      </div>
      {/* 追加ボタンを配置するコンテナ */}
      <div className='setting-add-btn-container'>
        <button className='setting-add-btn' onClick={() => setIsAddWindowVisible(true)}>
          <img src={addIcon} alt="追加" />
        </button>
        </div>
      
    </div>
  );
}

export default Setting;