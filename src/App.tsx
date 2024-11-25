import React, { useEffect, useState } from 'react';
import './App.scss';
import Header from './pages/Header';
import Setting from './pages/Setting';
import Chatpage from './pages/Chatpage';

function App() {
  // Setting画面の状態変数
  const [isSettingVisible, setIsSettingVisible] = useState(false);

  const toggleSetting = () => {
    setIsSettingVisible((prev) => !prev);
  };

  //右クリック無効
  useEffect(() => {
    const handleContextMenu = (e:any) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);
  return (
    <>
      <Header onSettingClick={toggleSetting}/>
      <Setting isVisible={isSettingVisible} onClose={toggleSetting} />
      <Chatpage/>
    </>
  )
}

export default App
