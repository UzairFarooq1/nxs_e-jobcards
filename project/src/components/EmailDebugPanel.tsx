"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { EmailDebugger } from "../utils/emailDebugger"
import { debugEngineerEmail } from "../utils/emailService"

export const EmailDebugPanel: React.FC = () => {
  const [engineerId, setEngineerId] = useState("")
  const [isDebugging, setIsDebugging] = useState(false)

  const handleRunDiagnostic = async () => {
    setIsDebugging(true)
    try {
      console.clear()
      console.log("🔧 EMAIL DEBUG PANEL - Starting diagnostic...")
      await EmailDebugger.runFullDiagnostic(engineerId || undefined)

      if (engineerId) {
        console.log("🔧 Testing email service function...")
        await debugEngineerEmail(engineerId)
      }

      console.log("✅ Diagnostic complete! Check the console for detailed results.")
    } catch (error) {
      console.error("❌ Diagnostic failed:", error)
    } finally {
      setIsDebugging(false)
    }
  }

  const handleTestDatabase = async () => {
    setIsDebugging(true)
    try {
      console.clear()
      console.log("🔧 Testing database connection...")
      await EmailDebugger.testDatabaseConnection()
      await EmailDebugger.listAllEngineers()
    } catch (error) {
      console.error("❌ Database test failed:", error)
    } finally {
      setIsDebugging(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Email Debug Panel</CardTitle>
        <CardDescription>Debug email sending issues and test engineer email lookup</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="engineerId" className="text-sm font-medium">
            Engineer ID (optional)
          </label>
          <Input
            id="engineerId"
            placeholder="Enter engineer ID to test specific lookup"
            value={engineerId}
            onChange={(e) => setEngineerId(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleRunDiagnostic} disabled={isDebugging} className="flex-1">
            {isDebugging ? "Running..." : "Run Full Diagnostic"}
          </Button>

          <Button
            onClick={handleTestDatabase}
            disabled={isDebugging}
            variant="outline"
            className="flex-1 bg-transparent"
          >
            {isDebugging ? "Testing..." : "Test Database Only"}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
          <p className="font-medium mb-2">This will test:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Database connection to Supabase</li>
            <li>Engineers table structure and data</li>
            <li>Engineer email lookup by ID</li>
            <li>Backend API connectivity</li>
            <li>Email service configuration</li>
          </ul>
          <p className="mt-2 text-xs">Check the browser console for detailed results.</p>
        </div>
      </CardContent>
    </Card>
  )
}
