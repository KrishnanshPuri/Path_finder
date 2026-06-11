export default function TerminalPanel({ terminalOutput, setTerminalOutput, isCanvasLocked, setIsCanvasLocked, sourceNode, setSourceNode, destNode, setDestNode, executeEngine }) {
  return (
    <div className="bg-[#000000] flex flex-col h-full">
      <div className="bg-[#0a0a0c] px-6 py-3 border-b border-white/5 flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest hidden sm:block">Terminal Output</span>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setIsCanvasLocked(!isCanvasLocked)} className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all ${ isCanvasLocked ? 'bg-fuchsia-900/30 border-fuchsia-500/50 text-fuchsia-400' : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-white' }`}>
            {isCanvasLocked ? '🔒 Locked' : '🔓 Unlocked'}
          </button>

          <div className="flex items-center gap-3 bg-zinc-950/50 p-1.5 rounded-lg border border-white/5">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider pl-2">Source (u)</label>
            <input type="text" value={sourceNode} onChange={e => setSourceNode(e.target.value)} className="w-10 bg-zinc-900 border border-white/5 rounded text-center text-white font-mono py-1 focus:outline-none focus:border-fuchsia-500 text-xs" />
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider ml-1">Dest (v)</label>
            <input type="text" value={destNode} onChange={e => setDestNode(e.target.value)} className="w-10 bg-zinc-900 border border-white/5 rounded text-center text-white font-mono py-1 focus:outline-none focus:border-fuchsia-500 text-xs" />
            
            <button onClick={executeEngine} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-5 py-1.5 rounded-md font-bold text-[11px] tracking-wider transition-all active:scale-95 ml-2">
              EXECUTE
            </button>
          </div>
        </div>
        
        <button onClick={() => setTerminalOutput("")} className="text-[11px] font-bold text-zinc-500 hover:text-fuchsia-400 transition-colors uppercase tracking-widest">
          Clear
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto font-mono text-sm leading-relaxed text-[#34d399]">
        <pre className="whitespace-pre-wrap">{terminalOutput}</pre>
      </div>
    </div>
  );
}