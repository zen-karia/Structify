import React, { useState, useEffect } from 'react';
import './App.css'
import Home from './components/Home/Home.jsx'
import MainList from './components/MainList/mainlist.jsx'
import SetApiKey from './components/API_Key/setapikey.jsx'
import { getScreenState, saveScreenState } from './utils/screenState';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [apiKey, setApiKey] = useState(null);

  useEffect(() => {
    getScreenState().then((state) => {
      setScreen(state.screen);
      setApiKey(state.apiKey);
    });
  }, []);

  useEffect(() => {
    saveScreenState({ screen, apiKey });
  }, [screen, apiKey]);

  return (
    <>
      {screen === 'home' && (
        <Home onGetStarted={() => setScreen('apikey')} />
      )}
      {screen === 'apikey' && (
        <SetApiKey
          onApiKeySubmit={(key) => {
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