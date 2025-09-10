import { useState } from "react";

interface LogoDisplayProps {
  className?: string;
  alt?: string;
}

export function LogoDisplay({
  className = "h-8",
  alt = "NXS Logo",
}: LogoDisplayProps) {
  const [logoError, setLogoError] = useState(false);
  const [currentPath, setCurrentPath] = useState(
    "https://drive.google.com/uc?export=view&id=17hPAwmzKS3LKBEn-Kzz-JBD-QM0vF_uq"
  );

  const logoPaths = [
    "https://drive.google.com/uc?export=view&id=17hPAwmzKS3LKBEn-Kzz-JBD-QM0vF_uq", // Google Drive logo
    "/static/images/logo.jpg", // Fallback to local logo
  ];

  const handleError = () => {
    console.error(`Logo failed to load: ${currentPath}`);

    // Try fallback logo if current one failed
    const currentIndex = logoPaths.indexOf(currentPath);
    if (currentIndex < logoPaths.length - 1) {
      const nextPath = logoPaths[currentIndex + 1];
      console.log(`Trying fallback logo: ${nextPath}`);
      setCurrentPath(nextPath);
    } else {
      setLogoError(true);
    }
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
