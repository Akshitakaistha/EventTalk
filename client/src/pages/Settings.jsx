import React from "react";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "@/components/sidebar/Sidebar";

const Settings = () => {
  const { user, logout } = useAuth();

  const formattedRole =
    user.role === "super_admin" ? "Super Admin" : user.role === "admin" ? "Admin" : user.role;

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">User Settings</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <p className="text-gray-900">{user.username}</p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900">{user.email}</p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <p className="text-gray-900">{formattedRole}</p>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <p className="text-gray-900">••••••••</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
