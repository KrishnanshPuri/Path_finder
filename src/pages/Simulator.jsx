import React, { useState, useEffect } from 'react';
import { Group, Panel, Separator } from "react-resizable-panels";

import { useGraphEngine } from '../hooks/useGraphEngine';
import { DEFAULT_GRAPH_INPUT } from '../constants';

import TopNav from '../components/TopNav';
import CodeEditor from '../components/CodeEditor';
import GraphCanvas from '../components/GraphCanvas';
import TerminalPanel from '../components/TerminalPannel'; 

export default function Simulator() {
  
  const [activeAlgo, setActiveAlgo] = useState('dijkstra');
  const [graphInput, setGraphInput] = useState(DEFAULT_GRAPH_INPUT);
  const [sourceNode, setSourceNode] = useState('1');
  const [destNode, setDestNode] = useState('10'); 
  const [compareA, setCompareA] = useState('dijkstra');
  const [compareB, setCompareB] = useState('bellman');
  const [isCanvasLocked, setIsCanvasLocked] = useState(false);
  const [rfInstance, setRfInstance] = useState(null);

 
  const { 
    nodes, edges, terminalOutput, setTerminalOutput,
    onNodesChange, onEdgesChange, onNodesDelete,
    buildGraph, executeEngine 
  } = useGraphEngine();

  
  useEffect(() => { buildGraph(graphInput, rfInstance); }, [rfInstance]);


  return (
    <div className="h-screen w-full flex flex-col bg-[#09090b] font-sans overflow-hidden text-slate-200">
      
      <TopNav activeAlgo={activeAlgo} setActiveAlgo={setActiveAlgo} />

      <Group orientation="horizontal" className="flex-1 overflow-hidden min-h-0">
        
        <Panel defaultSize={30} minSize={20} className="flex flex-col bg-[#0c0c0e] min-w-0">
          <CodeEditor 
            activeAlgo={activeAlgo} compareA={compareA} setCompareA={setCompareA} compareB={compareB} setCompareB={setCompareB}
            graphInput={graphInput} setGraphInput={setGraphInput} buildGraph={() => buildGraph(graphInput, rfInstance)} 
          />
        </Panel>

        <Separator className="w-1.5 bg-[#121214] hover:bg-violet-600/50 transition-colors cursor-col-resize flex flex-col justify-center items-center group shrink-0">
          <div className="h-8 w-0.5 bg-zinc-700 group-hover:bg-violet-400 rounded-full" />
        </Separator>

        <Panel defaultSize={70} minSize={40} className="flex flex-col min-w-0">
          <Group orientation="vertical">
            
            <Panel defaultSize={70} minSize={30} className="relative bg-[#050505] min-h-0">
              <GraphCanvas 
                nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodesDelete={onNodesDelete} 
                setRfInstance={setRfInstance} isCanvasLocked={isCanvasLocked} 
              />
            </Panel>

            <Separator className="h-1.5 bg-[#121214] hover:bg-fuchsia-600/50 transition-colors cursor-row-resize flex justify-center items-center group shrink-0">
              <div className="w-8 h-0.5 bg-zinc-700 group-hover:bg-fuchsia-400 rounded-full" />
            </Separator>

            <Panel defaultSize={30} minSize={15} className="flex flex-col min-h-0">
              <TerminalPanel 
                terminalOutput={terminalOutput} setTerminalOutput={setTerminalOutput} 
                isCanvasLocked={isCanvasLocked} setIsCanvasLocked={setIsCanvasLocked}
                sourceNode={sourceNode} setSourceNode={setSourceNode} destNode={destNode} setDestNode={setDestNode}
                executeEngine={() => executeEngine(activeAlgo, sourceNode, destNode, compareA, compareB)}
              />
            </Panel>

          </Group>
        </Panel>

      </Group>
    </div>
  );
}