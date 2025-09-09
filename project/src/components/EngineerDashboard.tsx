import React, { useState } from "react";
import {
  FileText,
  Download,
  Search,
  Calendar,
  Building,
  Wrench,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useJobCard } from "../contexts/JobCardContext";
import { generateJobCardPDF } from "../utils/pdfGenerator";
import { LoadingSpinner } from "./LoadingSpinner";

interface EngineerDashboardProps {
  onCreateJobCard: () => void;
}

export function EngineerDashboard({ onCreateJobCard }: EngineerDashboardProps) {
  const { user } = useAuth();
  const { getJobCardsByEngineerId, isLoading } = useJobCard();
  const [searchTerm, setSearchTerm] = useState("");

  const jobCards = user?.engineerId
    ? getJobCardsByEngineerId(user.engineerId)
    : [];

  // Show loading spinner while data is loading
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner message="Loading job cards..." size="lg" />
      </div>
    );
  }

  const filteredJobCards = jobCards.filter(
    (card) =>
      card.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.machineType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = (jobCard: any) => {
    generateJobCardPDF(jobCard);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Engineer Dashboard
            </h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
          </div>
          <button
            onClick={onCreateJobCard}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <FileText className="w-5 h-5" />
            <span>Create New Job Card</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {jobCards.length}
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
                {new Set(jobCards.map((card) => card.hospitalName)).size}
              </p>
              <p className="text-sm text-gray-600">Facilities Served</p>
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
                {
                  jobCards.filter(
                    (card) =>
                      new Date(card.createdAt).getMonth() ===
                      new Date().getMonth()
                  ).length
                }
              </p>
              <p className="text-sm text-gray-600">This Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search job cards by hospital, machine type, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {/* Job Cards List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Job Cards
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredJobCards.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No job cards found</p>
              <button
                onClick={onCreateJobCard}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Create your first job card
              </button>
            </div>
          ) : (
            filteredJobCards.map((card) => (
              <div
                key={card.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {card.id}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(card.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {card.hospitalName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {card.machineType} - {card.machineModel} (S/N:{" "}
                      {card.serialNumber})
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      Problem: {card.problemReported}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleDownload(card)}
                      className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
