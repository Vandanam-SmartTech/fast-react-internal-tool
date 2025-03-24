import React from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

interface CustomDialogProps {
  open: boolean;
  message: string;
  title?: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  onConfirm?: () => void;
}

const CustomDialog: React.FC<CustomDialogProps> = ({ open, message, title = "Notification", type = "info", onClose, onConfirm }) => {
  const getColor = () => {
    switch (type) {
      case "success":
        return "green";
      case "error":
        return "red";
      default:
        return "blue";
    }
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <Dialog open={open} handler={onClose} className="w-full max-w-md bg-white shadow-lg rounded-lg">
            <DialogHeader className={`text-${getColor()}-500 font-semibold text-lg text-center`}>
              {title}
            </DialogHeader>
            <DialogBody className="text-gray-700 text-center">{message}</DialogBody>
            <DialogFooter className="flex justify-center gap-4">
              <Button variant="filled" color="green" onClick={onClose} className="px-4 py-2 border border-red-500 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600">
                Close
              </Button>
              {onConfirm && (
                <Button variant="filled" color="red" onClick={() => { onConfirm(); onClose(); }} className="px-4 py-2 border border-green-500 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600">
                  Confirm
                </Button>
              )}
            </DialogFooter>
          </Dialog>
        </div>
      )}
    </>
  );
};

export default CustomDialog;
