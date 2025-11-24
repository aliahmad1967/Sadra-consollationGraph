
import React, { useState, useEffect } from 'react';
import { TreeNodeData } from '../types';
import { explainConcept } from '../services/geminiService';
import { BookOpen, ChevronRight, Loader2, Sparkles, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface InfoPanelProps {
  node: TreeNodeData | null;
  onClose: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ node, onClose }) => {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  // Reset state when node changes
  useEffect(() => {
    setExplanation(null);
    setError(null);
    setLoading(false);
    setFeedback(null);
  }, [node]);

  if (!node) return null;

  const handleAskAI = async () => {
    setLoading(true);
    setError(null);
    setFeedback(null);
    try {
      const result = await explainConcept(node.label, node.description);
      setExplanation(result);
    } catch (e) {
      setError("تعذر الاتصال بالذكاء الاصطناعي. يرجى التحقق من مفتاح API.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    // Here you would typically send this feedback to an analytics service
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`
        fixed inset-y-0 left-0 z-50 
        w-full md:w-96 
        bg-white dark:bg-slate-900 
        border-r border-slate-200 dark:border-slate-700 
        shadow-2xl 
        transform transition-transform duration-300 ease-in-out
        flex flex-col
        ${node ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-start mb-6 flex-shrink-0">
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label="Close"
            >
              <div className="hidden md:block">
                 <ChevronRight size={24} className="rotate-180" />
              </div>
              <div className="md:hidden">
                 <X size={24} />
              </div>
            </button>
             <div className="bg-teal-50 dark:bg-teal-900/30 p-2 rounded-lg border border-teal-200 dark:border-teal-800">
               <BookOpen className="text-teal-600 dark:text-teal-400" size={24} />
             </div>
          </div>

          {/* Content Scroll Area */}
          <div className="flex-grow overflow-y-auto custom-scrollbar px-1">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 leading-tight">
              {node.label}
            </h2>
            {node.description && (
              <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base mb-6 leading-relaxed border-b border-slate-200 dark:border-slate-800 pb-4">
                {node.description}
              </p>
            )}

            {/* AI Section */}
            <div className="mt-4 pb-6">
               {!explanation && !loading && (
                  <button
                    onClick={handleAskAI}
                    className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Sparkles size={18} />
                    <span>اشرح لي هذا المفهوم</span>
                  </button>
               )}

               {loading && (
                 <div className="flex flex-col items-center justify-center py-8 text-teal-600 dark:text-teal-500">
                   <Loader2 className="animate-spin mb-2" size={32} />
                   <span className="text-sm animate-pulse">جاري استدعاء الحكمة...</span>
                 </div>
               )}

               {error && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-200 text-sm">
                    {error}
                  </div>
               )}

               {explanation && (
                 <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="flex items-center gap-2 mb-2 text-teal-600 dark:text-teal-400">
                      <Sparkles size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">شرح الذكاء الاصطناعي</span>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm leading-7 prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown>{explanation}</ReactMarkdown>
                   </div>
                   
                   <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">هل كان هذا مفيداً؟</span>
                        {feedback ? (
                           <span className="text-xs text-teal-600 dark:text-teal-400 font-medium animate-in fade-in px-2">
                             شكراً لملاحظاتك!
                           </span>
                        ) : (
                           <div className="flex gap-1">
                             <button 
                               onClick={() => handleFeedback('up')} 
                               className="p-1.5 rounded hover:bg-teal-50 dark:hover:bg-teal-900/20 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                               aria-label="مفيد"
                             >
                               <ThumbsUp size={14} />
                             </button>
                             <button 
                               onClick={() => handleFeedback('down')} 
                               className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                               aria-label="غير مفيد"
                             >
                               <ThumbsDown size={14} />
                             </button>
                           </div>
                        )}
                      </div>

                       <button 
                         onClick={handleAskAI} 
                         className="text-xs text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-1 transition-colors"
                       >
                         <Sparkles size={12} />
                         تحديث الشرح
                       </button>
                   </div>
                 </div>
               )}
            </div>
          </div>
          
          <div className="mt-auto pt-4 text-center text-xs text-slate-500 dark:text-slate-600 flex-shrink-0">
              الحكمة المتعالية - صدر المتألهين
          </div>
        </div>
      </div>
    </>
  );
};

export default InfoPanel;
