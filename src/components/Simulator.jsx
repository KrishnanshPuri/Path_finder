import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, { Background, Controls, applyNodeChanges, applyEdgeChanges, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Group, Panel, Separator } from "react-resizable-panels";
import createModule from '../graph_wasm.js';

const nodeStyle = { 
  background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)', 
  color: '#ffffff', 
  fontWeight: '800',
  fontSize: '16px',
  border: '2px solid rgba(255, 255, 255, 0.2)', 
  borderRadius: '50%', 
  boxShadow: '0 8px 20px -4px rgba(217, 70, 239, 0.4)', 
  width: 50, height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' 
};

const codeSnippets = {
  dijkstra: `vector<int> dijkstra(int start, int end) {\n    unordered_map<int, int> dist, parent;\n    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;\n    \n    for(auto node : nodes) dist[node] = 1e9;\n    dist[start] = 0;\n    pq.push({0, start});\n\n    while (!pq.empty()) {\n        int u = pq.top().second;\n        pq.pop();\n        \n        for (auto& edge : adj[u]) {\n            int v = edge.first, w = edge.second;\n            if (dist[u] + w < dist[v]) {\n                dist[v] = dist[u] + w;\n                parent[v] = u;\n                pq.push({dist[v], v});\n            }\n        }\n    }\n    return reconstructPath(parent, start, end);\n}`,
  bellman: `vector<int> bellmanFord(int start, int end) {\n    unordered_map<int, int> dist;\n    dist[start] = 0;\n    \n    for (int i = 0; i < V - 1; i++) {\n        for (auto& pair : adj) {\n            int u = pair.first;\n            for (auto& edge : pair.second) {\n                int v = edge.first, w = edge.second;\n                if (dist[u] != 1e9 && dist[u] + w < dist[v]) {\n                    dist[v] = dist[u] + w;\n                }\n            }\n        }\n    }\n    return path;\n}`,
  floyd: `vector<int> floydWarshall(int start, int end) {\n    vector<vector<int>> dist(V, vector<int>(V, 1e9));\n    for(int i=0; i<V; i++) dist[i][i] = 0;\n\n    for (int k = 0; k < V; k++) {\n        for (int i = 0; i < V; i++) {\n            for (int j = 0; j < V; j++) {\n                if (dist[i][k] != 1e9 && dist[k][j] != 1e9 && \n                    dist[i][k] + dist[k][j] < dist[i][j]) {\n                    dist[i][j] = dist[i][k] + dist[k][j];\n                }\n            }\n        }\n    }\n    return path;\n}`,
  compare: `// --- ALGORITHM BENCHMARKING ---\n// Select algorithms below to benchmark.\n// Both algorithms will execute simultaneously.\n// Output will display precise execution times.`
};

export default function Simulator() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [activeAlgo, setActiveAlgo] = useState('dijkstra');
  
  const [graphInput, setGraphInput] = useState("10 20\n1 2 5\n1 3 2\n2 4 1\n2 5 7\n3 5 3\n3 6 4\n4 7 8\n5 7 2\n5 8 6\n6 8 3\n6 9 1\n7 10 9\n8 10 2\n9 10 5\n1 4 6\n2 6 8\n3 2 1\n4 8 4\n7 9 3\n8 9 2"); 
  
  const [wasmModule, setWasmModule] = useState(null);
  const [sourceNode, setSourceNode] = useState('1');
  const [destNode, setDestNode] = useState('10'); 
  const [terminalOutput, setTerminalOutput] = useState("System Initialization Complete. Engine Ready.\n");

  const [compareA, setCompareA] = useState('dijkstra');
  const [compareB, setCompareB] = useState('bellman');
  const [isCanvasLocked, setIsCanvasLocked] = useState(false);
  
  // NEW: Store the graph camera instance
  const [rfInstance, setRfInstance] = useState(null);

  useEffect(() => {
    createModule().then(Module => setWasmModule(Module));
  }, []);

  // NEW: Force center the graph the exact moment the engine boots up
  useEffect(() => {
    if (rfInstance && nodes.length > 0) {
      window.requestAnimationFrame(() => {
        rfInstance.fitView({ padding: 0.2, duration: 800 });
      });
    }
  }, [rfInstance]);

  const buildGraph = () => {
    const lines = graphInput.trim().split('\n');
    const uniqueNodes = new Set();
    const newEdges = [];

    lines.forEach((line, index) => {
      const parts = line.trim().split(/\s+/);
      if (parts.length === 3) {
        const [u, v, w] = parts;
        uniqueNodes.add(u); uniqueNodes.add(v);
        newEdges.push({
          id: `e${u}-${v}-${index}`, source: u, target: v, label: w, type: 'straight',
          style: { stroke: '#52525b', strokeWidth: 2 }, 
          markerEnd: { type: MarkerType.ArrowClosed, color: '#52525b', width: 14, height: 14 }, 
          labelStyle: { fill: '#ffffff', fontWeight: '700', fontSize: 13, fontFamily: 'monospace' },
          labelBgStyle: { fill: '#18181b', fillOpacity: 0.8, rx: 6, ry: 6 }, animated: false,
        });
      }
    });

    const nodesArray = Array.from(uniqueNodes);
    const radius = Math.max(120, nodesArray.length * 30);
    const centerX = 350; const centerY = 250;

    const newNodes = nodesArray.map((nodeId, i) => {
      const angle = (i / nodesArray.length) * 2 * Math.PI;
      return { id: nodeId, position: { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) }, data: { label: nodeId }, style: nodeStyle };
    });

    setNodes(newNodes); setEdges(newEdges);
    setTerminalOutput(prev => prev + `> Geometry Compiled: ${nodesArray.length} Vertices, ${newEdges.length} Edges\n`);

    // NEW: Animate the camera to center whenever "Build Graph" is clicked
    if (rfInstance) {
      setTimeout(() => {
        window.requestAnimationFrame(() => rfInstance.fitView({ padding: 0.2, duration: 800 }));
      }, 50);
    }
  };

  useEffect(() => { buildGraph(); }, []);

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onNodesDelete = useCallback((deleted) => {
    setTerminalOutput(prev => prev + `> Vertex ${deleted[0].id} removed. Graph state altered.\n`);
  }, []);

  const animatePath = (pathNodes) => {
    setEdges(eds => eds.map(e => ({ ...e, style: { stroke: '#52525b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#52525b', width: 14, height: 14 }, animated: false })));
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep >= pathNodes.length - 1) { clearInterval(interval); return; }
      const u = pathNodes[currentStep]; const v = pathNodes[currentStep + 1];
      setEdges(eds => eds.map(edge => {
        if (edge.source === u && edge.target === v) {
          return { 
            ...edge, 
            style: { stroke: '#f59e0b', strokeWidth: 4, filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))' }, 
            markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b', width: 16, height: 16 }, 
            animated: true 
          };
        }
        return edge;
      }));
      currentStep++;
    }, 600);
  };

  const runAlgorithm = (cppGraph, algoName, start, end) => {
    const t0 = performance.now();
    let result;
    if (algoName === 'dijkstra') result = cppGraph.dijkstra(start, end);
    else if (algoName === 'bellman') result = cppGraph.bellmanFord(start, end);
    else if (algoName === 'floyd') result = cppGraph.floydWarshall(start, end);
    const t1 = performance.now();

    const jsPath = [];
    for (let i = 0; i < result.path.size(); i++) jsPath.push(result.path.get(i).toString());

    return { path: jsPath, cost: result.cost, message: result.message, matrix: result.matrix, time: (t1 - t0).toFixed(4) };
  };

  const executeEngine = () => {
    if (!wasmModule) return;
    const start = parseInt(sourceNode); const end = parseInt(destNode);
    
    let hasNegativeEdge = edges.some(e => parseInt(e.label) < 0);
    let isRunningDijkstra = activeAlgo === 'dijkstra' || (activeAlgo === 'compare' && (compareA === 'dijkstra' || compareB === 'dijkstra'));

    if (isRunningDijkstra && hasNegativeEdge) {
      setTerminalOutput(prev => prev + `\n[ERR] Dijkstra exception: Graph contains negative weights.\n`);
      return;
    }

    const cppGraph = new wasmModule.Graph();
    edges.forEach(e => cppGraph.addEdge(parseInt(e.source), parseInt(e.target), parseInt(e.label)));

    if (activeAlgo === 'compare') {
      const resA = runAlgorithm(cppGraph, compareA, start, end);
      const resB = runAlgorithm(cppGraph, compareB, start, end);
      
      let out = `\n--- BENCHMARK: ${compareA.toUpperCase()} vs ${compareB.toUpperCase()} ---\n`;
      out += `[${compareA.toUpperCase()}] Cost: ${resA.cost === -1 ? 'N/A' : resA.cost} | Time: ${resA.time} ms\n`;
      out += `[${compareB.toUpperCase()}] Cost: ${resB.cost === -1 ? 'N/A' : resB.cost} | Time: ${resB.time} ms\n`;
      out += `-------------------------------------------------\n`;
      setTerminalOutput(prev => prev + out);
      if(resA.path.length > 0) animatePath(resA.path);

    } else {
      const res = runAlgorithm(cppGraph, activeAlgo, start, end);
      
      let out = `\n> Executing ${activeAlgo.toUpperCase()} (${start} → ${end})\n`;
      if (res.message.includes("ERROR")) {
        out += `[ERR] ${res.message}\n`;
      } else {
        out += `Distance: ${res.cost === -1 ? '∞' : res.cost}\n`;
        if (res.path.length > 0) out += `Path: [ ${res.path.join(" → ")} ]\n`;
        out += `Time: ${res.time} ms\n`;
        
        if (activeAlgo === 'floyd') {
          out += `\n--- DISTANCE MATRIX ---\n${res.matrix}\n`;
        }
      }
      setTerminalOutput(prev => prev + out);
      if (res.path.length > 0) animatePath(res.path);
    }
    cppGraph.delete();
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#09090b] font-sans overflow-hidden text-slate-200">
      
      {/* TOP NAVBAR */}
      <div className="h-16 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h1 className="text-xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
            PATHFINDER
          </h1>
        </div>
        
        <div className="flex gap-6 h-full items-end">
          {['dijkstra', 'bellman', 'floyd', 'compare'].map((algo) => (
            <button key={algo} onClick={() => setActiveAlgo(algo)} 
              className={`relative pb-4 text-sm font-bold tracking-wider uppercase transition-colors duration-300 ${
                activeAlgo === algo ? 'text-fuchsia-400' : 'text-zinc-500 hover:text-zinc-300'
              } group`}
            >
              {algo}
              <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-transform duration-300 origin-left ${
                activeAlgo === algo ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`}></span>
            </button>
          ))}
        </div>
      </div>

      <Group orientation="horizontal" className="flex-1 overflow-hidden min-h-0">
        
        {/* LEFT PANEL */}
        <Panel defaultSize={30} minSize={20} className="flex flex-col bg-[#0c0c0e] min-w-0">
          <Group orientation="vertical">
            
            {/* TOP LEFT: IDE CODE */}
            <Panel defaultSize={75} minSize={30} className="flex flex-col min-h-0">
              <div className="flex-1 overflow-auto bg-transparent"> 
                <SyntaxHighlighter language="cpp" style={vscDarkPlus} showLineNumbers={true} customStyle={{ margin: 0, background: 'transparent', fontSize: '13.5px', padding: '1.5rem' }}>
                  {codeSnippets[activeAlgo]}
                </SyntaxHighlighter>
              </div>

              {activeAlgo === 'compare' && (
                <div className="bg-[#121214] p-5 border-t border-white/5 flex justify-between gap-4 shrink-0">
                   <select className="flex-1 bg-zinc-900 text-zinc-200 text-sm font-semibold p-2.5 rounded-lg border border-zinc-800 focus:outline-none focus:border-violet-500 transition-colors" value={compareA} onChange={e => setCompareA(e.target.value)}>
                      <option value="dijkstra">Dijkstra</option>
                      <option value="bellman">Bellman-Ford</option>
                   </select>
                   <span className="text-zinc-600 font-black self-center text-xs">VS</span>
                   <select className="flex-1 bg-zinc-900 text-zinc-200 text-sm font-semibold p-2.5 rounded-lg border border-zinc-800 focus:outline-none focus:border-violet-500 transition-colors" value={compareB} onChange={e => setCompareB(e.target.value)}>
                      <option value="bellman">Bellman-Ford</option>
                      <option value="floyd">Floyd-Warshall</option>
                   </select>
                </div>
              )}
            </Panel>

            <Separator className="h-1.5 bg-[#121214] hover:bg-violet-600/50 transition-colors cursor-row-resize flex justify-center items-center group shrink-0">
              <div className="w-8 h-0.5 bg-zinc-700 group-hover:bg-violet-400 rounded-full" />
            </Separator>

            {/* BOTTOM LEFT: INPUT PANEL (FIXED BUTTON) */}
            <Panel defaultSize={25} minSize={15} className="flex flex-col bg-[#121214] border-t border-white/5 min-h-0">
              
              {/* SCROLLABLE TEXT AREA */}
              <div className="flex-1 overflow-y-auto p-6 pb-4 flex flex-col min-h-0">
                <div className="flex justify-between items-end mb-3 shrink-0">
                  <label className="text-xs font-bold text-violet-400 tracking-widest uppercase">Graph Settings (CSES)</label>
                </div>
                <div className="text-[11px] text-zinc-500 font-mono mb-4 bg-zinc-950/50 p-3 rounded-lg border border-white/5 leading-relaxed shrink-0">
                  1 ≤ n ≤ 100 <br/> 1 ≤ m ≤ 400 <br/> -10⁹ ≤ c ≤ 10⁹ <br/>
                  <span className="text-fuchsia-400 mt-1 block font-semibold">Format: (n m), Next m lines: (u v w)</span>
                </div>
                <textarea className="flex-1 bg-zinc-950/80 border border-white/5 rounded-lg p-3 text-zinc-300 font-mono text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none resize-none transition-all min-h-[100px] shrink-0" value={graphInput} onChange={(e) => setGraphInput(e.target.value)} spellCheck="false" />
              </div>

              {/* FIXED BUTTON AT THE BOTTOM */}
              <div className="px-6 pb-6 pt-0 shrink-0 bg-[#121214]">
                <button onClick={buildGraph} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold tracking-wide text-sm transition-colors border border-white/5 shadow-lg">
                  Build Graph
                </button>
              </div>

            </Panel>
            
          </Group>
        </Panel>

        <Separator className="w-1.5 bg-[#121214] hover:bg-violet-600/50 transition-colors cursor-col-resize flex flex-col justify-center items-center group shrink-0">
          <div className="h-8 w-0.5 bg-zinc-700 group-hover:bg-violet-400 rounded-full" />
        </Separator>

        {/* RIGHT PANEL: Graph & Terminal Split */}
        <Panel defaultSize={70} minSize={40} className="flex flex-col min-w-0">
          <Group orientation="vertical">
            
            <Panel defaultSize={70} minSize={30} className="relative bg-[#050505] min-h-0">
              <ReactFlow 
                nodes={nodes} 
                edges={edges} 
                onNodesChange={onNodesChange} 
                onEdgesChange={onEdgesChange} 
                onNodesDelete={onNodesDelete} 
                onInit={setRfInstance} // Capturing the camera instance
                fitView 
                fitViewOptions={{ padding: 0.2 }}
                proOptions={{ hideAttribution: true }}
                nodesDraggable={!isCanvasLocked}
                panOnDrag={!isCanvasLocked}
                zoomOnScroll={!isCanvasLocked}
                zoomOnPinch={!isCanvasLocked}
                zoomOnDoubleClick={!isCanvasLocked}
                elementsSelectable={!isCanvasLocked}
              >
                <Background color="#27272a" gap={24} size={1} />
                <Controls showInteractive={false} className="bg-zinc-900 fill-zinc-400 border-zinc-800 shadow-xl rounded-lg overflow-hidden" /> 
              </ReactFlow>
            </Panel>

            <Separator className="h-1.5 bg-[#121214] hover:bg-fuchsia-600/50 transition-colors cursor-row-resize flex justify-center items-center group shrink-0">
              <div className="w-8 h-0.5 bg-zinc-700 group-hover:bg-fuchsia-400 rounded-full" />
            </Separator>

            <Panel defaultSize={30} minSize={15} className="bg-[#000000] flex flex-col min-h-0">
              
              <div className="bg-[#0a0a0c] px-6 py-3 border-b border-white/5 flex justify-between items-center shrink-0 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest hidden sm:block">Terminal Output</span>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsCanvasLocked(!isCanvasLocked)}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all ${
                      isCanvasLocked ? 'bg-fuchsia-900/30 border-fuchsia-500/50 text-fuchsia-400' : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-white'
                    }`}
                  >
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
            </Panel>

          </Group>
        </Panel>

      </Group>
    </div>
  );
}