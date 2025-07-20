import { useState } from 'react'
import './App.css'
import Home from './components/Home/Home.jsx'
import MainList from './components/MainList/mainlist.jsx'
import SetApiKey from './components/API_Key/setapikey.jsx'

export default function App() {
  const [screen, setScreen] = useState('home');
  const [apiKey, setApiKey] = useState(null);

  return (
    <>
      {screen === 'home' && (
        <Home onGetStarted={() => setScreen('apiKey')} />
      )}
      {screen === 'apiKey' && (
        <SetApiKey onApiKeySubmit={(key) => {
          setApiKey(key);
          setScreen('mainlist');
        }}
        />
      )}
      {screen === 'mainlist' && (
        <MainList apiKey={apiKey} />
      )}
    </>
  );
}