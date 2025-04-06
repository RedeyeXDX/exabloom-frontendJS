export function addIfElseStructure(
  source,
  target,
  modalData,
  setNodes,
  setEdges,
  setSelectorPosition,
  setEdgeToSplit,
  openEditModal
) {
  // ✅ Safer ID generator
  const generateId = () => Math.random().toString(36).substr(2, 9);
  const ifElseId = generateId();

  setNodes((prevNodes) => {
    const sourceNode = prevNodes.find((n) => n.id === source);
    const targetNode = prevNodes.find((n) => n.id === target);
    if (!sourceNode || !targetNode) return prevNodes;

    const midX = (sourceNode.position.x + targetNode.position.x) / 2;
    const midY = (sourceNode.position.y + targetNode.position.y) / 2;

    const ifElseNode = {
      id: ifElseId,
      type: "ifelse",
      position: { x: midX, y: midY },
      data: {
        label: modalData.name || "If/Else",
        onEdit: () => openEditModal(ifElseId),
      },
    };

    const branchNodes = (modalData.branches || []).map((branch, index) => ({
      id: branch.id || generateId(),
      type: "branchlabel",
      position: {
        x: midX - ((modalData.branches.length || 1) * 100) / 2 + index * 100,
        y: midY + 120,
      },
      data: { label: branch.label || "Branch" },
      draggable: true,
      selectable: true,
    }));

    // ✅ Keep previous nodes and append new ones
    return [...prevNodes, ifElseNode, ...branchNodes];
  });

  setEdges((prevEdges) => {
    const filtered = prevEdges.filter(
      (e) => !(e.source === source && e.target === target)
    );

    const newEdges = [
      {
        id: `e-${source}-${ifElseId}`,
        source,
        target: ifElseId,
        type: "add",
        animated: true,
        data: {
          onAdd: (e) => {
            const bounds = e.target.getBoundingClientRect();
            setSelectorPosition({ x: bounds.left, y: bounds.top });
            setEdgeToSplit({ source, target: ifElseId });
          },
        },
      },
      ...(modalData.branches || []).map((branch) => ({
        id: `e-${ifElseId}-${branch.id || generateId()}`,
        source: ifElseId,
        target: branch.id,
        type: "add",
        animated: true,
        data: {
          onAdd: (e) => {
            const bounds = e.target.getBoundingClientRect();
            setSelectorPosition({ x: bounds.left, y: bounds.top });
            setEdgeToSplit({ source: ifElseId, target: branch.id });
          },
        },
      })),
    ];

    return [...filtered, ...newEdges];
  });

  setSelectorPosition(null);
  setEdgeToSplit(null);
}
