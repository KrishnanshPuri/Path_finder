import { useState, useEffect, useCallback } from 'react';
import { applyNodeChanges, applyEdgeChanges, MarkerType } from 'reactflow';
import createModule from '../graph_wasm.js';
import { nodeStyle } from '../constants.js'; 

export function useGraphEngine() {
  const [wasmModule, setWasmModule] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [terminalOutput, setTerminalOutput] = useState("System Initialization Complete. Engine Ready.\n");


  useEffect(() => {
    createModule().then(Module => setWasmModule(Module));
  }, []);


  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onNodesDelete = useCallback((deleted) => {
    setTerminalOutput(prev => prev + `> Vertex ${deleted[0].id} removed. Graph state altered.\n`);
  }, []);


  const buildGraph = (graphInput, rfInstance) => {
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
    
    const newNodes = nodesArray.map((nodeId, i) => {
      const angle = (i / nodesArray.length) * 2 * Math.PI;
      return { 
        id: nodeId, 
        position: { x: 350 + radius * Math.cos(angle), y: 250 + radius * Math.sin(angle) }, 
        data: { label: nodeId }, 
        style: nodeStyle 
      };
    });

    setNodes(newNodes); 
    setEdges(newEdges);
    setTerminalOutput(prev => prev + `> Geometry Compiled: ${nodesArray.length} Vertices, ${newEdges.length} Edges\n`);

    if (rfInstance) {
      setTimeout(() => window.requestAnimationFrame(() => rfInstance.fitView({ padding: 0.2, duration: 800 })), 50);
    }
  };


  const animatePath = (pathNodes) => {
    setEdges(eds => eds.map(e => ({ ...e, style: { stroke: '#52525b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#52525b', width: 14, height: 14 }, animated: false })));
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep >= pathNodes.length - 1) { clearInterval(interval); return; }
      const u = pathNodes[currentStep]; const v = pathNodes[currentStep + 1];
      setEdges(eds => eds.map(edge => {
        if (edge.source === u && edge.target === v) {
          return { ...edge, style: { stroke: '#f59e0b', strokeWidth: 4, filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b', width: 16, height: 16 }, animated: true };
        }
        return edge;
      }));
      currentStep++;
    }, 600);
  };


  const executeEngine = (activeAlgo, sourceNode, destNode, compareA, compareB) => {
    if (!wasmModule) return;
    const start = parseInt(sourceNode); 
    const end = parseInt(destNode);
    let hasNegativeEdge = edges.some(e => parseInt(e.label) < 0);
    let isRunningDijkstra = activeAlgo === 'dijkstra' || (activeAlgo === 'compare' && (compareA === 'dijkstra' || compareB === 'dijkstra'));

    if (isRunningDijkstra && hasNegativeEdge) {
      setTerminalOutput(prev => prev + `\n[ERR] Dijkstra exception: Graph contains negative weights.\n`);
      return;
    }

    const cppGraph = new wasmModule.Graph();
    edges.forEach(e => cppGraph.addEdge(parseInt(e.source), parseInt(e.target), parseInt(e.label)));

    const runAlgorithm = (algoName) => {
      const t0 = performance.now();
      let result = cppGraph[algoName === 'bellman' ? 'bellmanFord' : algoName === 'floyd' ? 'floydWarshall' : 'dijkstra'](start, end);
      const t1 = performance.now();
      const jsPath = [];
      for (let i = 0; i < result.path.size(); i++) jsPath.push(result.path.get(i).toString());
      return { path: jsPath, cost: result.cost, message: result.message, matrix: result.matrix, time: (t1 - t0).toFixed(4) };
    };

    if (activeAlgo === 'compare') {
      const resA = runAlgorithm(compareA);
      const resB = runAlgorithm(compareB);
      setTerminalOutput(prev => prev + `\n--- BENCHMARK: ${compareA.toUpperCase()} vs ${compareB.toUpperCase()} ---\n[${compareA.toUpperCase()}] Cost: ${resA.cost === -1 ? 'N/A' : resA.cost} | Time: ${resA.time} ms\n[${compareB.toUpperCase()}] Cost: ${resB.cost === -1 ? 'N/A' : resB.cost} | Time: ${resB.time} ms\n-------------------------------------------------\n`);
      if(resA.path.length > 0) animatePath(resA.path);
    } else {
      const res = runAlgorithm(activeAlgo);
      let out = `\n> Executing ${activeAlgo.toUpperCase()} (${start} → ${end})\n`;
      if (res.message.includes("ERROR")) out += `[ERR] ${res.message}\n`;
      else {
        out += `Distance: ${res.cost === -1 ? '∞' : res.cost}\n`;
        if (res.path.length > 0) out += `Path: [ ${res.path.join(" → ")} ]\nTime: ${res.time} ms\n`;
        if (activeAlgo === 'floyd') out += `\n--- DISTANCE MATRIX ---\n${res.matrix}\n`;
      }
      setTerminalOutput(prev => prev + out);
      if (res.path.length > 0) animatePath(res.path);
    }
    cppGraph.delete();
  };


  return {
    nodes, edges, terminalOutput, setTerminalOutput,
    onNodesChange, onEdgesChange, onNodesDelete,
    buildGraph, executeEngine
  };
}