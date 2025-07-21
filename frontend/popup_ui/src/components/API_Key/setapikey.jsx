import React, { useState } from 'react'
import { saveScreenState } from '../../utils/screenState';

export default function SetApiKey({ onApiKeySubmit }) {
    const [apiKey, setApiKey] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!apiKey.startsWith('sk-')) {
            setError('Please enter a valid OpenAI API Key (starts with sk-)');
            return;
        }
        setError('');
        onApiKeySubmit(apiKey);
    }

    return (
        <div className="w-[350px] h-[300px] flex-col bg-black shadow items-center mb-5">
            <button
                className="absolute top-2 right-2 bg-orange-600 text-white px-3 py-1 rounded text-xs font-semibold shadow cursor-pointer active:opacity-70"
                onClick={() => {
                    saveScreenState({ screen: 'home', apiKey: null });
                    window.close();
                }}
                title="Close Extension"
            >
                Close Extension
            </button>
            <h2 className="text-xl text-white font-bold mb-2">Enter your OpenAI API Key</h2>
            <input
                type='text'
                className='w-full p-2 rounded mb-2 text-white border border-gray-400 focus:border-orange-500'
                placeholder='API Key (starts with sk-)'
                value={apiKey}
                onChange={e => setApiKey(e.target.value)} />
            {error && <p className="text-gray-500 text-sm mb-2">{error}</p>}
            <button className="bg-orange-600 text-base text-white px-4 py-2 rounded active:opacity-70 transition duration-100 cursor-pointer mb-2" onClick={handleSubmit}
            >Continue</button>
            <div className="text-gray-300 text-sm text-left w-full">
                <p className="mb-1 font-semibold">How to get your OpenAI API Key:</p>
                <ol className="list-decimal list-inside space-y-1">
                <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline text-blue-400">OpenAI API Keys</a></li>
                <li>Sign in or create an account</li>
                <li>Click "Create new secret key"</li>
                <li>Copy the key (starts with <span className="font-mono">sk-</span>)</li>
                <li>Paste it above and click Continue</li>
                </ol>
            </div>
            <h3 className='text-sm text-white font-bold mb-2 mt-2'>Please Note that if you see an "ALL" Tabs category, it means your free API quota has expired and you need to add payment method for billing.</h3>
        </div>
    );
}