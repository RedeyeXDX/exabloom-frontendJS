import { useCallback, useState } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import AddEdge from "./AddEdge";
import StartNode from "./Startnode";
import EndNode from "./Endnode";
import ActionNode from "./ActionNode";
import EditNodeModal from "./EditNodeModal";
import { addNodeBetweenEdgeHelper } from "./addNodeBetweenEdgeHelper";
import NodeTypeSelectorModal from "./NodeTypeSelectorModal";
import IfElseNode from "./IfElseNode";
import BranchLabelNode from "./BranchLabelNode";
import IfElseNodeModal from "./IfElseNodeModal";
import { addIfElseStructure } from "./addIfElseStructure";

const edgeTypes = {
  add: AddEdge,
};

const nodeTypes = {
  start: StartNode,
  end: EndNode,
  action: ActionNode,
  ifelse: IfElseNode,
  branchlabel: BranchLabelNode,
};

const initialNodes = [
  {
    id: "1",
    type: "start",
    position: { x: 200, y: 200 },
    data: { label: "Start" },
  },
  {
    id: "2",
    type: "end",
    position: { x: 500, y: 500 },
    data: { label: "End" },
  },
];

export default function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([
    {
      id: "e-1-2",
      source: "1",
      target: "2",
      type: "add",
      animated: true,
      data: {
        onAdd: (e) => {
          const bounds = e.target.getBoundingClientRect();
          setSelectorPosition({ x: bounds.left, y: bounds.top });
          setEdgeToSplit({ source: "1", target: "2" });
        },
      },
    },
  ]);

  const [edgeToSplit, setEdgeToSplit] = useState(null);
  const [selectorPosition, setSelectorPosition] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showIfElseModal, setShowIfElseModal] = useState(false);
  const [stagedEdge, setStagedEdge] = useState(null);

  const onConnect = useCallback(
    (params) => {
      const id = `e-${params.source}-${params.target}`;
      setEdges((eds) => [
        ...eds,
        {
          id,
          ...params,
          type: "add",
          animated: true,
          data: {
            onAdd: (e) => {
              const bounds = e.target.getBoundingClientRect();
              setSelectorPosition({ x: bounds.left, y: bounds.top });
              setEdgeToSplit({ source: params.source, target: params.target });
            },
          },
        },
      ]);
    },
    [setEdges, setSelectorPosition, setEdgeToSplit]
  );

  const openIfElseEditModal = (nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) setSelectedNode(node);
  };

  const handleNodeTypeSelection = (type) => {
    if (!edgeToSplit) return;

    if (type === "action") {
      addNodeBetweenEdgeHelper(
        edgeToSplit.source,
        edgeToSplit.target,
        nodes,
        setNodes,
        setEdges,
        type,
        setSelectorPosition,
        setEdgeToSplit
      );
      setEdgeToSplit(null);
      setSelectorPosition(null);
    } else if (type === "ifelse") {
      setShowIfElseModal(true);
      setStagedEdge(edgeToSplit);
      setSelectorPosition(null);
    }
  };

  return (
    <>
      <div style={{ width: "100vw", height: "100vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          edgeTypes={edgeTypes}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => {
            if (node.type === "action" || node.type === "ifelse") {
              setSelectedNode(node);
            }
          }}
        >
          <Controls className="text-black" />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>

        {selectedNode && (
          <EditNodeModal
            node={selectedNode}
            onSave={(updatedNode) => {
              setNodes((nodes) =>
                nodes.map((n) => (n.id === updatedNode.id ? updatedNode : n))
              );
            }}
            onDelete={(nodeId) => {
              setNodes((nodes) => nodes.filter((n) => n.id !== nodeId));
              setEdges((edges) =>
                edges.filter((e) => e.source !== nodeId && e.target !== nodeId)
              );
            }}
            onClose={() => setSelectedNode(null)}
          />
        )}

        {selectorPosition && (
          <NodeTypeSelectorModal
            position={selectorPosition}
            onSelect={handleNodeTypeSelection}
            onClose={() => setSelectorPosition(null)}
          />
        )}

        {(showIfElseModal && stagedEdge) || selectedNode?.type === "ifelse" ? (
          <IfElseNodeModal
            node={selectedNode}
            onSave={(modalData) => {
              if (showIfElseModal) {
                addIfElseStructure(
                  stagedEdge.source,
                  stagedEdge.target,
                  modalData,
                  setNodes,
                  setEdges,
                  setSelectorPosition,
                  setEdgeToSplit,
                  () => setSelectedNode({ id: "temp", ...modalData }) // fake edit handler
                );
                setShowIfElseModal(false);
                setStagedEdge(null);
              } else {
                setNodes((nodes) =>
                  nodes.map((n) =>
                    n.id === selectedNode.id
                      ? { ...n, data: { ...n.data, label: modalData.name } }
                      : n
                  )
                );
                setSelectedNode(null);
              }
            }}
            onDelete={() => {
              const nodeId = selectedNode?.id;
              if (!nodeId) return;

              // Find all branch nodes connected to this if/else node
              const branchIds = nodes
                .filter((n) => n.type === "branchlabel")
                .filter((n) =>
                  edges.some((e) => e.source === nodeId && e.target === n.id)
                )
                .map((n) => n.id);

              setNodes((nodes) =>
                nodes.filter(
                  (n) => n.id !== nodeId && !branchIds.includes(n.id)
                )
              );

              setEdges((edges) =>
                edges.filter(
                  (e) =>
                    e.source !== nodeId &&
                    e.target !== nodeId &&
                    !branchIds.includes(e.source) &&
                    !branchIds.includes(e.target)
                )
              );

              setShowIfElseModal(false);
              setStagedEdge(null);
              setSelectedNode(null);
            }}
            onClose={() => {
              setShowIfElseModal(false);
              setStagedEdge(null);
              setSelectedNode(null);
            }}
          />
        ) : null}
      </div>
    </>
  );
}
