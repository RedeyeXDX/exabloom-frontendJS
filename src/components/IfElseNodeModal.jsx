import React, { useState } from "react";

const IfElseNodeModal = ({ onSave, onClose, onDelete }) => {
  const [name, setName] = useState("If / Else");

  const generateId = () => Math.random().toString(36).substr(2, 9);
  const [branches, setBranches] = useState([
    { id: generateId(), label: "Branch #1" },
    { id: generateId(), label: "Branch #2" },
  ]);
  const [elseLabel, setElseLabel] = useState("Else");

  const handleAddBranch = () => {
    const newId = generateId();
    setBranches([
      ...branches,
      { id: newId, label: `Branch #${branches.length + 1}` },
    ]);
  };

  const handleUpdateBranch = (id, label) => {
    setBranches((prev) => prev.map((b) => (b.id === id ? { ...b, label } : b)));
  };

  const handleRemoveBranch = (id) => {
    setBranches((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md w-[400px] shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Configure If / Else Node</h2>

        <label className="text-sm font-medium">If/Else Name</label>
        <input
          className="w-full p-2 mb-4 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Branches</p>
          {branches.map((branch) => (
            <div key={branch.id} className="flex items-center gap-2 mb-2">
              <input
                className="flex-1 p-2 border rounded"
                value={branch.label}
                onChange={(e) => handleUpdateBranch(branch.id, e.target.value)}
              />
              <button
                onClick={() => handleRemoveBranch(branch.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={handleAddBranch}
            className="text-blue-600 text-sm mt-2 hover:underline"
          >
            + Add Branch
          </button>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onDelete?.()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSave({ name, branches, elseLabel });
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default IfElseNodeModal;
