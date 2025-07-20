import React, { useState, useEffect, useCallback } from 'react';

export default function MainList({ apiKey}) {
    const [categories, setCategories] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchTabs = useCallback(() => {
        chrome.runtime.sendMessage({ type: 'GET_CATEGORIZED_TABS', apiKey}, (response) => {
            if (response && response.categories) {
                setCategories(response.categories);
            } else {
                setCategories({});
            }
            setLoading(false);
        });
    }, [apiKey]);

    useEffect(() => {
        fetchTabs();

        function handleMessage(msg) {
            if (msg.type === 'TABS_UPDATED') {
                fetchTabs();
            }
        }
        chrome.runtime.onMessage.addListener(handleMessage);

        return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, [fetchTabs]);

    if (loading) return <div className='text-white'>Loading...</div>

    return (
        <div className="w-[350px] h-[500px] bg-black text-white p-4 rounded-xl shadow overflow-y-auto">
            <h2 className='text-xl font-bold mb-4'>Your Tabs</h2>
            {Object.keys(categories).length > 0 ? (
            Object.entries(categories).map(([cat, catTabs]) => (
                <div key={cat} className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-orange-400">{cat}</h3>
                {catTabs.length === 0 ? (
                    <p className="text-gray-500 text-sm">No tabs</p>
                ) : (
                    <ul>
                    {catTabs.map(tab => (
                        <li key={tab.id} className='flex items-center mb-2 bg-gray-800 rounded p-2'>
                        {tab.favIconUrl && (
                            <img src={tab.favIconUrl} alt="" className='w-5 h-5 mr-2' />
                        )}
                        <span className='flex-1 truncate'>{tab.title}</span>
                        <button 
                            className='ml-2 px-2 py-1 bg-orange-600 rounded text-white text-xs cursor-pointer active:opacity-70 transition'
                            onClick={() => chrome.tabs.update(tab.id, {active: true})}
                        >
                            Open
                        </button>
                        </li>
                    ))}
                    </ul>
                )}
                </div>
            ))
            ) : (
            <p className='text-gray-500'>No tabs found.</p>
            )}
        </div>
    );
}