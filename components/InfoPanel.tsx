
import React, { useState, useEffect } from 'react';
import { TreeNodeData } from '../types';
import { explainConcept } from '../services/geminiService';
import { 
  BookOpen, 
  ChevronRight, 
  Loader2, 
  Sparkles, 
  X, 
  ThumbsUp, 
  ThumbsDown,
  FileText,
  ListTree,
  ArrowLeft
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface InfoPanelProps {
  node: TreeNodeData | null;
  onClose: () => void;
  onNodeSelect: (node: TreeNodeData) => void;
}

type TabType = 'overview' | 'ai' | 'related';

const InfoPanel: React.FC<InfoPanelProps> = ({ node, onClose, onNodeSelect }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
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
    setActiveTab('overview');
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
        {/* Header */}
        <div className="flex-shrink-0 p-6 pb-2">
           <div className="flex justify-between items-start mb-4">
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
          
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 leading-tight">
              {node.label}
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-2 text-sm font-medium transition-colors relative ${
              activeTab === 'overview' 
                ? 'text-teal-600 dark:text-teal-400' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText size={16} />
              <span>نبذة</span>
            </div>
            {activeTab === 'overview' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 dark:bg-teal-400 rounded-t-full" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('ai')}
            className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
              activeTab === 'ai' 
                ? 'text-teal-600 dark:text-teal-400' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
             <div className="flex items-center gap-2">
              <Sparkles size={16} />
              <span>الذكاء الاصطناعي</span>
            </div>
            {activeTab === 'ai' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 dark:bg-teal-400 rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('related')}
            className={`pb-3 px-2 text-sm font-medium transition-colors relative ${
              activeTab === 'related' 
                ? 'text-teal-600 dark:text-teal-400' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
             <div className="flex items-center gap-2">
              <ListTree size={16} />
              <span>مرتبط</span>
            </div>
            {activeTab === 'related' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 dark:bg-teal-400 rounded-t-full" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-grow overflow-y-auto custom-scrollbar p-6">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="prose prose-slate dark:prose-invert max-w-none">
                 <h3 className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-3">الوصف العام</h3>
                 {node.description ? (
                    <p className="text-slate-700 dark:text-slate-300 text-base leading-7 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      {node.description}
                    </p>
                 ) : (
                    <p className="text-slate-400 italic">لا يوجد وصف متاح لهذا العنصر.</p>
                 )}
               </div>

               {node.children && node.children.length > 0 && (
                 <div className="mt-8">
                   <h3 className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-3">يتفرع منه</h3>
                   <div className="grid grid-cols-2 gap-2">
                      {node.children.slice(0, 4).map(child => (
                        <button 
                          key={child.id}
                          onClick={() => onNodeSelect(child)}
                          className="text-right p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-900/20 border border-slate-200 dark:border-slate-700 transition-colors text-xs font-medium text-slate-700 dark:text-slate-300 truncate"
                        >
                          {child.label}
                        </button>
                      ))}
                      {node.children.length > 4 && (
                        <button 
                          onClick={() => setActiveTab('related')}
                          className="text-right p-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center justify-center gap-1"
                        >
                          عرض الكل ({node.children.length}) <ChevronRight size={12} className="rotate-180" />
                        </button>
                      )}
                   </div>
                 </div>
               )}
            </div>
          )}

          {/* AI TAB */}
          {activeTab === 'ai' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full flex flex-col">
               <div className="mb-4 text-sm text-slate-500 dark:text-slate-400 bg-teal-50/50 dark:bg-teal-900/10 p-3 rounded-lg border border-teal-100 dark:border-teal-800/30">
                 يمكنك طلب شرح مفصل لهذا المفهوم باستخدام الذكاء الاصطناعي (Gemini).
               </div>

               {!explanation && !loading && (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-teal-500/20">
                      <Sparkles className="text-white" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">استكشف المزيد</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mb-6">
                      احصل على شرح فلسفي عميق وسياق تاريخي لهذا المفهوم.
                    </p>
                    <button
                      onClick={handleAskAI}
                      className="py-2.5 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-medium shadow hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                    >
                      توليد الشرح
                    </button>
                  </div>
               )}

               {loading && (
                 <div className="flex flex-col items-center justify-center py-12 text-teal-600 dark:text-teal-500">
                   <Loader2 className="animate-spin mb-4" size={40} />
                   <span className="text-sm font-medium animate-pulse">جاري صياغة الشرح الفلسفي...</span>
                 </div>
               )}

               {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-200 text-sm flex flex-col items-center text-center gap-2">
                    <span>{error}</span>
                    <button onClick={handleAskAI} className="text-xs underline hover:text-red-800 dark:hover:text-red-100">إعادة المحاولة</button>
                  </div>
               )}

               {explanation && (
                 <div className="flex-grow flex flex-col">
                   <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm leading-7 prose prose-sm max-w-none dark:prose-invert shadow-sm">
                      <ReactMarkdown>{explanation}</ReactMarkdown>
                   </div>
                   
                   <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-medium">تقييم الإجابة:</span>
                        {feedback ? (
                           <span className="text-xs text-teal-600 dark:text-teal-400 font-bold animate-in fade-in px-2 bg-teal-50 dark:bg-teal-900/30 rounded py-1">
                             تم التقييم
                           </span>
                        ) : (
                           <div className="flex gap-1">
                             <button 
                               onClick={() => handleFeedback('up')} 
                               className="p-1.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                               aria-label="مفيد"
                             >
                               <ThumbsUp size={16} />
                             </button>
                             <button 
                               onClick={() => handleFeedback('down')} 
                               className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                               aria-label="غير مفيد"
                             >
                               <ThumbsDown size={16} />
                             </button>
                           </div>
                        )}
                      </div>

                       <button 
                         onClick={handleAskAI} 
                         className="text-xs text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1"
                       >
                         <Sparkles size={12} />
                         تحديث
                       </button>
                   </div>
                 </div>
               )}
            </div>
          )}

          {/* RELATED TAB */}
          {activeTab === 'related' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
               <h3 className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-3">
                 المفاهيم الفرعية ({node.children ? node.children.length : 0})
               </h3>
               
               {node.children && node.children.length > 0 ? (
                 <div className="space-y-2">
                   {node.children.map((child, idx) => (
                     <button
                       key={child.id}
                       onClick={() => onNodeSelect(child)}
                       className="w-full text-right group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200"
                     >
                       <div className="mt-1 w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                         {idx + 1}
                       </div>
                       <div className="flex-grow">
                         <h4 className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                           {child.label}
                         </h4>
                         {child.description && (
                           <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                             {child.description}
                           </p>
                         )}
                       </div>
                       <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
                          <ArrowLeft size={16} />
                       </div>
                     </button>
                   ))}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <ListTree size={32} className="text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      لا توجد مفاهيم فرعية لهذا العنصر.
                    </p>
                 </div>
               )}
            </div>
          )}
        </div>
        
        <div className="mt-auto border-t border-slate-100 dark:border-slate-800 p-4 text-center text-xs text-slate-500 dark:text-slate-600 flex-shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
            الحكمة المتعالية - صدر المتألهين
        </div>
      </div>
    </>
  );
};

export default InfoPanel;
