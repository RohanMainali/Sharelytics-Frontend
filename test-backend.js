// Test script to verify backend endpoints
const BACKEND_URL = "https://sharelytics-backend.onrender.com";

async function testBackend() {
  console.log("Testing backend endpoints...");
  
  // Test signup
  try {
    const signupResponse = await fetch(`${BACKEND_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        password: "password123"
      })
    });
    const signupData = await signupResponse.json();
    console.log("Signup test:", signupResponse.status, signupData);
  } catch (error) {
    console.error("Signup test failed:", error);
  }

  // Test login
  try {
    const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123"
      })
    });
    const loginData = await loginResponse.json();
    console.log("Login test:", loginResponse.status, loginData);
    
    if (loginData.token) {
      // Test profile endpoint
      const profileResponse = await fetch(`${BACKEND_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${loginData.token}` }
      });
      const profileData = await profileResponse.json();
      console.log("Profile test:", profileResponse.status, profileData);
    }
  } catch (error) {
    console.error("Login test failed:", error);
  }
}

if (typeof window !== "undefined") {
  // Browser environment
  testBackend();
} else {
  // Node environment
  const fetch = require("node-fetch");
  global.fetch = fetch;
  testBackend();
}
