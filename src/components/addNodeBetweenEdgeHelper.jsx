// This function inserts a new node (either "action" or "ifelse") between two connected nodes
export function addNodeBetweenEdgeHelper(
  source, // ID of the source node of the edge to split
  target, // ID of the target node of the edge to split
  nodes,
  setNodes,
  setEdges,
  nodeType,
  setSelectorPosition,
  setEdgeToSplit
) {
  const sourceNode = nodes.find((n) => n.id === source);
  const targetNode = nodes.find((n) => n.id === target);
  if (!sourceNode || !targetNode) return;

  // Calculate the midpoint between source and target to position the new node
  const midY =
    sourceNode.position.y + (targetNode.position.y - sourceNode.position.y) / 2;
  const avgX =
    sourceNode.position.x + (targetNode.position.x - sourceNode.position.x) / 2;

  const id = self.crypto.randomUUID();

  // Create the new node
  const newNode = {
    id,
    type: nodeType,
    position: { x: avgX, y: midY },
    data: {
      label: nodeType === "action" ? "Action" : "If/Else",
    },
  };

  // Move down all nodes that are below the new node to avoid overlap
  const updatedNodes = nodes.map((node) => {
    if (node.position.y > midY) {
      return {
        ...node,
        position: { ...node.position, y: node.position.y + 100 },
      };
    }
    return node;
  });
  // Add the new node to the node list
  setNodes([...updatedNodes, newNode]);

  // Reconnect edges: remove the original edge and replace with two new edges
  setEdges((prevEdges) => {
    // Remove the original edge between source and target
    const filteredEdges = prevEdges.filter(
      (e) => !(e.source === source && e.target === target)
    );
    // Define two new edges: source -> newNode, and newNode -> target
    const newEdges = [
      {
        id: `e-${source}-${id}`,
        source,
        target: id,
        type: "add",
        animated: true,
        data: {
          onAdd: (e) => {
            const bounds = e.target.getBoundingClientRect();
            setSelectorPosition({ x: bounds.left, y: bounds.top });
            setEdgeToSplit({ source, target: id });
          },
        },
      },
      {
        id: `e-${id}-${target}`,
        source: id,
        target,
        type: "add",
        animated: true,
        data: {
          onAdd: (e) => {
            const bounds = e.target.getBoundingClientRect();
            setSelectorPosition({ x: bounds.left, y: bounds.top });
            setEdgeToSplit({ source: id, target });
          },
        },
      },
    ];

    // Return the new set of edges
    return [...filteredEdges, ...newEdges];
  });
}
