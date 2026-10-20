import React from 'react';
import { 
  Bot, 
  Layers, 
  BookOpen, 
  BarChart3, 
  FlaskConical, 
  ShieldCheck, 
  Sparkles,
  UserCheck
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab, stats }) {
  const tabs = [
    { id: 'queue', label: 'Ticket Workbench', icon: Layers, badge: stats?.pendingCount || '27' },
    { id: 'lab', label: 'Pipeline Lab', icon: FlaskConical },
    { id: 'kb', label: 'Knowledge Base', icon: BookOpen, badge: '14' },
    { id: 'analytics', label: 'Analytics & Audit', icon: BarChart3 },
  ];

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">IT AMS</h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> AI Assist
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Local TF-IDF Active
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Ticket Classification & Knowledge Resolution</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono ${
                      isActive ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile / Status */}
          <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-800">
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-200">Alex Mercer</p>
              <p className="text-[11px] text-slate-400">L1 Support Analyst</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
