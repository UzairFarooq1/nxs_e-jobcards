import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  Building,
  Users,
  Wrench,
  UserPlus,
  Mail,
  User,
  Edit,
  Save,
  X,
  Settings,
} from "lucide-react";
import { useJobCard } from "../contexts/JobCardContext";
import { useAuth } from "../contexts/AuthContext";
import { EmailDebugPanel } from "./EmailDebugPanel";
import { generateJobCardPDF } from "../utils/emailService";

export function AdminDashboard() {
  const { getAllJobCards, loadJobCardsIfAuthenticated } = useJobCard();
  const { getAllUsers, addEngineer, editEngineer } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [currentView, setCurrentView] = useState<"dashboard" | "engineers" | "debug">(
    "dashboard"
  );
  const [engineers, setEngineers] = useState<any[]>([]);
  const [engineersLoading, setEngineersLoading] = useState(true);
  const [editingEngineer, setEditingEngineer] = useState<string | null>(null);
  const [newEngineer, setNewEngineer] = useState({
    name: "",
    email: "",
    engineerId: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    engineerId: "",
    password: "",
  });

  const allJobCards = getAllJobCards();

  useEffect(() => {
    // Only load data once when component mounts
    loadEngineers();
    loadJobCardsIfAuthenticated();
  }, []); // Remove loadJobCardsIfAuthenticated dependency to prevent continuous loading

  const loadEngineers = async () => {
    try {
      setEngineersLoading(true);
      console.log("🔄 Loading engineers...");
      const users = await getAllUsers();
      const engineerUsers = users.filter((user) => user.role === "engineer");
      console.log("✅ Loaded engineers:", engineerUsers.length);
      setEngineers(engineerUsers);
    } catch (error) {
      console.error("❌ Error loading engineers:", error);
      setEngineers([]);
    } finally {
      setEngineersLoading(false);
    }
  };

  const filteredJobCards = allJobCards.filter((card) => {
    const matchesSearch =
      card.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.machineType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.engineerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterBy === "all") return matchesSearch;
    if (filterBy === "thisMonth") {
      const cardDate = new Date(card.createdAt);
      const currentDate = new Date();
      return (
        matchesSearch &&
        cardDate.getMonth() === currentDate.getMonth() &&
        cardDate.getFullYear() === currentDate.getFullYear()
      );
    }
    return matchesSearch;
  });

  const handleDownload = async (jobCard: any) => {
    try {
      const pdfBlob = await generateJobCardPDF(jobCard);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `jobcard-${jobCard.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  const handleBulkDownload = async () => {
    for (const card of filteredJobCards) {
      try {
        const pdfBlob = await generateJobCardPDF(card);
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `jobcard-${card.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        // Small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error("Error downloading PDF for card", card.id, ":", error);
      }
    }
  };

  const handleAddEngineer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addEngineer({
        name: newEngineer.name,
        email: newEngineer.email,
        role: "engineer",
        engineerId: newEngineer.engineerId,
      });
      setNewEngineer({ name: "", email: "", engineerId: "" });
      loadEngineers();
    } catch (error) {
      console.error("Error adding engineer:", error);
    }
  };

  const handleEditEngineer = (engineer: any) => {
    setEditingEngineer(engineer.id);
    setEditForm({
      name: engineer.name,
      email: engineer.email,
      engineerId: engineer.engineerId || "",
      password: "",
    });
  };

  const handleSaveEdit = async () => {
    try {
      await editEngineer(editingEngineer!, editForm);
      setEditingEngineer(null);
      loadEngineers();
    } catch (error) {
      console.error("Error editing engineer:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingEngineer(null);
    setEditForm({ name: "", email: "", engineerId: "", password: "" });
  };

  const uniqueFacilities = new Set(allJobCards.map((card) => card.hospitalName))
    .size;
  const uniqueEngineers = new Set(allJobCards.map((card) => card.engineerName))
    .size;
  const thisMonthCards = allJobCards.filter((card) => {
    const cardDate = new Date(card.createdAt);
    const currentDate = new Date();
    return (
      cardDate.getMonth() === currentDate.getMonth() &&
      cardDate.getFullYear() === currentDate.getFullYear()
    );
  }).length;

  if (currentView === "engineers") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Engineer Management
              </h1>
              <p className="text-gray-600">
                Manage engineer accounts and permissions
              </p>
            </div>
            <button
              onClick={() => setCurrentView("dashboard")}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Add Engineer Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Add New Engineer
            </h2>
            <form
              onSubmit={handleAddEngineer}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newEngineer.name}
                  onChange={(e) =>
                    setNewEngineer({ ...newEngineer, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newEngineer.email}
                  onChange={(e) =>
                    setNewEngineer({ ...newEngineer, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Engineer ID
                </label>
                <input
                  type="text"
                  value={newEngineer.engineerId}
                  onChange={(e) =>
                    setNewEngineer({
                      ...newEngineer,
                      engineerId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="md:col-span-3">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Engineer</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Engineers List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Registered Engineers
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {engineers.map((engineer) => (
              <div key={engineer.id} className="p-6">
                {editingEngineer === engineer.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Engineer ID
                      </label>
                      <input
                        type="text"
                        value={editForm.engineerId}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            engineerId: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={editForm.password}
                        onChange={(e) =>
                          setEditForm({ ...editForm, password: e.target.value })
                        }
                        placeholder="Leave blank to keep current"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-4 flex space-x-3">
                      <button
                        onClick={handleSaveEdit}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {engineer.name}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {engineer.email}
                        </p>
                        <p className="text-sm text-blue-600">
                          {engineer.engineerId}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEditEngineer(engineer)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "debug") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Email Debug Panel
              </h1>
              <p className="text-gray-600">Debug email sending issues and test engineer email lookup</p>
            </div>
            <button
              onClick={() => setCurrentView("dashboard")}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <X className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
        <EmailDebugPanel />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-transparent to-purple-50/30 rounded-3xl -m-4"></div>
      <div className="relative z-10">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Monitor and manage all job cards</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setCurrentView("engineers")}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Settings className="w-5 h-5" />
                <span>Manage Engineers</span>
              </button>
              <button
                onClick={() => setCurrentView("debug")}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Wrench className="w-5 h-5" />
                <span>Email Debug</span>
              </button>
              {filteredJobCards.length > 0 && (
                <button
                  onClick={handleBulkDownload}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download All ({filteredJobCards.length})</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {allJobCards.length}
                </p>
                <p className="text-sm text-gray-600">Total Job Cards</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {uniqueFacilities}
                </p>
                <p className="text-sm text-gray-600">Facilities Served</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {uniqueEngineers}
                </p>
                <p className="text-sm text-gray-600">Active Engineers</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Wrench className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {thisMonthCards}
                </p>
                <p className="text-sm text-gray-600">This Month</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by hospital, engineer, machine type, or job card ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Records</option>
                  <option value="thisMonth">This Month</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Job Cards List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Job Cards ({filteredJobCards.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredJobCards.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No job cards found</p>
              </div>
            ) : (
              filteredJobCards.map((card) => (
                <div
                  key={card.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between space-y-4 xl:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {card.id}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(card.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">
                          {card.engineerName}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {card.hospitalName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {card.machineType} - {card.machineModel} (S/N:{" "}
                        {card.serialNumber})
                      </p>
                      <div className="grid md:grid-cols-2 gap-2">
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Problem:</span>{" "}
                          {card.problemReported}
                        </p>
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Service:</span>{" "}
                          {card.servicePerformed}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleDownload(card)}
                        className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
