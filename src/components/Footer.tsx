import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} Vandanam SmartTech Private Limited. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;