
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SADRA_TREE_DATA } from './constants';
import ConstellationGraph from './components/ConstellationGraph';
import InfoPanel from './components/InfoPanel';
import { TreeNodeData } from './types';
import { Sparkles, Sun, Moon, Search, X } from 'lucide-react';

const App: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<TreeNodeData | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Flatten tree for searching
  const allNodes = useMemo(() => {
    const flatten = (node: TreeNodeData): TreeNodeData[] => {
      let list = [node];
      if (node.children) {
        node.children.forEach(child => {
          list = [...list, ...flatten(child)];
        });
      }
      return list;
    };
    return flatten(SADRA_TREE_DATA);
  }, []);

  // Filter nodes based on query
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lowerQuery = searchQuery.toLowerCase();
    return allNodes.filter(node => 
      node.label.toLowerCase().includes(lowerQuery) || 
      node.description?.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery, allNodes]);

  // Handle click outside search to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNodeClick = (node: TreeNodeData) => {
    setSelectedNode(node);
    setShowSearchResults(false);
    setSearchQuery(''); // Optional: clear search after selection
  };

  const handleClosePanel = () => {
    setSelectedNode(null);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-500" dir="rtl" style={{ overscrollBehaviorY: 'none' }}>
      
      {/* Background Stars (Static CSS effect for depth) */}
      <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-500 ${isDarkMode ? 'opacity-40' : 'opacity-10'}`}
           style={{ 
             backgroundImage: `radial-gradient(${isDarkMode ? 'white' : '#cbd5e1'} 1px, transparent 1px)`, 
             backgroundSize: '50px 50px' 
           }}>
      </div>
      
      {/* Header */}
      <div className="absolute top-0 w-full z-20 pointer-events-none p-4 md:p-6 flex flex-col md:flex-row justify-between items-start gap-4 bg-gradient-to-b from-slate-100/90 to-transparent dark:from-slate-950 dark:to-transparent">
        <div>
          <h1 className="text-2xl md:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tighter drop-shadow-sm dark:drop-shadow-lg transition-colors duration-300">
            الحكمة المتعالية
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm mt-1 flex items-center gap-2 font-medium">
            <Sparkles size={12} className="text-teal-600 dark:text-teal-400 md:w-4 md:h-4" />
            خريطة المفاهيم الكونية
          </p>
        </div>

        {/* Controls Container (Search + Theme) */}
        <div className="flex items-start gap-3 pointer-events-auto self-end md:self-auto">
          
          {/* Search Bar */}
          <div ref={searchContainerRef} className="relative group z-30">
            <div className={`
              flex items-center 
              bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm
              border border-slate-200 dark:border-slate-700 
              rounded-full shadow-lg hover:shadow-xl
              transition-all duration-300 ease-in-out
              ${showSearchResults || searchQuery ? 'w-64 md:w-80 ring-2 ring-teal-500/50' : 'w-10 md:w-10 hover:w-64 md:hover:w-80 focus-within:w-64 md:focus-within:w-80'}
              overflow-hidden
            `}>
              <div className="p-2.5 text-slate-500 dark:text-slate-400 cursor-pointer">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                placeholder="ابحث في المفاهيم..."
                className="bg-transparent border-none outline-none text-sm w-full text-slate-800 dark:text-slate-100 placeholder-slate-400 px-2 h-10"
              />
              {searchQuery && (
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchQuery && (
              <div className="absolute top-full mt-2 left-0 w-64 md:w-80 max-h-[60vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {filteredNodes.length > 0 ? (
                  <ul className="py-2">
                    {filteredNodes.map(node => (
                      <li key={node.id}>
                        <button
                          onClick={() => handleNodeClick(node)}
                          className="w-full text-right px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-0"
                        >
                          <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{node.label}</div>
                          {node.description && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">{node.description}</div>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                    لا توجد نتائج
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all shadow-md flex-shrink-0"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {/* Main Visualization Area */}
      <div className="flex-grow h-full w-full relative z-10">
        <ConstellationGraph 
          data={SADRA_TREE_DATA} 
          onNodeClick={handleNodeClick}
          selectedNodeId={selectedNode?.id}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Side Info Panel */}
      <InfoPanel 
        node={selectedNode} 
        onClose={handleClosePanel} 
        onNodeSelect={handleNodeClick}
      />
      
    </div>
  );
};

export default App;
