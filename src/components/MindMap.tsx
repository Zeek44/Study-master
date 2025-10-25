import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Save, Download, Zap } from 'lucide-react';

interface MindMapProps {
  onBack: () => void;
}

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  connections: string[];
}

const MindMap: React.FC<MindMapProps> = ({ onBack }) => {
  const [nodes, setNodes] = useState<MindMapNode[]>([
    {
      id: '1',
      text: 'Central Topic',
      x: 400,
      y: 300,
      color: 'bg-purple-500',
      connections: ['2', '3', '4']
    },
    {
      id: '2',
      text: 'Subtopic 1',
      x: 200,
      y: 200,
      color: 'bg-blue-500',
      connections: ['1']
    },
    {
      id: '3',
      text: 'Subtopic 2',
      x: 600,
      y: 200,
      color: 'bg-green-500',
      connections: ['1']
    },
    {
      id: '4',
      text: 'Subtopic 3',
      x: 400,
      y: 500,
      color: 'bg-orange-500',
      connections: ['1']
    }
  ]);

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);

  const addNode = () => {
    const newNode: MindMapNode = {
      id: Date.now().toString(),
      text: 'New Topic',
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      color: 'bg-indigo-500',
      connections: []
    };
    setNodes([...nodes, newNode]);
  };

  const updateNodeText = (nodeId: string, newText: string) => {
    setNodes(nodes.map(node =>
      node.id === nodeId ? { ...node, text: newText } : node
    ));
    setEditingNode(null);
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Notes</span>
        </button>
        
        <div className="flex space-x-3">
          <button
            onClick={addNode}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Node</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all">
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Mind Map Canvas */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 relative overflow-hidden">
        <div className="absolute top-4 left-4 z-10">
          <div className="flex items-center space-x-2 bg-black/30 rounded-lg px-3 py-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-white text-sm">Interactive Mind Map</span>
          </div>
        </div>

        <svg width="800" height="600" className="w-full h-96 lg:h-[600px]">
          {/* Connections */}
          {nodes.map(node =>
            node.connections.map(connectionId => {
              const connectedNode = nodes.find(n => n.id === connectionId);
              if (!connectedNode) return null;
              
              return (
                <motion.line
                  key={`${node.id}-${connectionId}`}
                  x1={node.x}
                  y1={node.y}
                  x2={connectedNode.x}
                  y2={connectedNode.y}
                  stroke="rgba(147, 51, 234, 0.5)"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8 }}
                />
              );
            })
          )}

          {/* Nodes */}
          {nodes.map((node, index) => (
            <motion.g
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.circle
                cx={node.x}
                cy={node.y}
                r="40"
                className={`${node.color} opacity-80`}
                whileHover={{ scale: 1.1 }}
                onClick={() => setSelectedNode(node.id)}
              />
              <foreignObject
                x={node.x - 35}
                y={node.y - 10}
                width="70"
                height="20"
              >
                {editingNode === node.id ? (
                  <input
                    type="text"
                    value={node.text}
                    onChange={(e) => updateNodeText(node.id, e.target.value)}
                    onBlur={() => setEditingNode(null)}
                    onKeyPress={(e) => e.key === 'Enter' && setEditingNode(null)}
                    className="w-full text-xs text-white bg-transparent text-center outline-none"
                    autoFocus
                  />
                ) : (
                  <div
                    className="text-xs text-white text-center font-medium cursor-pointer"
                    onDoubleClick={() => setEditingNode(node.id)}
                  >
                    {node.text}
                  </div>
                )}
              </foreignObject>
            </motion.g>
          ))}
        </svg>
      </div>

      {/* Instructions */}
      <div className="bg-white/5 rounded-lg p-4">
        <p className="text-gray-300 text-sm">
          <strong>Instructions:</strong> Click nodes to select them, double-click to edit text, 
          drag to reposition. Use the "Add Node\" button to create new topics.
        </p>
      </div>
    </motion.div>
  );
};

export default MindMap;