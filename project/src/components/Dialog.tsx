import React from 'react';

interface DialogueProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
}

const Dialogue: React.FC<DialogueProps> = ({ message, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-md shadow-md max-w-sm w-full">
        <p className="text-center text-gray-800 mb-4">{message}</p>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dialogue;
