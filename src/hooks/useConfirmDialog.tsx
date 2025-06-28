import CustomAlert from "@/app/components/modals/CustomAlert";
import { useState, useCallback } from "react";

type ConfirmDialogOptions = {
  title: string;
  message: string;
};
// ---------------------------
// Custom hook to show a confirmation dialog
// ---------------------------
export function useConfirmDialog() {
  // ---------------------------
  // State variables
  // ---------------------------
  const [isOpen, setIsOpen] = useState(false);
  const [resolvePromise, setResolvePromise] = useState<
    null | ((value: boolean) => void)
  >(null);
  const [dialogOptions, setDialogOptions] = useState<ConfirmDialogOptions>({
    title: "",
    message: "",
  });

  // ---------------------------
  // Function to trigger confirm dialog
  // ---------------------------
  const confirm = useCallback((options: ConfirmDialogOptions) => {
    setDialogOptions(options);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve);
    });
  }, []);
  // ---------------------------
  // Confirm and close dialog handler
  // ---------------------------
  const handleClose = () => {
    setIsOpen(false);
    if (resolvePromise) resolvePromise(false);
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolvePromise) resolvePromise(true);
  };

  const ConfirmDialog = (
    <CustomAlert
      isOpen={isOpen}
      title={dialogOptions.title}
      message={dialogOptions.message}
      onClose={handleClose}
      onConfirm={handleConfirm}
    />
  );

  return { confirm, ConfirmDialog };
}
