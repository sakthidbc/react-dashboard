import { AlertTriangle, CheckCircle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) => {
  if (!isOpen) return null;

  const bgColor = type === 'danger' ? 'bg-red-50 dark:bg-red-900/20' : type === 'success' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-blue-50 dark:bg-blue-900/20';
  const iconColor = type === 'danger' ? 'text-red-600 dark:text-red-400' : type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:bg-blue-400';
  const buttonColor = type === 'danger' ? 'bg-red-600 hover:bg-red-700' : type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full my-auto">
        <div className={`p-6 ${bgColor} rounded-t-xl`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${iconColor} bg-white dark:bg-gray-800`}>
              {type === 'success' ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`w-full sm:w-auto px-4 py-2 ${buttonColor} text-white rounded-lg transition-colors font-medium`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

