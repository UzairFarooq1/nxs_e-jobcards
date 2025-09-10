// Debug script to test engineer creation
// This will help us understand what's happening

console.log("=== Engineer Creation Debug ===");

// Check environment variables
console.log("VITE_API_URL:", process.env.VITE_API_URL || "not set");
console.log(
  "VITE_ADMIN_API_KEY:",
  process.env.VITE_ADMIN_API_KEY ? "set" : "not set"
);

// Test the URL construction
const baseUrl = process.env.VITE_API_URL || "http://localhost:3001";
const apiUrl = baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
console.log("Constructed API URL:", apiUrl);
console.log("Full endpoint URL:", `${apiUrl}/admin/create-engineer`);

// Test fetch call
const testEngineer = {
  name: "Debug Test",
  email: "debug@test.com",
  engineerId: "ENG-DEBUG-001",
};

console.log("Test payload:", JSON.stringify(testEngineer, null, 2));

// Make the actual call
fetch(`${apiUrl}/admin/create-engineer`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-admin-api-key": process.env.VITE_ADMIN_API_KEY || "",
  },
  body: JSON.stringify(testEngineer),
})
  .then((response) => {
    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );
    return response.text();
  })
  .then((text) => {
    console.log("Response body:", text);
    try {
      const json = JSON.parse(text);
      console.log("Parsed JSON:", json);
    } catch (e) {
      console.log("Response is not JSON");
    }
  })
  .catch((error) => {
    console.error("Fetch error:", error);
  });
