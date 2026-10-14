import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, Cpu, Database, Code, Globe, GitBranch, Library, Mail, 
  Send, Upload, FileText, CheckCircle2, AlertCircle, Settings, 
  Layers, Server, ChevronRight, Sparkles, RefreshCw, MessageSquare, HelpCircle, Check, Copy
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [backendUrl, setBackendUrl] = useState('http://localhost:8000');
  const [isUrlSaved, setIsUrlSaved] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I am your Enterprise RAG assistant connected to the backend. Ask me anything about the uploaded documents." }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const chatBottomRef = useRef(null);

  // Document upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null); // 'uploading' | 'success' | 'error'
  const [uploadMessage, setUploadMessage] = useState('');

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSaveBackendUrl = (e) => {
    e.preventDefault();
    setIsUrlSaved(true);
    setTimeout(() => setIsUrlSaved(false), 3000);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploadStatus('uploading');
    setUploadMessage('Uploading and parsing document via FastAPI...');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${backendUrl.replace(/\/$/, '')}/api/v1/documents/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      setUploadStatus('success');
      setUploadMessage('Document successfully ingested and indexed into pgvector!');
    } catch (err) {
      setUploadStatus('error');
      setUploadMessage(`Upload failed: ${err.message}. Make sure backend is running & CORS is enabled.`);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputQuery.trim() || isStreaming) return;

    const userMsg = inputQuery;
    setInputQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }, { role: 'assistant', content: '' }]);
    setIsStreaming(true);

    try {
      const response = await fetch(`${backendUrl.replace(/\/$/, '')}/api/v1/rag/query/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg })
      });

      if (!response.ok) {
        throw new Error(`RAG query failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        // Handle server sent events or raw chunk text
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const dataContent = line.replace('data:', '').trim();
            if (dataContent === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataContent);
              if (parsed.answer) {
                assistantResponse += parsed.answer;
              } else if (typeof parsed === 'string') {
                assistantResponse += parsed;
              }
            } catch {
              assistantResponse += dataContent;
            }
          } else if (line.trim()) {
            assistantResponse += line;
          }
        }

        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].content = assistantResponse || chunk;
          return newMsgs;
        });
      }
    } catch (err) {
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1].content = `[Error connecting to RAG backend: ${err.message}. Please check your connection URL in settings.]`;
        return newMsgs;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const scrollToProjects = (e) => {
    e.preventDefault();
    const elem = document.getElementById('projects');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToContact = (e) => {
    e.preventDefault();
    const elem = document.getElementById('contact-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('portfolio')}>
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl shadow-lg shadow-indigo-500/20">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-400">
              MY PORTFOLIO
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            <button 
              onClick={() => setActiveTab('portfolio')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'portfolio' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
            >
              Portfolio
            </button>
            <button 
              onClick={() => setActiveTab('playground')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${activeTab === 'playground' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
            >
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>RAG & IDP Playground</span>
            </button>
          </nav>
          {activeTab === 'portfolio' && (
              <button
                onClick={scrollToContact}
                className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5"
              >
                <Mail className="w-4 h-4" />
                <span>Contact</span>
              </button>
            )}
        </div>
      </header>

      {/* Mobile Nav Subbar */}
      <div className="md:hidden flex border-b border-slate-800 bg-slate-900/50">
        <button 
          onClick={() => setActiveTab('portfolio')}
          className={`flex-1 py-3 text-center text-sm font-medium border-b-2 ${activeTab === 'portfolio' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400'}`}
        >
          Portfolio
        </button>
        <button 
          onClick={() => setActiveTab('playground')}
          className={`flex-1 py-3 text-center text-sm font-medium border-b-2 flex items-center justify-center space-x-1 ${activeTab === 'playground' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400'}`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>RAG Playground</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'portfolio' ? (
          <div className="space-y-16 animate-fade-in">
            
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/40 to-slate-950 border border-slate-800/80 p-8 sm:p-12 lg:p-16">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-semibold mb-6">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                  <span>Prem Kumar Mishra — Software & AI Engineer</span>
                </div>
                
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                  Building Enterprise RAG & <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">Intelligent Systems</span>
                </h1>
                
                <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                  Hi, I'm <strong className="text-white">Prem Kumar Mishra</strong>. I specialize in designing scalable backend architectures, vector retrieval pipelines, and intelligent document systems, taking complete ownership of complex codebases to deliver production-ready software.
                </p>

                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => setActiveTab('playground')}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2"
                  >
                    <span>RAG Playground</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <a 
                    href="#projects"
                    onClick={scrollToProjects}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium border border-slate-700 transition-all cursor-pointer"
                  >
                    Explore Projects
                  </a>
                </div>
              </div>
            </section>

            {/* Skills & Tech Stack Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <Code className="w-6 h-6 text-indigo-400" />
                  <span>Technical Expertise</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="p-3 bg-indigo-500/10 rounded-xl w-fit mb-4">
                    <Server className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Backend & APIs</h3>
                  <p className="text-sm text-slate-400 mb-4">High-throughput asynchronous servers and robust API gateways.</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 bg-slate-800 text-indigo-300 rounded-lg text-xs font-medium border border-slate-700">Python</span>
                    <span className="px-2.5 py-1 bg-slate-800 text-indigo-300 rounded-lg text-xs font-medium border border-slate-700">Numpy</span>
                    <span className="px-2.5 py-1 bg-slate-800 text-indigo-300 rounded-lg text-xs font-medium border border-slate-700">Pandas</span>
                    <span className="px-2.5 py-1 bg-slate-800 text-indigo-300 rounded-lg text-xs font-medium border border-slate-700">Matplotlib</span>
                    <span className="px-2.5 py-1 bg-slate-800 text-indigo-300 rounded-lg text-xs font-medium border border-slate-700">FastAPI</span>
                    <span className="px-2.5 py-1 bg-slate-800 text-indigo-300 rounded-lg text-xs font-medium border border-slate-700">REST / SSE</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="p-3 bg-violet-500/10 rounded-xl w-fit mb-4">
                    <Cpu className="w-6 h-6 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Machine Learning & RAG</h3>
                  <p className="text-sm text-slate-400 mb-4">Vector databases, embeddings pipelines, and LLM orchestration.</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 bg-slate-800 text-violet-300 rounded-lg text-xs font-medium border border-slate-700">Tensorflow</span>
                    <span className="px-2.5 py-1 bg-slate-800 text-violet-300 rounded-lg text-xs font-medium border border-slate-700">OpenCV</span>
                    <span className="px-2.5 py-1 bg-slate-800 text-violet-300 rounded-lg text-xs font-medium border border-slate-700">Scikit-Learn</span>
                    <span className="px-2.5 py-1 bg-slate-800 text-violet-300 rounded-lg text-xs font-medium border border-slate-700">pgvector</span>
                    <span className="px-2.5 py-1 bg-slate-800 text-violet-300 rounded-lg text-xs font-medium border border-slate-700">Groq API</span>
                    <span className="px-2.5 py-1 bg-slate-800 text-violet-300 rounded-lg text-xs font-medium border border-slate-700">Sentence Transformers</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="p-3 bg-cyan-500/10 rounded-xl w-fit mb-4">
                    <Database className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Databases & Storage</h3>
                  <p className="text-sm text-slate-400 mb-4">Relational modeling and efficient vector similarity search.</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 bg-slate-800 text-cyan-300 rounded-lg text-xs font-medium border border-slate-700">PostgreSQL</span>
                    <span className="px-2.5 py-1 bg-slate-800 text-cyan-300 rounded-lg text-xs font-medium border border-slate-700">SQLAlchemy</span>
                    <span className="px-2.5 py-1 bg-slate-800 text-cyan-300 rounded-lg text-xs font-medium border border-slate-700">Vector Indexing</span>
                  </div>
                </div>

              </div>
            </section>

            {/* Projects Showcase Section */}
            <section id="projects" className="space-y-6 scroll-mt-24">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <Layers className="w-6 h-6 text-indigo-400" />
                  <span>Featured Projects</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Project 1 */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/50 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-semibold border border-indigo-500/20">Enterprise RAG & IDP</span>
                      <div className="flex space-x-2">
                        <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                        <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                        <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Enterprise RAG & Intelligent Document Processing</h3>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                      End-to-end intelligent document processing system built with FastAPI, PostgreSQL pgvector for similarity search, and Groq streaming chat completion for grounded Q&A.
                    </p>
                  </div>
                  <div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md text-xs">FastAPI</span>
                      <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md text-xs">PostgreSQL pgvector</span>
                      <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md text-xs">Groq API</span>
                      <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md text-xs">Docker</span>
                      <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md text-xs">Docker Compose</span>
                    </div>
                    <button 
                      onClick={() => setActiveTab('playground')}
                      className="w-full py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl font-medium text-sm transition-all flex items-center justify-center space-x-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Launch RAG Playground</span>
                    </button>
                  </div>
                </div>

                {/* Project 2 */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-violet-500/50 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-violet-500/10 text-violet-400 rounded-full text-xs font-semibold border border-violet-500/20">Game Infrastructure & Launcher</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">IGI-2 Multiplayer Master Server & PyQt5 Launcher</h3>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                      <strong className="text-slate-300">MPA Launcher</strong>, a game launcher consisting of custom master server implementation for classic tactical shooter IGI-2 with custom matchmaking protocol and a polished PyQt5 desktop client for server browser & mod launching.
                    </p>
                  </div>
                  <div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md text-xs">Python</span>
                      <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md text-xs">PyQt5</span>
                      <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md text-xs">Networking Sockets</span>
                      <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md text-xs">Low Level System APIS</span>
                      <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md text-xs">Master Server</span>
                      <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md text-xs">Unique System ID Research</span>
                    </div>
                    <div>
                        <a 
                            href="https://igi-2-mpa-official.onrender.com/" target="_blank" rel="noopener noreferrer"
                            className="py-2.5 text-center text-sm font-medium text-indigo-300 bg-indigo-600/10 hover:bg-indigo-600/20 rounded-xl border border-indigo-500/30 transition-all flex items-center justify-center space-x-2 block w-full"
                            >
                                <span>Visit Website</span>
                        </a>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* Contact / Social Footer Section */}
            <section id="contact-section" className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
              <div className="max-w-2xl mx-auto space-y-6">
                <h2 className="text-3xl font-bold text-white">Let's Build Something Amazing</h2>
                <p className="text-slate-400">
                  Looking for an AI/ML developer or backend engineer for your next project or internship? Let's connect.
                </p>
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <a href="https://github.com/PremKumarMishra" target="_blank" rel="noreferrer" className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium border border-slate-700 transition-all flex items-center space-x-2">
                    <GitBranch className="w-5 h-5" />
                    <span>GitHub</span>
                  </a>
                  <a href="https://linkedin.com/in/prem-kumar-mishra-72a246417/" target="_blank" rel="noreferrer" className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium border border-slate-700 transition-all flex items-center space-x-2">
                    <Library className="w-5 h-5" />
                    <span>LinkedIn</span>
                  </a>
                  <a href="https://mail.google.com/mail/?view=cm&fs=1&to=prem23375@gmail.com" className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2">
                    <Mail className="w-5 h-5" />
                    <span>Email Me</span>
                  </a>
                </div>
              </div>
            </section>

          </div>
        ) : (
          /* RAG & IDP Dashboard Playground */
          <div className="space-y-8 animate-fade-in">
            
            {/* Header & Connection Panel */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                    <span>RAG & IDP Playground Dashboard</span>
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Upload documents to your backend and interact with your enterprise RAG system in real-time.
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                    Backend Connected
                  </span>
                </div>
              </div>

              {/* Backend URL Config form */}
              <form onSubmit={handleSaveBackendUrl} className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-800">
                <div className="flex items-center space-x-2 text-sm text-slate-300 font-medium whitespace-nowrap">
                  <Settings className="w-4 h-4 text-indigo-400" />
                  <span>FastAPI Backend URL:</span>
                </div>
                <input 
                  type="text" 
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  placeholder="http://localhost:8000"
                  className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <button 
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-600/20"
                >
                  {isUrlSaved ? 'Saved!' : 'Update URL'}
                </button>
              </form>
            </div>

            {/* Grid Layout for Upload & Chat */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Document Upload Section */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
                    <Upload className="w-5 h-5 text-indigo-400" />
                    <span>Document Ingestion</span>
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">
                    Upload PDF reports or technical notes to populate your PostgreSQL pgvector store (`/api/v1/documents/upload`).
                  </p>

                  <form onSubmit={handleFileUpload} className="space-y-4">
                    <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-6 text-center transition-all bg-slate-950/50">
                      <FileText className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
                      <input 
                        type="file" 
                        accept=".pdf,.txt,.docx"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="text-sm font-medium text-indigo-400 hover:underline">Choose file</span>
                        <span className="text-sm text-slate-400 block mt-1 truncate max-w-xs mx-auto">
                          {selectedFile ? selectedFile.name : 'No file selected (PDF/TXT)'}
                        </span>
                      </label>
                    </div>

                    <button 
                      type="submit"
                      disabled={!selectedFile || uploadStatus === 'uploading'}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white rounded-xl font-medium text-sm shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
                    >
                      {uploadStatus === 'uploading' ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Processing Document...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Upload & Index Document</span>
                        </>
                      )}
                    </button>
                  </form>

                  {uploadStatus && (
                    <div className={`mt-4 p-4 rounded-xl border text-sm flex items-start space-x-3 ${
                      uploadStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
                      uploadStatus === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-300' :
                      'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                    }`}>
                      {uploadStatus === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />}
                      {uploadStatus === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />}
                      {uploadStatus === 'uploading' && <RefreshCw className="w-5 h-5 flex-shrink-0 text-indigo-400 animate-spin mt-0.5" />}
                      <div className="flex-1 break-words">{uploadMessage}</div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                  <h4 className="text-sm font-semibold text-white mb-2 flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4 text-indigo-400" />
                    <span>How RAG IDP Works</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Documents are chunked, embedded via Sentence Transformers, and stored in PostgreSQL pgvector. Queries retrieve top matching context chunks and stream grounded answers via Groq LLM.
                  </p>
                </div>
              </div>

              {/* RAG Interactive Chat Section */}
              <div className="lg:col-span-2 flex flex-col bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md h-[650px]">
                
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">Enterprise RAG Live Chat</h3>
                      <p className="text-xs text-slate-400">Connected to <code className="text-indigo-400">/api/v1/rag/query/stream</code></p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setMessages([{ role: 'assistant', content: "Chat cleared. Ask me a question about your documents!" }])}
                    className="text-xs text-slate-400 hover:text-white px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
                  >
                    Clear Chat
                  </button>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20' 
                          : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-bl-none'
                      }`}>
                        {msg.content || (
                          <div className="flex items-center space-x-2 text-indigo-400 py-1">
                            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></span>
                            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]"></span>
                            <span className="text-xs text-slate-400 ml-2">Streaming tokens...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950/40 rounded-b-2xl">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="text" 
                      value={inputQuery}
                      onChange={(e) => setInputQuery(e.target.value)}
                      placeholder={isStreaming ? "Waiting for AI response..." : "Ask a question regarding your ingested documents..."}
                      disabled={isStreaming}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                    />
                    <button 
                      type="submit"
                      disabled={!inputQuery.trim() || isStreaming}
                      className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-medium shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </div>
                </form>

              </div>

            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 mt-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} Prem Kumar Mishra — Engineering Portfolio. All rights reserved.
          </div>
          <div className="flex items-center space-x-6">
            <button onClick={() => setActiveTab('portfolio')} className="hover:text-slate-300 transition-all">Portfolio</button>
            <button onClick={() => setActiveTab('playground')} className="hover:text-slate-300 transition-all">RAG Playground</button>
          </div>
        </div>
      </footer>

    </div>
  );
}