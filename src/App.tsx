import React, { useEffect } from 'react';
import './App.scss';
import Header from './pages/Header';
import Chatpage from './pages/Chatpage';

function App() {
  useEffect(() => {
    const handleContextMenu = (e:any) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);
  return (
    <>
      <Header/>
      <div className='main-area'>
      <Chatpage/>
      </div>
    </>
  )
}

export default App
