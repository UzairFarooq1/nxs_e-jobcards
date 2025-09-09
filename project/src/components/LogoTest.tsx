import React from "react";

export function LogoTest() {
  const logoPaths = [
    "/logo_main.png",
    "./logo_main.png",
    "logo_main.png",
    "/public/logo_main.png",
  ];

  return (
    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
      <h3 className="text-lg font-semibold mb-4 text-green-800">
        Logo Display Test
      </h3>
      <p className="text-sm text-green-600 mb-4">
        Testing different logo paths to identify the correct one for Vercel
        deployment.
      </p>

      <div className="space-y-4">
        {logoPaths.map((path, index) => (
          <div
            key={index}
            className="flex items-center space-x-4 p-3 bg-white rounded border"
          >
            <div className="w-16 h-16 border border-gray-300 rounded flex items-center justify-center">
              <img
                src={path}
                alt={`Logo test ${index + 1}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  console.error(`Logo failed to load: ${path}`);
                  e.currentTarget.style.display = "none";
                }}
                onLoad={() => {
                  console.log(`✅ Logo loaded successfully: ${path}`);
                }}
              />
            </div>
            <div>
              <p className="text-sm font-medium">
                Path: <code>{path}</code>
              </p>
              <p className="text-xs text-gray-500">
                Check console for load status
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>Instructions:</strong>
          <br />
          1. Check which logo displays correctly
          <br />
          2. Check browser console for load/error messages
          <br />
          3. Use the working path in your components
        </p>
      </div>
    </div>
  );
}
