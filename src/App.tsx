import './App.scss';
import Header from './pages/Header';
import Chatpage from './pages/Chatpage';
import ControlArea from './pages/ControlArea';

function App() {

  return (
    <>
      <Header/>
      <div className='main-area'>
      <Chatpage/>
      {/* <ControlArea/> */}
      </div>
    </>
  )
}

export default App
