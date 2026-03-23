import React, { useState, useCallback } from 'react';
import { 
  Search, 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Loader2,
  BarChart3,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { analyzePlagiarism, PlagiarismResult } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          setText(content);
        }
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  } as any);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await analyzePlagiarism(text);
      setResult(data);
    } catch (err) {
      setError('Analysis failed. Please ensure your API key is configured and try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-white w-5 h-5" />
            </div>
            <h1 className="font-semibold text-lg tracking-tight">IEEE Plagiarism Checker</h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
            <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> IEEE Standards</span>
            <span className="flex items-center gap-1"><BarChart3 className="w-4 h-4" /> 100% Analysis</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Input Section */}
          <div className={cn("lg:col-span-7 space-y-6", result && "lg:col-span-6")}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Document Content</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setText('')}
                    className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your research paper content here..."
                  className="w-full h-[500px] resize-none border-none focus:ring-0 text-gray-700 leading-relaxed placeholder:text-gray-300"
                />
                
                <div 
                  {...getRootProps()} 
                  className={cn(
                    "mt-4 border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-3",
                    isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-8 h-8 text-gray-400" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Drop your file here or click to upload</p>
                    <p className="text-xs text-gray-400 mt-1">Supports PDF, DOCX, and TXT</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !text.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-200 active:scale-95"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Run IEEE Analysis
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className={cn("lg:col-span-5", !result && "hidden lg:block")}>
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl p-12 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center space-y-4"
                >
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                    <ShieldCheck className="absolute inset-0 m-auto w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Deep Scanning...</h3>
                    <p className="text-sm text-gray-500 mt-1">Cross-referencing with IEEE Xplore and web databases</p>
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  {/* Score Card */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm overflow-hidden relative">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-gray-900">Similarity Score</h3>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                        result.score < 15 ? "bg-green-100 text-green-700" : 
                        result.score < 30 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                      )}>
                        {result.score < 15 ? 'Excellent' : result.score < 30 ? 'Warning' : 'Critical'}
                      </span>
                    </div>
                    
                    <div className="flex items-end gap-4">
                      <div className="text-6xl font-light tracking-tighter text-gray-900">
                        {result.score}<span className="text-2xl text-gray-300">%</span>
                      </div>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full mb-3 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${result.score}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={cn(
                            "h-full rounded-full",
                            result.score < 15 ? "bg-green-500" : 
                            result.score < 30 ? "bg-yellow-500" : "bg-red-500"
                          )}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">Calculated using IEEE-standard similarity metrics</p>
                  </div>

                  {/* Citation Analysis */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold">IEEE Citation Audit</h3>
                    </div>
                    
                    <div className={cn(
                      "p-4 rounded-xl flex items-start gap-3 mb-4",
                      result.citationAnalysis.isCompliant ? "bg-green-50 border border-green-100" : "bg-orange-50 border border-orange-100"
                    )}
                    >
                      {result.citationAnalysis.isCompliant ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-orange-600 shrink-0" />
                      )}
                      <div>
                        <p className={cn(
                          "text-sm font-medium",
                          result.citationAnalysis.isCompliant ? "text-green-800" : "text-orange-800"
                        )}>
                          {result.citationAnalysis.isCompliant ? 'Compliant with IEEE Format' : 'Citation Issues Detected'}
                        </p>
                        <ul className="mt-2 space-y-1">
                          {result.citationAnalysis.issues.map((issue, i) => (
                            <li key={i} className="text-xs text-gray-600 flex items-center gap-1.5">
                              <ChevronRight className="w-3 h-3" /> {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Matches */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="font-semibold mb-4">Top Matches</h3>
                    <div className="space-y-4">
                      {result.matches.map((match, i) => (
                        <div key={i} className="group p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Source {i + 1}</span>
                            <span className="text-xs font-semibold text-blue-600">{match.similarity}% Match</span>
                          </div>
                          <p className="text-sm text-gray-600 italic line-clamp-2 mb-3">"{match.text}"</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-900 truncate max-w-[200px]">{match.source}</span>
                            {match.url && (
                              <a 
                                href={match.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-xs font-semibold"
                              >
                                View Source <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                      {result.matches.length === 0 && (
                        <div className="text-center py-8">
                          <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No significant matches found</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5" />
                      Analysis Summary
                    </h3>
                    <p className="text-sm text-blue-50 leading-relaxed">
                      {result.summary}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-200 rounded-2xl">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="font-semibold text-gray-400">No Analysis Yet</h3>
                  <p className="text-sm text-gray-400 mt-1 max-w-[200px]">Paste your text and run analysis to see results here</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {error && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{error}</span>
          <button onClick={() => setError(null)} className="hover:opacity-70">✕</button>
        </div>
      )}
    </div>
  );
}
