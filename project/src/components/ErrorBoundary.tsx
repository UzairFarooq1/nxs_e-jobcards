import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("🚨 ErrorBoundary caught an error:", error);
    console.error("Error info:", errorInfo);

    // Check if it's a URL error
    if (
      error.message.includes("Invalid URL") ||
      error.message.includes("URL")
    ) {
      console.error("🔗 This appears to be a URL-related error");
      console.error("Current location:", window.location);
      console.error("Current pathname:", window.location.pathname);
      console.error("Current search:", window.location.search);
      console.error("Current href:", window.location.href);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="flex flex-col items-center">
                <svg
                  className="h-12 w-12 text-red-600 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Application Error
                </h2>

                <div className="text-center mb-6">
                  <p className="text-gray-600 mb-2">
                    Something went wrong. Please try refreshing the page.
                  </p>

                  {this.state.error?.message.includes("Invalid URL") && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                      <p className="text-yellow-800 text-sm">
                        <strong>URL Error Detected:</strong> This appears to be
                        a URL parsing issue. Try clearing your browser cache or
                        using a fresh browser tab.
                      </p>
                    </div>
                  )}

                  <details className="mt-4 text-left">
                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                      Show Error Details
                    </summary>
                    <div className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-700 font-mono">
                      <p>
                        <strong>Error:</strong> {this.state.error?.message}
                      </p>
                      <p>
                        <strong>Stack:</strong>
                      </p>
                      <pre className="whitespace-pre-wrap">
                        {this.state.error?.stack}
                      </pre>
                    </div>
                  </details>
                </div>

                <div className="space-y-3 w-full">
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Refresh Page
                  </button>

                  <button
                    onClick={() => (window.location.href = "/")}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Go to Home
                  </button>

                  <button
                    onClick={() => {
                      localStorage.clear();
                      sessionStorage.clear();
                      window.location.reload();
                    }}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Clear Cache & Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
