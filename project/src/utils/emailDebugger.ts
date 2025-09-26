import { supabase } from "../config/supabase"

/**
 * Comprehensive email debugging utility
 */
export class EmailDebugger {
  /**
   * Test database connection and engineer data
   */
  static async testDatabaseConnection(): Promise<void> {
    console.log("🔧 Testing database connection...")

    try {
      const { data, error } = await supabase.from("engineers").select("count").limit(1)

      if (error) {
        console.error("❌ Database connection failed:", error)
        console.error("❌ Check your Supabase configuration:")
        console.error("  - SUPABASE_URL environment variable")
        console.error("  - SUPABASE_ANON_KEY environment variable")
        return
      }

      console.log("✅ Database connection successful")
    } catch (error) {
      console.error("❌ Database connection exception:", error)
    }
  }

  /**
   * List all engineers in the database
   */
  static async listAllEngineers(): Promise<void> {
    console.log("📊 Fetching all engineers from database...")

    try {
      const { data: engineers, error } = await supabase
        .from("engineers")
        .select("engineer_id, email, name")
        .order("engineer_id")

      if (error) {
        console.error("❌ Failed to fetch engineers:", error)
        return
      }

      if (!engineers || engineers.length === 0) {
        console.warn("⚠️ No engineers found in database!")
        console.warn("⚠️ Make sure the 'engineers' table exists and has data")
        return
      }

      console.log("📊 Engineers in database:")
      engineers.forEach((engineer, index) => {
        console.log(
          `  ${index + 1}. ID: ${engineer.engineer_id} | Email: ${engineer.email || "NO EMAIL"} | Name: ${engineer.name || "NO NAME"}`,
        )
      })

      // Check for missing emails
      const engineersWithoutEmail = engineers.filter((e) => !e.email)
      if (engineersWithoutEmail.length > 0) {
        console.warn("⚠️ Engineers without email addresses:")
        engineersWithoutEmail.forEach((engineer) => {
          console.warn(`  - ${engineer.engineer_id}: ${engineer.name || "NO NAME"}`)
        })
      }
    } catch (error) {
      console.error("❌ Exception while fetching engineers:", error)
    }
  }

  /**
   * Test engineer lookup by ID
   */
  static async testEngineerLookup(engineerId: string): Promise<void> {
    console.log(`🔍 Testing engineer lookup for ID: ${engineerId}`)

    try {
      const { data, error } = await supabase
        .from("engineers")
        .select("engineer_id, email, name")
        .eq("engineer_id", engineerId)
        .maybeSingle()

      if (error) {
        console.error("❌ Engineer lookup failed:", error)
        return
      }

      if (!data) {
        console.warn(`⚠️ No engineer found with ID: ${engineerId}`)
        console.warn("⚠️ Available engineer IDs:")
        await this.listAllEngineers()
        return
      }

      console.log("✅ Engineer found:")
      console.log(`  ID: ${data.engineer_id}`)
      console.log(`  Name: ${data.name || "NO NAME"}`)
      console.log(`  Email: ${data.email || "NO EMAIL"}`)

      if (!data.email) {
        console.warn("⚠️ This engineer has no email address!")
        console.warn("⚠️ Email will not be sent to this engineer")
      }
    } catch (error) {
      console.error("❌ Exception during engineer lookup:", error)
    }
  }

  /**
   * Test backend email service connectivity
   */
  static async testBackendConnectivity(backendUrl: string): Promise<void> {
    console.log(`🔧 Testing backend connectivity: ${backendUrl}`)

    try {
      const response = await fetch(`${backendUrl}/api/health`, {
        method: "GET",
      })

      if (response.ok) {
        console.log("✅ Backend is reachable")
        const data = await response.json()
        console.log("✅ Backend response:", data)
      } else {
        console.warn(`⚠️ Backend returned status: ${response.status}`)
        console.warn("⚠️ This might affect email sending")
      }
    } catch (error) {
      console.error("❌ Backend connectivity failed:", error)
      console.error("❌ Check your BACKEND_API_URL configuration")
    }
  }

  /**
   * Run comprehensive email debugging
   */
  static async runFullDiagnostic(engineerId?: string): Promise<void> {
    console.log("🚀 Starting comprehensive email diagnostic...")
    console.log("=".repeat(50))

    await this.testDatabaseConnection()
    console.log("-".repeat(30))

    await this.listAllEngineers()
    console.log("-".repeat(30))

    if (engineerId) {
      await this.testEngineerLookup(engineerId)
      console.log("-".repeat(30))
    }

    await this.testBackendConnectivity("https://nxs-e-jobcards-backend.vercel.app")

    console.log("=".repeat(50))
    console.log("🏁 Diagnostic complete!")
  }
}

// Export convenience function
export const debugEmail = EmailDebugger.runFullDiagnostic
