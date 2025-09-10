import React from "react";

export function SimpleLogoTest() {
  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="text-lg font-semibold mb-4 text-blue-800">
        Simple Logo Test
      </h3>
      <p className="text-sm text-blue-600 mb-4">
        Testing the logo with the correct filename: logo.jpg
      </p>

      <div className="space-y-4">
        {/* Test 1: Root path */}
        <div className="flex items-center space-x-4 p-3 bg-white rounded border">
          <div className="w-16 h-16 border border-gray-300 rounded flex items-center justify-center">
            <img
              src="/static/images/logo.jpg"
              alt="Logo test 1"
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                console.error(
                  "❌ Logo failed to load: /static/images/logo.jpg"
                );
                e.currentTarget.style.display = "none";
              }}
              onLoad={() => {
                console.log(
                  "✅ Logo loaded successfully: /static/images/logo.jpg"
                );
              }}
            />
          </div>
          <div>
            <p className="text-sm font-medium">
              Path: <code>/static/images/logo.jpg</code>
            </p>
            <p className="text-xs text-gray-500">
              New location (public/static/images/)
            </p>
          </div>
        </div>

        {/* Test 2: Direct access test */}
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Direct URL Test:</strong> Try accessing{" "}
            <a
              href="/static/images/logo.jpg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              /static/images/logo.jpg
            </a>{" "}
            directly in your browser
          </p>
        </div>

        {/* Test 3: Single path confirmation */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded">
          <p className="text-sm text-gray-800">
            <strong>Using only:</strong> <code>/static/images/logo.jpg</code>
            <br />
            <strong>Location:</strong>{" "}
            <code>public/static/images/logo.jpg</code>
          </p>
        </div>
      </div>
    </div>
  );
}
