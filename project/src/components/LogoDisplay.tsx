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
  const [currentPath, setCurrentPath] = useState("/logomain.png");

  const logoPaths = [
    "/logomain.png", // Root directory (your copy command)
    "./logomain.png", // Relative path
    "logomain.png", // Direct filename
    "/public/logomain.png", // Public folder (original)
    "/assets/logomain.png", // Vercel assets folder
    "/static/logomain.png", // Static folder
  ];

  const handleError = () => {
    console.error(`Logo failed to load: ${currentPath}`);
    setLogoError(true);

    // Try next path
    const currentIndex = logoPaths.indexOf(currentPath);
    if (currentIndex < logoPaths.length - 1) {
      const nextPath = logoPaths[currentIndex + 1];
      console.log(`Trying next path: ${nextPath}`);
      setCurrentPath(nextPath);
      setLogoError(false);
    } else {
      console.error("All logo paths failed");
    }
  };

  const handleLoad = () => {
    console.log(`✅ Logo loaded successfully: ${currentPath}`);
    setLogoError(false);
  };

  if (logoError && logoPaths.indexOf(currentPath) === logoPaths.length - 1) {
    // All paths failed, show fallback
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
