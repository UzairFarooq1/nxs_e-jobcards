import React, { useState } from "react";

interface LogoDisplayProps {
  className?: string;
  alt?: string;
}

export function LogoDisplay({
  className = "h-8",
  alt = "NXS Logo",
}: LogoDisplayProps) {
  const [logoError, setLogoError] = useState(false);
  const [currentPath, setCurrentPath] = useState("/static/images/logomain.png");

  const logoPaths = [
    "/static/images/logomain.png", // Only path we need
  ];

  const handleError = () => {
    console.error(`Logo failed to load: ${currentPath}`);
    setLogoError(true);
  };

  const handleLoad = () => {
    console.log(`✅ Logo loaded successfully: ${currentPath}`);
    setLogoError(false);
  };

  if (logoError) {
    // Logo failed to load, show fallback
    return (
      <div
        className={`${className} bg-gray-200 rounded flex items-center justify-center`}
      >
        <span className="text-xs text-gray-500">NXS</span>
      </div>
    );
  }

  return (
    <img
      src={currentPath}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
}
