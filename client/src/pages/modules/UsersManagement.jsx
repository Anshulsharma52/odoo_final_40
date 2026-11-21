import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import Modal from '../../components/common/Modal';
import { Users, Shield, Phone, Mail, CheckCircle2, XCircle, UserPlus, Lock, Key } from 'lucide-react';
import toast from 'react-hot-toast';

const FUNCTIONAL_ROLES = [
  'Admin',
  'Technician',
  'Sales',
  'Warehouse',
  'Service & Support'
];

const ALL_ROLES = [
  'Admin',
  'Technician',
  'Sales',
  'Warehouse',
  'Service & Support',
  'Customer'
];

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form for Admin creating a functional role
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'Sales',
    phone: '',
    address: 'SunPower Operations Hub'
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      if (res.data.success) setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateFunctionalUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/auth/users', newUser);
      if (res.data.success) {
        toast.success(`Functional role '${newUser.role}' account created for ${newUser.name}!`);
        setIsCreateModalOpen(false);
        setNewUser({
          name: '',
          email: '',
          password: 'password123',
          role: 'Sales',
          phone: '',
          address: 'SunPower Operations Hub'
        });
        fetchUsers();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create user';
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.put(`/auth/users/${userId}`, { role: newRole });
      if (res.data.success) {
        toast.success(`Role updated to ${newRole}`);
        fetchUsers();
      }
    } catch (err) {
      toast.error('Failed to update user role');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const res = await api.put(`/auth/users/${user._id || user.id}`, { active: !user.active });
      if (res.data.success) {
        toast.success(`User ${!user.active ? 'activated' : 'deactivated'}`);
        fetchUsers();
      }
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Employees & Role-Based Access Control
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Only Administrators can create, approve, and reassign functional employee roles. Customers register independently.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 w-fit"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Create Functional Role User</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Active User Directory</h2>
            <p className="text-xs text-slate-400">Total {users.length} registered accounts across all operational domains</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
            Admin Authority Enforced
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
              <tr>
                <th className="py-3 px-3">User Profile</th>
                <th className="py-3 px-3">Contact Details</th>
                <th className="py-3 px-3">Assigned Role (RBAC)</th>
                <th className="py-3 px-3">Account Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map((u) => (
                <tr key={u._id || u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 flex items-center gap-2.5">
                    <img
                      src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
                      alt={u.name}
                      className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">{u.name}</span>
                      <span className="text-[11px] text-slate-400">{u.address || 'SunPower Staff'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="block text-slate-800 font-medium">{u.email}</span>
                    <span className="text-[11px] text-slate-400">{u.phone || 'No phone'}</span>
                  </td>
                  <td className="py-3 px-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id || u.id, e.target.value)}
                      className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50"
                    >
                      {ALL_ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                      u.active !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {u.active !== false ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleToggleActive(u)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        u.active !== false ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {u.active !== false ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Modal: Create Functional Role User */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Admin: Create Functional Role Account"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateFunctionalUser} className="space-y-3.5 text-xs">
          <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 text-purple-900 text-xs">
            <span className="font-bold block mb-0.5">Admin Role Provisioning Console</span>
            <p className="text-[11px] text-purple-700">
              Functional roles can only be created by an Administrator. Public registration is restricted strictly to Customers.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Employee Full Name</label>
            <input
              type="text"
              required
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-xl"
              placeholder="e.g. Ramesh Kulkarni"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company Email Address</label>
            <input
              type="email"
              required
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-xl"
              placeholder="e.g. ramesh@sunpower.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Functional Role (RBAC)</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-xl bg-white font-bold text-slate-800"
              >
                {FUNCTIONAL_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-xl"
                placeholder="+91 98200 12345"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Initial Password</label>
            <input
              type="password"
              required
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-xl font-mono"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Department Office / Station Address</label>
            <input
              type="text"
              value={newUser.address}
              onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-xl"
              placeholder="e.g. Pune Operations Hub"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm disabled:opacity-50"
            >
              {creating ? 'Creating Account...' : 'Provision & Approve Role'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersManagement;