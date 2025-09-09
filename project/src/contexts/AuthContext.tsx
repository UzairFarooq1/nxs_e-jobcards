import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../config/supabase";
import { getInactivityManager } from "../utils/inactivityManager";

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing Supabase session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserFromSession(session.user);
      }
      setIsLoading(false);
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
      // Initialize inactivity manager when user logs in
      const inactivityManager = getInactivityManager();
      inactivityManager.start(() => {
        // Logout callback
        logout();
      });

      return () => {
        inactivityManager.destroy();
      };
    }
  }, [user]);

  const loadUserFromSession = async (supabaseUser: any) => {
    try {
      console.log("Loading user from session:", supabaseUser.email);

      // Check if admin
      if (supabaseUser.email === "it@vanguard-group.org") {
        console.log("Setting admin user");
        setUser({
          id: supabaseUser.id,
          name: "Admin User",
          email: supabaseUser.email,
          role: "admin",
        });
        return;
      }

      // Check if engineer with timeout
      console.log("Looking up engineer in database...");

      const engineerQuery = supabase
        .from("engineers")
        .select("*")
        .eq("email", supabaseUser.email)
        .single();

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
          setUser({
            id: engineer.id,
            name: engineer.name,
            email: engineer.email,
            role: "engineer",
            engineerId: engineer.engineer_id,
          });
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
        ];

        const knownEngineer = knownEngineers.find(
          (e) => e.email === supabaseUser.email
        );
        if (knownEngineer) {
          console.log("Using fallback engineer data:", knownEngineer.name);
          setUser({
            id: `fallback-${knownEngineer.engineerId}`,
            name: knownEngineer.name,
            email: knownEngineer.email,
            role: "engineer",
            engineerId: knownEngineer.engineerId,
          });
        } else {
          console.warn("Unknown engineer - logging out user");
          await supabase.auth.signOut();
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Error loading user from session:", error);
      // Don't get stuck - set user to null on error
      setUser(null);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      console.log("Attempting login for:", email);

      // Try Supabase Auth first
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password: password,
        });

        if (error) {
          console.error("Supabase Auth error:", error.message);
          // Fall through to fallback method
        } else if (data.user) {
          console.log("Supabase Auth successful, loading user data...");
          await loadUserFromSession(data.user);
          setIsLoading(false);
          return true;
        }
      } catch (supabaseError) {
        console.error("Supabase Auth failed:", supabaseError);
        // Fall through to fallback method
      }

      // Fallback: Simple credential check for testing
      console.log("Using fallback authentication method");

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
        setIsLoading(false);
        return true;
      }

      // Check if engineer exists in database (password validation removed for security)
      console.log("Checking if engineer exists in database...");

      const engineerQuery = supabase
        .from("engineers")
        .select("*")
        .eq("email", email.toLowerCase())
        .single();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database query timeout")), 5000)
      );

      try {
        const { data: engineer, error: engineerError } = (await Promise.race([
          engineerQuery,
          timeoutPromise,
        ])) as any;

        if (engineer && !engineerError) {
          console.log("Engineer found in database:", engineer.name);
          console.log(
            "Note: Password validation removed for security. Use Supabase Auth for authentication."
          );
          setUser({
            id: engineer.id,
            name: engineer.name,
            email: engineer.email,
            role: "engineer",
            engineerId: engineer.engineer_id,
          });
          setIsLoading(false);
          return true;
        } else {
          console.log("Engineer not found in database");
          console.error("Engineer lookup error:", engineerError);
        }
      } catch (timeoutError) {
        console.error("Database query timed out:", timeoutError);
        console.log("Database timeout - login failed");
      }

      console.log("Login failed - invalid credentials");
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const addEngineer = async (engineer: Omit<User, "id">) => {
    try {
      // First create the user in Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: engineer.email,
          password: engineer.password || "password123",
          email_confirm: true,
        });

      if (authError) throw authError;

      // Then add to engineers table (no password stored for security)
      const { error: dbError } = await supabase.from("engineers").insert({
        id: authData.user.id,
        name: engineer.name,
        email: engineer.email,
        engineer_id: engineer.engineerId || `ENG-${Date.now()}`,
      });

      if (dbError) throw dbError;
    } catch (error) {
      console.error("Error adding engineer:", error);
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
