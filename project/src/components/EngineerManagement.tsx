import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, User, Mail, Key, Car as IdCard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';

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
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    engineer_id: '',
    password: ''
  });

  useEffect(() => {
    fetchEngineers();
  }, []);

  const fetchEngineers = async () => {
    try {
      const { data, error } = await supabase
        .from('engineers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEngineers(data || []);
    } catch (error) {
      console.error('Error fetching engineers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEngineer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const hashedPassword = await bcrypt.hash(formData.password, 10);
      
      const { error } = await supabase
        .from('engineers')
        .insert({
          name: formData.name,
          email: formData.email,
          engineer_id: formData.engineer_id,
          password_hash: hashedPassword
        });

      if (error) throw error;

      setFormData({ name: '', email: '', engineer_id: '', password: '' });
      setShowAddForm(false);
      fetchEngineers();
    } catch (error) {
      console.error('Error adding engineer:', error);
      alert('Error adding engineer. Please try again.');
    }
  };

  const handleUpdateEngineer = async (id: string, updates: Partial<Engineer>) => {
    try {
      const updateData: any = { ...updates };
      
      // If password is being updated, hash it
      if ('password' in updates && updates.password) {
        updateData.password_hash = await bcrypt.hash(updates.password as string, 10);
        delete updateData.password;
      }

      const { error } = await supabase
        .from('engineers')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setEditingId(null);
      fetchEngineers();
    } catch (error) {
      console.error('Error updating engineer:', error);
      alert('Error updating engineer. Please try again.');
    }
  };

  const handleDeleteEngineer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this engineer?')) return;

    try {
      const { error } = await supabase
        .from('engineers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchEngineers();
    } catch (error) {
      console.error('Error deleting engineer:', error);
      alert('Error deleting engineer. Please try again.');
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
            <h1 className="text-2xl font-bold text-gray-900">Engineer Management</h1>
            <p className="text-gray-600">Manage engineer accounts and credentials</p>
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
            <h2 className="text-lg font-semibold text-gray-900">Add New Engineer</h2>
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Engineer ID *
                </label>
                <input
                  type="text"
                  value={formData.engineer_id}
                  onChange={(e) => setFormData({ ...formData, engineer_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., ENG-003"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ name: '', email: '', engineer_id: '', password: '' });
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Add Engineer</span>
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

function EngineerRow({ engineer, isEditing, onEdit, onSave, onCancel, onDelete }: EngineerRowProps) {
  const [editData, setEditData] = useState({
    name: engineer.name,
    email: engineer.email,
    engineer_id: engineer.engineer_id,
    password: ''
  });

  const handleSave = () => {
    const updates: any = {
      name: editData.name,
      email: editData.email,
      engineer_id: editData.engineer_id
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Engineer ID</label>
            <input
              type="text"
              value={editData.engineer_id}
              onChange={(e) => setEditData({ ...editData, engineer_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password (optional)</label>
            <input
              type="password"
              value={editData.password}
              onChange={(e) => setEditData({ ...editData, password: e.target.value })}
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