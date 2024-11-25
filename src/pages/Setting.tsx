import go from '../assets/go.svg';
import logo from '../assets/logo.svg';
import setting from '../assets/setting.svg';


function Setting({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) {
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
          <li className='setting-list-item default'>
            <img src={setting} className="setting-list-icon" alt="setting list title Icon" ></img>
            <p className='setting-list-title'>デフォルトデフォルトデフォルト</p>
            <img src={go} className="go" alt="go Icon" ></img>
          </li>
          <li className='setting-list-item'>
            <img src={setting} className="setting-list-icon" alt="setting list title Icon" ></img>
            <p className='setting-list-title'>数学博士</p>
            <img src={go} className="go" alt="go Icon" ></img>
          </li>
          <li className='setting-list-item'>
            <img src={setting} className="setting-list-icon" alt="setting list title Icon" ></img>
            <p className='setting-list-title'>ビジネス</p>
            <img src={go} className="go" alt="go Icon" ></img>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Setting;