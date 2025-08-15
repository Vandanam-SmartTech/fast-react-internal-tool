import React, { useEffect, useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { loadConfig, getConfig } from "../config";

const EnvBanner: React.FC = () => {
  const [envLabel, setEnvLabel] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnvLabel = async () => {
      try {
        await loadConfig(); // load the config.json
        const config = getConfig(); // get the loaded config
        setEnvLabel(config.VITE_ENV_LABEL || "Development");
      } catch (error) {
        console.error("Failed to load config:", error);
      }
    };

    fetchEnvLabel();
  }, []);

  if (!envLabel || envLabel.toLowerCase() === "production") return null;

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
