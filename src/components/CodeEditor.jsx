import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { codeSnippets } from "../constants.js";

export default function CodeEditor({ activeAlgo, compareA, setCompareA, compareB, setCompareB, graphInput, setGraphInput, buildGraph }) {
  return (
    <>
      <div className="flex-1 overflow-auto bg-transparent"> 
        <SyntaxHighlighter language="cpp" style={vscDarkPlus} showLineNumbers={true} customStyle={{ margin: 0, background: 'transparent', fontSize: '13.5px', padding: '1.5rem' }}>
          {codeSnippets[activeAlgo]}
        </SyntaxHighlighter>
      </div>

      {activeAlgo === 'compare' && (
        <div className="bg-[#121214] p-5 border-t border-white/5 flex justify-between gap-4 shrink-0">
           <select className="flex-1 bg-zinc-900 text-zinc-200 text-sm font-semibold p-2.5 rounded-lg border border-zinc-800 focus:outline-none focus:border-violet-500" value={compareA} onChange={e => setCompareA(e.target.value)}>
              <option value="dijkstra">Dijkstra</option>
              <option value="bellman">Bellman-Ford</option>
           </select>
           <span className="text-zinc-600 font-black self-center text-xs">VS</span>
           <select className="flex-1 bg-zinc-900 text-zinc-200 text-sm font-semibold p-2.5 rounded-lg border border-zinc-800 focus:outline-none focus:border-violet-500" value={compareB} onChange={e => setCompareB(e.target.value)}>
              <option value="bellman">Bellman-Ford</option>
              <option value="floyd">Floyd-Warshall</option>
           </select>
        </div>
      )}
      
      {/* Bottom Input Section */}
      <div className="flex flex-col bg-[#121214] border-t border-white/5 min-h-[250px]">
        <div className="flex-1 p-6 pb-4 flex flex-col">
          <label className="text-xs font-bold text-violet-400 tracking-widest uppercase mb-3">Graph Settings (CSES)</label>
          <div className="text-[11px] text-zinc-500 font-mono mb-4 bg-zinc-950/50 p-3 rounded-lg border border-white/5 leading-relaxed">
            1 ≤ n ≤ 100 <br/> 1 ≤ m ≤ 400 <br/> -10⁹ ≤ c ≤ 10⁹ <br/>
            <span className="text-fuchsia-400 mt-1 block font-semibold">Format: (n m), Next m lines: (u v w)</span>
          </div>
          <textarea className="flex-1 bg-zinc-950/80 border border-white/5 rounded-lg p-3 text-zinc-300 font-mono text-sm focus:border-violet-500 focus:ring-1 outline-none resize-none min-h-[100px]" value={graphInput} onChange={(e) => setGraphInput(e.target.value)} spellCheck="false" />
        </div>
        <div className="px-6 pb-6 pt-0">
          <button onClick={buildGraph} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold tracking-wide text-sm transition-colors border border-white/5 shadow-lg">
            Build Graph
          </button>
        </div>
      </div>
    </>
  );
}