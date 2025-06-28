type CustomAlertProps = {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function CustomAlert({
  isOpen,
  title,
  message,
  onClose,
  onConfirm,
}: CustomAlertProps) {
  if (!isOpen) return null;

  // ---------------------------
  // Custom alert component
  // ---------------------------
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-blue-900/50">
      <div className="bg-blue-900 text-white rounded-lg p-6 max-w-sm w-full shadow-lg">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
