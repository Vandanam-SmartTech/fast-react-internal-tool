import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

type EnvBannerProps = {
  envLabel: string;
};

const EnvBanner: React.FC<EnvBannerProps> = ({ envLabel }) => {
  if (envLabel === "Production") return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-yellow-400 text-red-900 px-4 py-2 rounded-xl shadow-xl border-2 border-yellow-600 flex items-center space-x-3 animate-pulse">
    <FaExclamationTriangle className="text-red-700 text-2xl" />
    <div className="text-center">
      <div className="text-base font-semibold leading-tight mr-4">You are in</div>
      <div className="text-lg font-bold uppercase tracking-wide underline">{envLabel} Mode</div>
    </div>
  </div>
  );
};

export default EnvBanner;
