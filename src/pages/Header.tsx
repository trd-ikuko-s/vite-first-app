import Stack from 'react-bootstrap/Stack';
import record from '../assets/record.svg';
import logo from '../assets/logo.svg';
import setting from '../assets/setting.svg';
// import {disConnectConversation} from './Chatpage'
import { useCallback, useState } from 'react';


function Header() {
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(async () => {
    setIsConnected(true);
    console.log("connect");
  },[])
  const disconnect = useCallback( () => {
    setIsConnected(false);
    console.log("disconnect")
  },[])

  // ページのリロード
  const relordWindow = () => {
    window.location.reload();
  }

  return (
    <Stack className='headerStack' direction='horizontal'>
      <button className='icon-btn' onClick={isConnected? disconnect: connect}>
        <span>
          <img src={record} className="record"></img>
        </span>
      </button>
      <button className='icon-btn logo' onClick={relordWindow}>
        <span>
          <img src={logo} className="logo"></img>
        </span>
      </button>
      <button className='icon-btn'>
        <span>
          <img src={setting} className="setting"></img>
        </span>
      </button>
    </Stack>
  )
}

export default Header;