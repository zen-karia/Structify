import React, { useState, useEffect, useCallback, useRef } from 'react';
import { saveScreenState } from '../../utils/screenState';

export default function MainList({ apiKey}) {
    const [categories, setCategories] = useState({});
    const [active, setActive] = useState(null);
    const [loading, setLoading] = useState(true);
    const categoryRefs = useRef({});

    const fetchTabs = useCallback(() => {
        chrome.runtime.sendMessage({ type: 'GET_CATEGORIZED_TABS', apiKey}, (response) => {
            if (response && response.categories) {
                setCategories(response.categories);                
                console.log('Categories:', response.categories);
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

    useEffect(() => {
        Object.keys(categories).forEach(cat => {
            if (!categoryRefs.current[cat]) {
                categoryRefs.current[cat] = React.createRef();
            }
        });
        Object.keys(categoryRefs.current).forEach(cat => {
            if (!categories[cat]) {
                delete categoryRefs.current[cat];
            }
        });
    }, [categories]);

    if (loading) return <div className='text-white'>Loading...</div>

    return (
        <div className="w-[350px] h-[500px] bg-black text-white p-4 rounded-xl shadow overflow-y-auto">
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
            <h2 className='text-xl font-bold mb-2'>Your Tabs</h2>
            {Object.keys(categories).length > 0 && (
                <div className="sticky top-0 z-10 bg-black flex flex-wrap gap-2 mb-4 overflow-x-auto py-2">
                    {Object.keys(categories).map(cat => (
                        <button
                            key={cat}
                            className={`bg-black px-3 py-1 rounded border shadow text-xs font-semibold active:opacity-70 transition cursor-pointer
                                ${active === cat
                                    ? `border-orange-500 text-orange-400` : `border-white text-white`
                                }`}
                            onClick={() => {
                                setActive(cat);
                                categoryRefs.current[cat]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}
            {Object.keys(categories).length > 0 ? (
            Object.entries(categories).map(([cat, catTabs]) => (
                <div key={cat} ref={categoryRefs.current[cat]} className="mb-6">
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