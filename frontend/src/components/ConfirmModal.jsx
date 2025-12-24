import React from 'react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirmar", // Texto por defecto
  confirmColor = "red"       // Color por defecto (red, green, blue, yellow)
}) => {
  if (!isOpen) return null;

  // Mapa de colores para los botones
  const colorStyles = {
    red: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    green: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
    blue: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    yellow: "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500 text-white", // Yellow suele necesitar ajuste de texto
  };

  const btnClass = colorStyles[confirmColor] || colorStyles.blue;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
        
        {/* Icono Dinámico según el color */}
        <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-6 bg-${confirmColor}-100`}>
          <svg className={`h-8 w-8 text-${confirmColor}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">{message}</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`w-full px-4 py-2.5 text-white font-bold rounded-xl shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${btnClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;