'use client';
import { X } from 'phosphor-react';

export default function Popup({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info'
}) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-50 border-red-100';
      case 'warning':
        return 'bg-yellow-50 border-yellow-100';
      default:
        return 'bg-blue-50 border-blue-100';
    }
  };

  const getButtonStyles = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 active:bg-red-800';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800';
      default:
        return 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div 
        className={`w-full max-w-sm rounded-2xl border ${getTypeStyles()} p-4 sm:p-6 mx-auto transform transition-all`}
        style={{
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 pr-4">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg hover:bg-gray-100 active:bg-gray-200"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <p className="text-gray-600 mb-6 text-sm sm:text-base">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 text-sm sm:text-base font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2.5 text-white rounded-lg text-sm sm:text-base font-medium ${getButtonStyles()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
