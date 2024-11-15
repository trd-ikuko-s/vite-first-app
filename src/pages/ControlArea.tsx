// import { useEffect, useRef, useCallback, useState } from 'react';

// import { RealtimeClient } from '@openai/realtime-api-beta';
// import { ItemType } from '@openai/realtime-api-beta/dist/lib/client.js';
// import { WavRecorder, WavStreamPlayer } from '../lib/wavtools/index.js';
// import { instructions } from '../utils/conversation_config.js';
// import { WavRenderer } from '../utils/wav_renderer';

// import {instructions} from '../utils/conversation_config';
import Stack from 'react-bootstrap/Stack';
import camera from '../assets/camera.svg';
import sound from '../assets/sound.svg';
import keyboard from '../assets/keyboard.svg';

function ControlArea() {
  

  //レンダリング内容
  return (
    <>

    <div className='controlArea'>
      <div>
        
      </div>
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

export default ControlArea;