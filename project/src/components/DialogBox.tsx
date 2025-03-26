import { Dialog, DialogContent, DialogActions, Button, Typography, Box, Slide } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import { TransitionProps } from "@mui/material/transitions";
import { forwardRef } from "react";

// Slide-in transition effect
const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface DialogBoxProps {
  open: boolean;
  message: string;
  type?: "success" | "error" | "info"; // Default type is 'info'
  onClose: () => void;
  onConfirm?: () => void;
}

const DialogBox: React.FC<DialogBoxProps> = ({ open, message, type = "info", onClose, onConfirm }) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircleIcon sx={{ fontSize: 70, color: "#4caf50", mb: 2 }} />;
      case "error":
        return <ErrorIcon sx={{ fontSize: 70, color: "#f44336", mb: 2 }} />;
      default:
        return <InfoIcon sx={{ fontSize: 70, color: "#2196f3", mb: 2 }} />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case "success":
        return "Success!";
      case "error":
        return "Oops! Something went wrong";
      default:
        return "Notice";
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "rgba(76, 175, 80, 0.1)"; // Light green
      case "error":
        return "rgba(244, 67, 54, 0.1)"; // Light red
      default:
        return "rgba(33, 150, 243, 0.1)"; // Light blue
    }
  };

  return (
    <Dialog open={open} onClose={onClose} TransitionComponent={Transition} sx={{ "& .MuiDialog-paper": { borderRadius: 3, boxShadow: 5 } }}>
      <DialogContent sx={{ textAlign: "center", p: 4, backgroundColor: getBackgroundColor() }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          {getIcon()}
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1, color: "#333" }}>
            {getTitle()}
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ px: 2 }}>
            {message}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
        <Button
          onClick={() => {
            if (onConfirm) onConfirm();
            onClose();
          }}
          color="primary"
          variant="contained"
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 3,
            fontSize: "1rem",
            background: "#1976d2",
            "&:hover": { background: "#1565c0" },
          }}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogBox;
