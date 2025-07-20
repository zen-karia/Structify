import React, { useState } from 'react'

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
        <div className="w-[350px] h-[225px] flex-col bg-black shadow items-center mb-5">
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
        </div>
    );
}