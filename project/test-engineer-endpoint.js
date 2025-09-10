// Test script for the engineer creation endpoint
// Run with: node test-engineer-endpoint.js

const fetch = require("node-fetch");

const testCreateEngineer = async () => {
  const baseUrl = process.env.API_URL || "http://localhost:3001";
  const apiKey = process.env.ADMIN_API_KEY || "test-key";

  try {
    console.log("Testing engineer creation endpoint...");
    console.log("URL:", `${baseUrl}/api/admin/create-engineer`);

    const response = await fetch(`${baseUrl}/api/admin/create-engineer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-api-key": apiKey,
      },
      body: JSON.stringify({
        name: "Test Engineer",
        email: "test@example.com",
        engineerId: "ENG-TEST-001",
      }),
    });

    const result = await response.json();
    console.log("Response status:", response.status);
    console.log("Response body:", JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log("✅ Test passed! Engineer created successfully.");
      if (result.inviteLink) {
        console.log("📧 Invite link:", result.inviteLink);
      }
    } else {
      console.log("❌ Test failed:", result.error);
    }
  } catch (error) {
    console.error("❌ Test error:", error.message);
  }
};

testCreateEngineer();
