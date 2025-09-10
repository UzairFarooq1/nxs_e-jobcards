// Test the backend locally before deployment
// Run with: node test-backend-local.js

const fetch = require("node-fetch");

const testBackend = async () => {
  const baseUrl = "http://localhost:3001";

  try {
    console.log("🧪 Testing backend locally...");

    // Test 1: Health check
    console.log("\n1. Testing health endpoint...");
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthResponse.json();
    console.log("Health check:", healthData);

    // Test 2: Engineer creation endpoint (should fail without API key)
    console.log("\n2. Testing engineer endpoint without API key...");
    const engineerResponse = await fetch(
      `${baseUrl}/api/admin/create-engineer`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Engineer",
          email: "test@example.com",
          engineerId: "ENG-TEST-001",
        }),
      }
    );
    const engineerData = await engineerResponse.text();
    console.log(
      "Engineer endpoint (no API key):",
      engineerResponse.status,
      engineerData
    );

    // Test 3: Engineer creation with API key
    console.log("\n3. Testing engineer endpoint with API key...");
    const engineerWithKeyResponse = await fetch(
      `${baseUrl}/api/admin/create-engineer`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-api-key": "test-key-123",
        },
        body: JSON.stringify({
          name: "Test Engineer",
          email: "test@example.com",
          engineerId: "ENG-TEST-001",
        }),
      }
    );
    const engineerWithKeyData = await engineerWithKeyResponse.text();
    console.log(
      "Engineer endpoint (with API key):",
      engineerWithKeyResponse.status,
      engineerWithKeyData
    );
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("\n💡 Make sure the backend is running locally:");
    console.log("   cd backend && npm start");
  }
};

testBackend();
