import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../config/supabase";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "engineer" | "admin";
  engineerId?: string;
  password?: string; // Optional - only used for creating new users, not stored in engineers table
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  addEngineer: (engineer: Omit<User, "id">) => Promise<void>;
  editEngineer: (id: string, updates: Partial<User>) => Promise<void>;
  getAllUsers: () => Promise<User[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Simple cache to avoid repeated database calls
const userCache = new Map<string, User>();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    // Check for existing Supabase session with timeout
    const getSession = async () => {
      console.log("🔄 Checking for existing session...");

      // Add timeout to prevent hanging on session check
      const sessionTimeout = setTimeout(() => {
        console.error("⏰ Session check timed out - setting loading to false");
        setIsLoading(false);
      }, 15000);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          console.log("📱 Existing session found, loading user data...");
          await loadUserFromSession(session.user);
        } else {
          console.log("🚫 No existing session found");
        }

        clearTimeout(sessionTimeout);
        setIsLoading(false);
      } catch (error) {
        console.error("❌ Error checking session:", error);
        clearTimeout(sessionTimeout);
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (session?.user) {
        await loadUserFromSession(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      console.log("✅ User session active:", user.name);
    } else {
      console.log("👤 No user session");
    }
  }, [user]);

  const loadUserFromSession = async (supabaseUser: any) => {
    // Prevent multiple simultaneous authentication attempts
    if (isAuthenticating) {
      console.log("🔄 Authentication already in progress, skipping...");
      return;
    }

    setIsAuthenticating(true);
    try {
      console.log("Loading user from session:", supabaseUser.email);

      // Check cache first
      const cachedUser = userCache.get(supabaseUser.email);
      if (cachedUser) {
        console.log("✅ Using cached user data:", cachedUser.name);
        setUser(cachedUser);
        return;
      }

      // Check if admin
      if (supabaseUser.email === "it@vanguard-group.org") {
        console.log("Setting admin user");
        const adminUser = {
          id: supabaseUser.id,
          name: "Admin User",
          email: supabaseUser.email,
          role: "admin" as const,
        };
        userCache.set(supabaseUser.email, adminUser);
        setUser(adminUser);
        return;
      }

      // Check if engineer with timeout
      console.log("Looking up engineer in database...");

      const engineerQuery = supabase
        .from("engineers")
        .select("*")
        .eq("email", supabaseUser.email)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database query timeout")), 5000)
      );

      try {
        const { data: engineer, error } = (await Promise.race([
          engineerQuery,
          timeoutPromise,
        ])) as any;

        if (engineer && !error) {
          console.log("Engineer found:", engineer.name);
          const engineerUser = {
            id: engineer.id,
            name: engineer.name,
            email: engineer.email,
            role: "engineer" as const,
            engineerId: engineer.engineer_id,
          };
          userCache.set(supabaseUser.email, engineerUser);
          setUser(engineerUser);
        } else {
          // If user exists in auth but not in engineers table, log them out
          console.warn("User not found in engineers table, logging out");
          console.error("Engineer lookup error:", error);
          console.log("To fix this issue:");
          console.log("1. Go to Supabase Dashboard > Authentication > Users");
          console.log("2. Find the user:", supabaseUser.email);
          console.log("3. Copy their user ID");
          console.log(
            "4. Add them to the engineers table using the SQL script"
          );
          await supabase.auth.signOut();
          setUser(null);
        }
      } catch (timeoutError) {
        console.error("Database query timed out:", timeoutError);
        console.warn("Database timeout - using fallback authentication");

        // Fallback: Check if this is a known engineer email
        const knownEngineers = [
          {
            email: "charles.wanjohi@nxsltd.com",
            name: "Charles Wanjohi",
            engineerId: "ENG-001",
          },
          {
            email: "juliet.timpiyian@nxsltd.com",
            name: "Juliet Timpiyian",
            engineerId: "ENG-002",
          },
          {
            email: "john.doe@nxsltd.com",
            name: "John Doe",
            engineerId: "ENG-003",
          },
          {
            email: "jane.smith@nxsltd.com",
            name: "Jane Smith",
            engineerId: "ENG-004",
          },
          {
            email: "uzair.farooq@nxsltd.com",
            name: "Uzair Farooq",
            engineerId: "ENG-005",
          },
        ];

        const knownEngineer = knownEngineers.find(
          (e) => e.email === supabaseUser.email
        );
        if (knownEngineer) {
          console.log("Using fallback engineer data:", knownEngineer.name);
          const fallbackUser = {
            id: `fallback-${knownEngineer.engineerId}`,
            name: knownEngineer.name,
            email: knownEngineer.email,
            role: "engineer" as const,
            engineerId: knownEngineer.engineerId,
          };
          userCache.set(supabaseUser.email, fallbackUser);
          setUser(fallbackUser);
        } else {
          console.warn("Unknown engineer - logging out user");
          console.log(
            "💡 To add this user to fallback list, add them to knownEngineers array in AuthContext.tsx"
          );

          // Sign out and ensure loading state is cleared
          try {
            await supabase.auth.signOut();
          } catch (signOutError) {
            console.error("Error signing out:", signOutError);
          }
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Error loading user from session:", error);
      // Don't get stuck - set user to null on error
      setUser(null);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    console.log("🔐 Starting login process for:", email);

    // Add overall timeout to prevent login from hanging
    const loginTimeout = setTimeout(() => {
      console.error("⏰ Login process timed out after 30 seconds");
      setIsLoading(false);
    }, 30000);

    try {
      console.log("Attempting login for:", email);

      // Try Supabase Auth first
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password,
      });

      if (error) {
        console.error("Supabase Auth error:", error.message);
        clearTimeout(loginTimeout);
        setIsLoading(false);
        return false;
      }

      if (data.user) {
        console.log("Supabase Auth successful, loading user data...");
        try {
          await loadUserFromSession(data.user);
          clearTimeout(loginTimeout);
          setIsLoading(false);
          return true;
        } catch (loadUserError) {
          console.error(
            "Error loading user data after successful auth:",
            loadUserError
          );
          console.warn(
            "Authentication succeeded but user data loading failed - signing out"
          );

          // If user data loading fails, sign out to prevent stuck state
          try {
            await supabase.auth.signOut();
          } catch (signOutError) {
            console.error(
              "Error signing out after failed user load:",
              signOutError
            );
          }

          setUser(null);
          clearTimeout(loginTimeout);
          setIsLoading(false);
          return false;
        }
      }

      // Fallback: Admin credential check only
      if (
        email.toLowerCase() === "it@vanguard-group.org" &&
        password === "Vgc@admin2025!"
      ) {
        console.log("Admin login successful (fallback)");
        setUser({
          id: "admin-fallback",
          name: "Admin User",
          email: email,
          role: "admin",
        });
        clearTimeout(loginTimeout);
        setIsLoading(false);
        return true;
      }

      console.log("Login failed - invalid credentials or password not set");
      clearTimeout(loginTimeout);
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error("Login error:", error);
      clearTimeout(loginTimeout);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log("🔐 Logging out user...");

      // Clear user cache
      if (user?.email) {
        userCache.delete(user.email);
        console.log("✅ User cache cleared");
      }

      // Sign out from Supabase
      await supabase.auth.signOut();
      console.log("✅ Supabase session signed out");

      // Clear local state
      setUser(null);
      console.log("✅ User state cleared");

      // Clear auth-related localStorage data only, preserve job cards cache
      const jobCardsCache = localStorage.getItem("nxs-jobcards");
      localStorage.clear();
      if (jobCardsCache) {
        localStorage.setItem("nxs-jobcards", jobCardsCache);
        console.log("✅ Job cards cache preserved during logout");
      }
      console.log("✅ LocalStorage cleared (except job cards)");

      // Clear any cached data
      sessionStorage.clear();
      console.log("✅ SessionStorage cleared");

      console.log("🎉 Logout completed successfully");
    } catch (error) {
      console.error("❌ Error during logout:", error);

      // Force logout even if there's an error
      setUser(null);
      const jobCardsCache = localStorage.getItem("nxs-jobcards");
      localStorage.clear();
      if (jobCardsCache) {
        localStorage.setItem("nxs-jobcards", jobCardsCache);
      }
      sessionStorage.clear();

      // Reload the page to ensure clean state
      window.location.reload();
    }
  };

  const addEngineer = async (engineer: Omit<User, "id">) => {
    try {
      // Call backend admin endpoint so service role creates user and inserts row
      const baseUrl =
        import.meta.env.VITE_API_URL ||
        "https://nxs-e-jobcards-back-gkiszeac9-cyber-guys-projects.vercel.app";

      // Ensure baseUrl is valid
      if (
        !baseUrl ||
        (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://"))
      ) {
        throw new Error("Invalid API URL configuration");
      }

      const apiUrl = baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
      const fullUrl = `${apiUrl}/admin/create-engineer`;

      console.log("🔧 DEBUG - Adding engineer via backend:");
      console.log("  Base URL:", baseUrl);
      console.log("  API URL:", apiUrl);
      console.log("  Full URL:", fullUrl);
      console.log("  API Key set:", !!import.meta.env.VITE_ADMIN_API_KEY);
      console.log("  Engineer data:", engineer);

      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-api-key": import.meta.env.VITE_ADMIN_API_KEY || "",
        },
        body: JSON.stringify({
          name: engineer.name,
          email: engineer.email,
          engineerId: engineer.engineerId,
        }),
      });

      console.log("🔧 DEBUG - Response status:", response.status);
      console.log(
        "🔧 DEBUG - Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const responseText = await response.text();
        console.log("🔧 DEBUG - Error response text:", responseText);

        let err = {};
        try {
          err = JSON.parse(responseText);
        } catch (e) {
          err = { error: responseText };
        }
        throw new Error(
          err.error || `HTTP ${response.status}: ${responseText}`
        );
      }

      const result = await response.json();
      console.log("✅ Engineer created successfully:", result);
      return result;
    } catch (error) {
      console.error("❌ Error adding engineer:", error);
      throw error;
    }
  };

  const editEngineer = async (id: string, updates: Partial<User>) => {
    try {
      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.email) updateData.email = updates.email;
      if (updates.engineerId) updateData.engineer_id = updates.engineerId;
      // Password handling removed for security - use Supabase Auth for password changes

      const { error } = await supabase
        .from("engineers")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error editing engineer:", error);
      throw error;
    }
  };

  const getAllUsers = async (): Promise<User[]> => {
    try {
      const { data: engineers, error } = await supabase
        .from("engineers")
        .select("*");

      if (error) throw error;

      const users: User[] = [
        {
          id: "admin",
          name: "Admin User",
          email: "it@vanguard-group.org",
          role: "admin",
        },
        ...(engineers || []).map((engineer) => ({
          id: engineer.id,
          name: engineer.name,
          email: engineer.email,
          role: "engineer" as const,
          engineerId: engineer.engineer_id,
          // Password removed for security - managed by Supabase Auth
        })),
      ];

      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        addEngineer,
        editEngineer,
        getAllUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
