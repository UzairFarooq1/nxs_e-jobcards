// Test the engineer endpoint locally
import fetch from "node-fetch";

const testEndpoint = async () => {
  try {
    console.log("🧪 Testing engineer endpoint...");

    const response = await fetch(
      "http://localhost:3001/api/admin/create-engineer",
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

    const result = await response.text();
    console.log("Status:", response.status);
    console.log("Response:", result);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

testEndpoint();
