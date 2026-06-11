import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

export default function GraphCanvas({ nodes, edges, onNodesChange, onEdgesChange, onNodesDelete, setRfInstance, isCanvasLocked }) {
  return (
    <ReactFlow 
      nodes={nodes} edges={edges} 
      onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodesDelete={onNodesDelete} 
      onInit={setRfInstance} fitView fitViewOptions={{ padding: 0.2 }} proOptions={{ hideAttribution: true }}
      nodesDraggable={!isCanvasLocked} panOnDrag={!isCanvasLocked} zoomOnScroll={!isCanvasLocked} zoomOnPinch={!isCanvasLocked} zoomOnDoubleClick={!isCanvasLocked} elementsSelectable={!isCanvasLocked}
    >
      <Background color="#27272a" gap={24} size={1} />
      <Controls showInteractive={false} className="bg-zinc-900 fill-zinc-400 border-zinc-800 shadow-xl rounded-lg overflow-hidden" /> 
    </ReactFlow>
  );
}