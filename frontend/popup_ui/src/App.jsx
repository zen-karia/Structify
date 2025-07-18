import { useState } from 'react'
import './App.css'
import Home from './components/Home/Home.jsx'
import MainList from './components/MainList/mainlist.jsx'

export default function App() {
  const [showMainList, setShowMainList] = useState(false);

  return (
    <>
      {showMainList ? (
        <MainList />
      ) : (
        <Home onGetStarted={() => setShowMainList(true)} />
      )}
    </>
  );
}