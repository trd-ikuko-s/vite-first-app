import './App.scss';
import Header from './pages/Header';
import Chatpage from './pages/Chatpage';

function App() {

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
