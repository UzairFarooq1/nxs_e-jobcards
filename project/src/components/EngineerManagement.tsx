import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  User,
  Mail,
  Key,
  Car as IdCard,
} from "lucide-react";
import { supabase } from "../config/supabase";
import { useAuth } from "../contexts/AuthContext";

interface Engineer {
  id: string;
  name: string;
  email: string;
  engineer_id: string;
  created_at: string;
}

interface EngineerManagementProps {
  onBack: () => void;
}

export function EngineerManagement({ onBack }: EngineerManagementProps) {
  const { addEngineer } = useAuth();
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    engineer_id: "",
  });

  useEffect(() => {
    fetchEngineers();
  }, []);

  const fetchEngineers = async () => {
    try {
      const { data, error } = await supabase
        .from("engineers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEngineers(data || []);
    } catch (error) {
      console.error("Error fetching engineers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEngineer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const result = await addEngineer({
        name: formData.name,
        email: formData.email,
        engineerId: formData.engineer_id || undefined, // Let backend auto-generate if empty
        role: "engineer",
      });

      console.log("✅ Engineer creation result:", result);

      setFormData({ name: "", email: "", engineer_id: "" });
      setShowAddForm(false);
      setSubmitMessage({
        type: "success",
        text: `Engineer account created successfully! An invite email has been sent to ${formData.email}.`,
      });

      // Refresh the engineers list
      setTimeout(() => {
        fetchEngineers();
        setSubmitMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error("❌ Error adding engineer:", error);
      setSubmitMessage({
        type: "error",
        text:
          error.message ||
          "Failed to create engineer account. Please check the backend configuration and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEngineer = async (
    id: string,
    updates: Partial<Engineer>
  ) => {
    try {
      const updateData: any = { ...updates };

      // If password is being updated, hash it
      if ("password" in updates && updates.password) {
        updateData.password_hash = await bcrypt.hash(
          updates.password as string,
          10
        );
        delete updateData.password;
      }

      const { error } = await supabase
        .from("engineers")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      setEditingId(null);
      fetchEngineers();
    } catch (error) {
      console.error("Error updating engineer:", error);
      alert("Error updating engineer. Please try again.");
    }
  };

  const handleDeleteEngineer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this engineer?")) return;

    try {
      const { error } = await supabase.from("engineers").delete().eq("id", id);

      if (error) throw error;
      fetchEngineers();
    } catch (error) {
      console.error("Error deleting engineer:", error);
      alert("Error deleting engineer. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading engineers...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Engineer Management
            </h1>
            <p className="text-gray-600">
              Manage engineer accounts and credentials
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Engineer</span>
        </button>
      </div>

      {/* Add Engineer Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Add New Engineer
            </h2>
          </div>
          <form onSubmit={handleAddEngineer} className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Engineer ID
                </label>
                <input
                  type="text"
                  value={formData.engineer_id}
                  onChange={(e) =>
                    setFormData({ ...formData, engineer_id: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., ENG-003 (auto-generated if empty)"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Password Setup:</strong> The engineer will receive
                    an email invitation to set their own password. No password
                    needs to be entered here.
                  </p>
                </div>
              </div>
            </div>

            {/* Success/Error Message */}
            {submitMessage && (
              <div
                className={`rounded-lg p-4 mb-6 ${
                  submitMessage.type === "success"
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {submitMessage.type === "success" ? (
                      <svg
                        className="h-5 w-5 text-green-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{submitMessage.text}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ name: "", email: "", engineer_id: "" });
                  setSubmitMessage(null);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Add Engineer</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Engineers List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Engineers ({engineers.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {engineers.length === 0 ? (
            <div className="p-8 text-center">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No engineers found</p>
            </div>
          ) : (
            engineers.map((engineer) => (
              <EngineerRow
                key={engineer.id}
                engineer={engineer}
                isEditing={editingId === engineer.id}
                onEdit={() => setEditingId(engineer.id)}
                onSave={(updates) => handleUpdateEngineer(engineer.id, updates)}
                onCancel={() => setEditingId(null)}
                onDelete={() => handleDeleteEngineer(engineer.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface EngineerRowProps {
  engineer: Engineer;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updates: Partial<Engineer & { password?: string }>) => void;
  onCancel: () => void;
  onDelete: () => void;
}

function EngineerRow({
  engineer,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: EngineerRowProps) {
  const [editData, setEditData] = useState({
    name: engineer.name,
    email: engineer.email,
    engineer_id: engineer.engineer_id,
    password: "",
  });

  const handleSave = () => {
    const updates: any = {
      name: editData.name,
      email: editData.email,
      engineer_id: editData.engineer_id,
    };

    if (editData.password) {
      updates.password = editData.password;
    }

    onSave(updates);
  };

  if (isEditing) {
    return (
      <div className="p-6 bg-blue-50">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={editData.email}
              onChange={(e) =>
                setEditData({ ...editData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Engineer ID
            </label>
            <input
              type="text"
              value={editData.engineer_id}
              onChange={(e) =>
                setEditData({ ...editData, engineer_id: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password (optional)
            </label>
            <input
              type="password"
              value={editData.password}
              onChange={(e) =>
                setEditData({ ...editData, password: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Leave blank to keep current password"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center space-x-1"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-1"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-2">
            <h3 className="font-semibold text-gray-900">{engineer.name}</h3>
            <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {engineer.engineer_id}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <Mail className="w-4 h-4 mr-1" />
              {engineer.email}
            </span>
            <span>
              Created: {new Date(engineer.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
