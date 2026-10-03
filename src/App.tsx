import React, { useState } from 'react';
import {
  GraduationCap,
  HelpCircle,
  Lightbulb,
  FileText,
  CheckCircle2,
  XCircle,
  Compass,
  Volume2,
  Copy,
  Check,
  RotateCcw,
  ChevronDown
} from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

export default function App() {
  // Navigation / View modes
  const [activeTab, setActiveTab] = useState<'dashboard' | 'focused'>('dashboard');

  // Focused Task state (Milestone 3 Activity 3.1)
  const [selectedTask, setSelectedTask] = useState<'qa' | 'explain' | 'summary' | 'quiz' | 'recommend'>('qa');
  const [taskInput, setTaskInput] = useState('');
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskResult, setTaskResult] = useState<any>(null);
  const [taskError, setTaskError] = useState('');

  // 1. QnA Module state
  const [qaInput, setQaInput] = useState('');
  const [qaAnswer, setQaAnswer] = useState('');
  const [qaLoading, setQaLoading] = useState(false);
  const [qaError, setQaError] = useState('');

  // 2. Explanation Module state
  const [explainInput, setExplainInput] = useState('');
  const [explainOutput, setExplainOutput] = useState('');
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState('');

  // 3. Summary Module state
  const [summaryInput, setSummaryInput] = useState('');
  const [summaryOutput, setSummaryOutput] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  // 4. Quiz Module state
  const [quizInput, setQuizInput] = useState('');
  const [quizList, setQuizList] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [index: number]: string }>({});
  const [quizFeedback, setQuizFeedback] = useState<{ [index: number]: { isChecked: boolean; isCorrect: boolean } }>({});
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState('');

  // 5. Learning Path Module state
  const [pathInput, setPathInput] = useState('');
  const [pathOutput, setPathOutput] = useState('');
  const [pathLoading, setPathLoading] = useState(false);
  const [pathError, setPathError] = useState('');

  // Utility copied feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // --- Handlers ---
  const handleQaSubmit = async (e?: React.FormEvent, customQ?: string) => {
    if (e) e.preventDefault();
    const query = customQ || qaInput;
    if (!query.trim()) return;

    setQaLoading(true);
    setQaError('');
    setQaAnswer('');

    try {
      const res = await fetch(`/qa?question=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.answer) {
        setQaAnswer(data.answer);
      } else if (data.error) {
        setQaError(data.error);
      }
    } catch (err: any) {
      setQaError(err.message || 'Failed to connect to backend.');
    } finally {
      setQaLoading(false);
    }
  };

  const handleExplainSubmit = async (e?: React.FormEvent, customTopic?: string) => {
    if (e) e.preventDefault();
    const topic = customTopic || explainInput;
    if (!topic.trim()) return;

    setExplainLoading(true);
    setExplainError('');
    setExplainOutput('');

    try {
      const res = await fetch('/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      const data = await res.json();
      if (data.explanation) {
        setExplainOutput(data.explanation);
      } else if (data.error) {
        setExplainError(data.error);
      }
    } catch (err: any) {
      setExplainError(err.message || 'Failed to connect to backend.');
    } finally {
      setExplainLoading(false);
    }
  };

  const handleSummarySubmit = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const text = customText || summaryInput;
    if (!text.trim()) return;

    setSummaryLoading(true);
    setSummaryError('');
    setSummaryOutput('');

    try {
      const res = await fetch('/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });
      const data = await res.json();
      if (data.summary) {
        setSummaryOutput(data.summary);
      } else if (data.error) {
        setSummaryError(data.error);
      }
    } catch (err: any) {
      setSummaryError(err.message || 'Failed to connect to backend.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleQuizSubmit = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const text = customText || quizInput;
    if (!text.trim()) return;

    setQuizLoading(true);
    setQuizError('');
    setQuizList([]);
    setUserAnswers({});
    setQuizFeedback({});

    try {
      const res = await fetch('/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });
      const data = await res.json();
      if (Array.isArray(data.quiz)) {
        setQuizList(data.quiz);
      } else if (data.error) {
        setQuizError(data.error);
      }
    } catch (err: any) {
      setQuizError(err.message || 'Failed to connect to backend.');
    } finally {
      setQuizLoading(false);
    }
  };

  const handleCheckQuizAnswer = (index: number) => {
    const selected = userAnswers[index];
    const correct = quizList[index]?.answer;
    if (!selected) return;

    const isMatch = selected.trim().toLowerCase() === correct.trim().toLowerCase();
    setQuizFeedback((prev) => ({
      ...prev,
      [index]: { isChecked: true, isCorrect: isMatch },
    }));
  };

  const handlePathSubmit = async (e?: React.FormEvent, customTopic?: string) => {
    if (e) e.preventDefault();
    const topic = customTopic || pathInput;
    if (!topic.trim()) return;

    setPathLoading(true);
    setPathError('');
    setPathOutput('');

    try {
      const res = await fetch(`/learn/recommendations?topic=${encodeURIComponent(topic.trim())}`);
      const data = await res.json();
      if (data.recommendation) {
        setPathOutput(data.recommendation);
      } else if (data.error) {
        setPathError(data.error);
      }
    } catch (err: any) {
      setPathError(err.message || 'Failed to connect to backend.');
    } finally {
      setPathLoading(false);
    }
  };

  // Handler for Milestone 3 Activity 3.1 Focused Form
  const handleFocusedTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;

    setTaskLoading(true);
    setTaskError('');
    setTaskResult(null);

    try {
      if (selectedTask === 'qa') {
        const res = await fetch(`/qa?question=${encodeURIComponent(taskInput.trim())}`);
        const data = await res.json();
        setTaskResult({ type: 'qa', content: data.answer || data.error });
      } else if (selectedTask === 'explain') {
        const res = await fetch('/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: taskInput.trim() }),
        });
        const data = await res.json();
        setTaskResult({ type: 'explain', content: data.explanation || data.error });
      } else if (selectedTask === 'summary') {
        const res = await fetch('/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: taskInput.trim() }),
        });
        const data = await res.json();
        setTaskResult({ type: 'summary', content: data.summary || data.error });
      } else if (selectedTask === 'quiz') {
        const res = await fetch('/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: taskInput.trim() }),
        });
        const data = await res.json();
        setTaskResult({ type: 'quiz', content: data.quiz || [] });
      } else if (selectedTask === 'recommend') {
        const res = await fetch(`/learn/recommendations?topic=${encodeURIComponent(taskInput.trim())}`);
        const data = await res.json();
        setTaskResult({ type: 'recommend', content: data.recommendation || data.error, topic: data.topic });
      }
    } catch (err: any) {
      setTaskError(err.message || 'Failed to process request.');
    } finally {
      setTaskLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900 pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                EduGenie <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold uppercase tracking-wider">AI Assistant</span>
              </span>
              <p className="text-xs text-slate-500 hidden sm:block">Google Gemini Powered Learning System</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-blue-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Multi-Module
            </button>
            <button
              onClick={() => setActiveTab('focused')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'focused'
                  ? 'bg-white text-blue-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Task Dropdown
            </button>
          </div>
        </div>
      </header>

      {/* Hero Title Matching PDF Specification */}
      <section className="max-w-4xl mx-auto pt-8 pb-6 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2">
          Welcome to EduGenie <span className="text-amber-500">🎓✨</span>
        </h1>
        <p className="mt-2 text-base sm:text-lg text-slate-600 font-medium">
          Your personal AI tutor for learning support!
        </p>

        {/* Quick Scenario Pills (from PDF Page 1) */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] mr-1">Quick Scenarios:</span>
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setQaInput('Which is the largest ocean?');
              handleQaSubmit(undefined, 'Which is the largest ocean?');
            }}
            className="px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1"
          >
            <span>Scenario 1: Largest Ocean (Q&A)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setQuizInput('The Pythagoras Theorem');
              handleQuizSubmit(undefined, 'The Pythagoras Theorem');
            }}
            className="px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors flex items-center gap-1"
          >
            <span>Scenario 2: Pythagoras Theorem (Quiz)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setPathInput('SQL');
              handlePathSubmit(undefined, 'SQL');
            }}
            className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center gap-1"
          >
            <span>Scenario 3: SQL Learning Path</span>
          </button>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* ========================================================================= */}
        {/* TAB 1: MULTI-MODULE DASHBOARD (Exact representation of Fig. EDUGENIE)     */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* 1. Q&A MODULE */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/90 transition-all hover:shadow-md">
              <form onSubmit={handleQaSubmit}>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="qa-input" className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    Ask EduGenie a Question:
                  </label>
                  <span className="text-[11px] font-medium text-slate-400">Endpoint: /qa</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    id="qa-input"
                    type="text"
                    value={qaInput}
                    onChange={(e) => setQaInput(e.target.value)}
                    placeholder="Why is the sky blue? or Which is the largest ocean?"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-sm transition-all"
                    required
                  />
                  <button
                    type="submit"
                    disabled={qaLoading}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm transition-all disabled:opacity-50 whitespace-nowrap shadow-sm shadow-blue-500/20"
                  >
                    {qaLoading ? 'Thinking...' : 'Get Answer'}
                  </button>
                </div>
              </form>

              {qaError && (
                <div className="mt-3 p-3 text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
                  {qaError}
                </div>
              )}

              {qaAnswer && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 text-xs font-semibold text-slate-600">
                    <span>Answer:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => speakText(qaAnswer)}
                        title="Listen"
                        className="p-1 hover:text-blue-600 transition-colors"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(qaAnswer, 'qa')}
                        title="Copy"
                        className="p-1 hover:text-blue-600 transition-colors"
                      >
                        {copiedId === 'qa' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">{qaAnswer}</p>
                </div>
              )}
            </div>

            {/* 2. EXPLANATION MODULE */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/90 transition-all hover:shadow-md">
              <form onSubmit={handleExplainSubmit}>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="explain-input" className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Need an Explanation?
                  </label>
                  <span className="text-[11px] font-medium text-slate-400">Endpoint: /explain</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    id="explain-input"
                    type="text"
                    value={explainInput}
                    onChange={(e) => setExplainInput(e.target.value)}
                    placeholder="Photosynthesis, Quantum Computing, or Binary Search Algorithm"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-sm transition-all"
                    required
                  />
                  <button
                    type="submit"
                    disabled={explainLoading}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm transition-all disabled:opacity-50 whitespace-nowrap shadow-sm shadow-blue-500/20"
                  >
                    {explainLoading ? 'Explaining...' : 'Explain'}
                  </button>
                </div>
              </form>

              {explainError && (
                <div className="mt-3 p-3 text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
                  {explainError}
                </div>
              )}

              {explainOutput && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 text-xs font-semibold text-slate-600">
                    <span>Explanation:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => speakText(explainOutput)}
                        title="Listen"
                        className="p-1 hover:text-blue-600 transition-colors"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(explainOutput, 'explain')}
                        title="Copy"
                        className="p-1 hover:text-blue-600 transition-colors"
                      >
                        {copiedId === 'explain' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">{explainOutput}</p>
                </div>
              )}
            </div>

            {/* 3. SUMMARIZATION MODULE */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/90 transition-all hover:shadow-md">
              <form onSubmit={handleSummarySubmit}>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="summary-input" className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Summarize a Paragraph:
                  </label>
                  <span className="text-[11px] font-medium text-slate-400">Endpoint: /summarize</span>
                </div>
                <div className="space-y-2.5">
                  <textarea
                    id="summary-input"
                    rows={3}
                    value={summaryInput}
                    onChange={(e) => setSummaryInput(e.target.value)}
                    placeholder="Paste long content to summarize (e.g. historical events, textbook pages, research summaries)..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-sm transition-all"
                    required
                  />
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() =>
                        setSummaryInput(
                          'The Industrial Revolution, which began in the late 18th century, marked a major turning point in human history. It shifted economies from agriculture and handcrafted goods to machine-driven mass production. While it boosted economies and created cities, it also brought harsh working conditions and pollution.'
                        )
                      }
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Insert sample paragraph
                    </button>
                    <button
                      type="submit"
                      disabled={summaryLoading}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm transition-all disabled:opacity-50 whitespace-nowrap shadow-sm shadow-blue-500/20"
                    >
                      {summaryLoading ? 'Summarizing...' : 'Summarize'}
                    </button>
                  </div>
                </div>
              </form>

              {summaryError && (
                <div className="mt-3 p-3 text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
                  {summaryError}
                </div>
              )}

              {summaryOutput && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 text-xs font-semibold text-slate-600">
                    <span>Summary:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => speakText(summaryOutput)}
                        title="Listen"
                        className="p-1 hover:text-blue-600 transition-colors"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(summaryOutput, 'summary')}
                        title="Copy"
                        className="p-1 hover:text-blue-600 transition-colors"
                      >
                        {copiedId === 'summary' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">{summaryOutput}</p>
                </div>
              )}
            </div>

            {/* 4. QUIZ MODULE (Page 14 Screenshot exact fidelity) */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/90 transition-all hover:shadow-md">
              <form onSubmit={handleQuizSubmit}>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="quiz-input" className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Generate a Quiz:
                  </label>
                  <span className="text-[11px] font-medium text-slate-400">Endpoint: /quiz</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    id="quiz-input"
                    type="text"
                    value={quizInput}
                    onChange={(e) => setQuizInput(e.target.value)}
                    placeholder="Pythagoras theorem or Solar System"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-sm transition-all"
                    required
                  />
                  <button
                    type="submit"
                    disabled={quizLoading}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm transition-all disabled:opacity-50 whitespace-nowrap shadow-sm shadow-blue-500/20"
                  >
                    {quizLoading ? 'Generating...' : 'Generate Quiz'}
                  </button>
                </div>
              </form>

              {quizError && (
                <div className="mt-3 p-3 text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
                  {quizError}
                </div>
              )}

              {quizList.length > 0 && (
                <div className="mt-5 p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-6">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-sm font-bold text-slate-900">Quiz:</span>
                    <button
                      onClick={() => {
                        setUserAnswers({});
                        setQuizFeedback({});
                      }}
                      className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset Answers
                    </button>
                  </div>

                  {quizList.map((q, idx) => {
                    const fb = quizFeedback[idx];
                    return (
                      <div key={idx} className="space-y-3 pb-5 border-b border-slate-200 last:border-b-0 last:pb-0">
                        <p className="text-sm font-semibold text-slate-900">
                          Q{idx + 1}: {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = userAnswers[idx] === opt;
                            return (
                              <label
                                key={optIdx}
                                className={`flex items-start gap-3 p-2.5 rounded-lg border text-sm cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-blue-50/80 border-blue-400 text-blue-950 font-medium'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/70'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`quiz-q-${idx}`}
                                  value={opt}
                                  checked={isSelected}
                                  onChange={() =>
                                    setUserAnswers((prev) => ({
                                      ...prev,
                                      [idx]: opt,
                                    }))
                                  }
                                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                                />
                                <span>{opt}</span>
                              </label>
                            );
                          })}
                        </div>

                        <div>
                          <button
                            type="button"
                            onClick={() => handleCheckQuizAnswer(idx)}
                            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors shadow-sm"
                          >
                            Check Answer
                          </button>
                        </div>

                        {fb?.isChecked && (
                          <div
                            className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 animate-fadeIn ${
                              fb.isCorrect
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {fb.isCorrect ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Correct!</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                <span>Incorrect. Correct answer: {q.answer}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 5. LEARNING RECOMMENDATIONS MODULE */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/90 transition-all hover:shadow-md">
              <form onSubmit={handlePathSubmit}>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="path-input" className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-purple-600" />
                    Get Learning Recommendations:
                  </label>
                  <span className="text-[11px] font-medium text-slate-400">Endpoint: /learn/recommendations</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    id="path-input"
                    type="text"
                    value={pathInput}
                    onChange={(e) => setPathInput(e.target.value)}
                    placeholder="e.g. SQL, Linear Regression, or Cybersecurity"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-sm transition-all"
                    required
                  />
                  <button
                    type="submit"
                    disabled={pathLoading}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm transition-all disabled:opacity-50 whitespace-nowrap shadow-sm shadow-blue-500/20"
                  >
                    {pathLoading ? 'Planning...' : 'Get Recommendations'}
                  </button>
                </div>
              </form>

              {pathError && (
                <div className="mt-3 p-3 text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
                  {pathError}
                </div>
              )}

              {pathOutput && (
                <div className="mt-4 p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 text-xs font-semibold text-slate-600">
                    <span>Learning Recommendations for &quot;{pathInput}&quot;:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(pathOutput, 'path')}
                        title="Copy"
                        className="p-1 hover:text-blue-600 transition-colors"
                      >
                        {copiedId === 'path' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm leading-relaxed text-slate-800 font-mono whitespace-pre-wrap bg-white p-4 rounded-lg border border-slate-200 max-h-96 overflow-y-auto">
                    {pathOutput}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: FOCUSED TASK VIEW WITH DROPDOWN (Milestone 3 Activity 3.1)          */}
        {/* ========================================================================= */}
        {activeTab === 'focused' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">Task-Driven Single View</h2>
              <p className="text-xs text-slate-500">
                Implements Milestone 3 Activity 3.1: Task dropdown with text area and direct submit.
              </p>
            </div>

            <form onSubmit={handleFocusedTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Educational Task:
                </label>
                <div className="relative">
                  <select
                    value={selectedTask}
                    onChange={(e: any) => setSelectedTask(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-sm font-medium"
                  >
                    <option value="qa">Ask a Question (Q&A /qa)</option>
                    <option value="explain">Explain a Concept (/explain)</option>
                    <option value="summary">Summarize Content (/summarize)</option>
                    <option value="quiz">Generate 3-Question Quiz (/quiz)</option>
                    <option value="recommend">Get Learning Path (/learn/recommendations)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Input Topic or Content:
                </label>
                <textarea
                  rows={4}
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  placeholder={
                    selectedTask === 'qa'
                      ? 'e.g., Which is the largest ocean?'
                      : selectedTask === 'explain'
                      ? 'e.g., Quantum Computing or Photosynthesis'
                      : selectedTask === 'summary'
                      ? 'Paste long educational text to simplify...'
                      : selectedTask === 'quiz'
                      ? 'Topic or passage for generating 3 MCQs...'
                      : 'Topic for learning roadmap, e.g., SQL'
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={taskLoading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-md shadow-blue-500/20"
              >
                {taskLoading ? 'Processing Request with Gemini...' : 'Submit Task'}
              </button>
            </form>

            {taskError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                {taskError}
              </div>
            )}

            {taskResult && (
              <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Result for {selectedTask.toUpperCase()}:
                </div>

                {taskResult.type === 'quiz' ? (
                  <div className="space-y-4">
                    {(taskResult.content as QuizQuestion[]).map((q, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200">
                        <p className="font-semibold text-sm text-slate-900">
                          {idx + 1}. {q.question}
                        </p>
                        <ul className="mt-2 space-y-1 text-xs text-slate-700">
                          {q.options.map((opt, i) => (
                            <li key={i} className="pl-2 border-l-2 border-slate-200">
                              {opt}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-2 text-xs font-medium text-emerald-700">
                          Answer: {q.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-sm whitespace-pre-wrap text-slate-800 font-sans">
                    {taskResult.content}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-slate-400">
        <p>EduGenie &bull; Google Gemini Powered Learning Assistant &bull; SmartBridge & SmartInternz Project</p>
      </footer>
    </div>
  );
}
