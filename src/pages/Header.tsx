// Header.tsx

import Stack from 'react-bootstrap/Stack';
import record from '../assets/record.svg';
import logo from '../assets/logo.svg';
import setting from '../assets/setting.svg';
import { useCallback } from 'react';

function Header({
  onSettingClick,
  onHistoryClick,
}: {
  onSettingClick: () => void;
  onHistoryClick: () => void;
}) {
  const handleRecordButtonClick = useCallback(() => {
    // 会話履歴ウインドウを表示
    onHistoryClick();
  }, [onHistoryClick]);

  // ページのリロード
  const reloadWindow = () => {
    window.location.reload();
  };

  return (
    <Stack className='headerStack' direction='horizontal'>
      <button className='icon-btn' onClick={handleRecordButtonClick}>
        <span>
          <img src={record} className="record" alt="Record Icon" />
        </span>
      </button>
      <button className='icon-btn logo' onClick={reloadWindow}>
        <span>
          <img src={logo} className="logo" alt="Logo Icon" />
        </span>
      </button>
      <button className='icon-btn' onClick={onSettingClick}>
        <span>
          <img src={setting} className="setting" alt="Setting Icon" />
        </span>
      </button>
    </Stack>
  );
}

export default Header;
