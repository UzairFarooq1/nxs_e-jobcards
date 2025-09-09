import React, { useState } from "react";
import { supabase } from "../config/supabase";

export function DatabaseTest() {
  const [testResult, setTestResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult("Testing database connection...");

    try {
      // Test 1: Check if we can connect to Supabase
      const { data, error } = await supabase
        .from("engineers")
        .select("count")
        .limit(1);

      if (error) {
        setTestResult(`❌ Database Error: ${error.message}`);
        return;
      }

      setTestResult("✅ Database connection successful!");
    } catch (error) {
      setTestResult(`❌ Connection Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testJobCardInsert = async () => {
    setIsLoading(true);
    setTestResult("Testing job card insert...");

    try {
      const testJobCard = {
        id: `TEST-${Date.now()}`,
        hospital_name: "Test Hospital",
        facility_signature: "",
        machine_type: "Test Machine",
        machine_model: "Test Model",
        serial_number: "TEST123",
        problem_reported: "Test problem",
        service_performed: "Test service",
        engineer_name: "Test Engineer",
        engineer_id: "TEST-ENG",
        date_time: new Date().toISOString(),
        status: "completed",
        before_service_images: [],
        after_service_images: [],
        facility_stamp_image: "",
      };

      const { data, error } = await supabase
        .from("job_cards")
        .insert([testJobCard])
        .select()
        .single();

      if (error) {
        setTestResult(`❌ Insert Error: ${error.message}`);
        return;
      }

      setTestResult("✅ Job card insert successful!");
    } catch (error) {
      setTestResult(`❌ Insert Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkUsers = async () => {
    setIsLoading(true);
    setTestResult("Checking users in database...");

    try {
      const { data: engineers, error } = await supabase
        .from("engineers")
        .select("id, name, email, engineer_id");

      if (error) {
        setTestResult(`❌ Users Error: ${error.message}`);
        return;
      }

      if (engineers && engineers.length > 0) {
        const userList = engineers
          .map((e) => `${e.name} (${e.email})`)
          .join("\n");
        setTestResult(`✅ Found ${engineers.length} users:\n${userList}`);
      } else {
        setTestResult("⚠️ No users found in engineers table");
      }
    } catch (error) {
      setTestResult(`❌ Users Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Database Test</h3>
      <div className="space-x-2 mb-4">
        <button
          onClick={testConnection}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test Connection
        </button>
        <button
          onClick={checkUsers}
          disabled={isLoading}
          className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Check Users
        </button>
        <button
          onClick={testJobCardInsert}
          disabled={isLoading}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test Insert
        </button>
      </div>
      <div className="text-sm">
        {testResult && <p>{testResult}</p>}
        {isLoading && <p>Loading...</p>}
      </div>
    </div>
  );
}
