import React from 'react';

// Define props interface for the DialogBox component
interface DialogBoxProps {
  message: string;
  onClose: () => void;
}

const DialogBox: React.FC<DialogBoxProps> = ({ message, onClose }) => {
  // Styles as objects
  const dialogBoxStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker overlay for better contrast
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    animation: 'fadeIn 0.3s ease-out', // Smooth fade-in effect
  };

  const dialogContentStyle = {
    backgroundColor: 'white',
    padding: '30px 40px', // More padding for a spacious feel
    borderRadius: '12px', // Rounded corners for a modern look
    textAlign: 'center',
    maxWidth: '400px', // Max width to avoid stretching on large screens
    width: '100%',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', // Soft shadow for depth
    animation: 'slideUp 0.3s ease-out', // Smooth slide-up effect
  };

  const buttonStyle = {
    padding: '12px 25px',
    backgroundColor: '#4CAF50', // Green for a positive action
    color: 'white',
    border: 'none',
    borderRadius: '8px', // Rounded button
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s', // Smooth color transition
  };

  const buttonHoverStyle = {
    backgroundColor: '#45a049', // Slightly darker green on hover
  };

  return (
    <div style={dialogBoxStyle}>
      <div style={dialogContentStyle}>
        <p style={{ fontSize: '18px', marginBottom: '20px', fontWeight: 'bold' }}>{message}</p>
        <button
          style={buttonStyle}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = buttonHoverStyle.backgroundColor}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor}
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default DialogBox;
