import { Handle, Position } from "@xyflow/react";

const BranchLabelNode = ({ data }) => {
  return (
    <div className="bg-gray-200 px-4 py-1 rounded-full text-xs font-semibold text-center shadow">
      <div>{data.label}</div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default BranchLabelNode;
