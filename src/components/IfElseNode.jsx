import { Handle, Position } from "@xyflow/react";

const IfElseNode = ({ data }) => {
  return (
    <div
      className="bg-yellow-100 border-2 border-yellow-400 px-4 py-2 rounded-lg text-sm font-medium shadow-md cursor-pointer"
      onClick={data?.onEdit}
    >
      <div className="text-yellow-800">{data.label}</div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default IfElseNode;
