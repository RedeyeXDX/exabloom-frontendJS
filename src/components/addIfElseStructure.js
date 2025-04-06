// This function inserts an If/Else node between two connected nodes,
// and adds a branch label node for each defined branch
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
  const generateId = () => Math.random().toString(36).substr(2, 9);
  const ifElseId = generateId();

  // Add the IfElse node and its branch nodes to the node list
  setNodes((prevNodes) => {
    // Get source and target node positions to place the IfElse node in between
    const sourceNode = prevNodes.find((n) => n.id === source);
    const targetNode = prevNodes.find((n) => n.id === target);
    if (!sourceNode || !targetNode) return prevNodes;

    // Calculate midpoint between source and target
    const midX = (sourceNode.position.x + targetNode.position.x) / 2;
    const midY = (sourceNode.position.y + targetNode.position.y) / 2;

    // Create the main If/Else node
    const ifElseNode = {
      id: ifElseId,
      type: "ifelse",
      position: { x: midX, y: midY },
      data: {
        label: modalData.name || "If/Else",
        onEdit: () => openEditModal(ifElseId),
      },
    };

    // Create branch label nodes for each branch
    const branchNodes = (modalData.branches || []).map((branch, index) => ({
      id: branch.id || generateId(),
      type: "branchlabel",
      position: {
        // Evenly spread branches horizontally below the IfElse node
        x: midX - ((modalData.branches.length || 1) * 100) / 2 + index * 100,
        y: midY + 120,
      },
      data: { label: branch.label || "Branch" },
      draggable: true,
      selectable: true,
    }));

    // Add the IfElse node and its branches to the existing node list
    return [...prevNodes, ifElseNode, ...branchNodes];
  });

  // Rewire the edges: remove old connection, and create new ones
  setEdges((prevEdges) => {
    // Remove the original edge from source -> target
    const filtered = prevEdges.filter(
      (e) => !(e.source === source && e.target === target)
    );

    const newEdges = [
      {
        // Edge from source -> IfElse node
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
      // Edges from IfElse -> each branch node
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

  // Clear temporary UI states after insertion
  setSelectorPosition(null);
  setEdgeToSplit(null);
}
