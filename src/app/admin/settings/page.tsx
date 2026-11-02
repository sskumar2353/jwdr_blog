'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle2, Shield, Settings as SettingsIcon, Key, X } from 'lucide-react';

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState({
    siteTitle: '',
    tagline: '',
    authorName: '',
    authorBio: '',
    authorEmail: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setFormData({
            siteTitle: data.settings.siteTitle || '',
            tagline: data.settings.tagline || '',
            authorName: data.settings.authorName || '',
            authorBio: data.settings.authorBio || '',
            authorEmail: data.settings.authorEmail || '',
          });
        }
      })
      .catch(() => setError('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('Settings updated successfully!');
      } else {
        setError(data.error || 'Failed to save settings');
      }
    } catch {
      setError('Connection error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 4) {
      setPasswordError('New password must be at least 4 characters long.');
      return;
    }

    setPasswordUpdating(true);

    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordSuccess('Admin password updated successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess('');
        }, 1500);
      } else {
        setPasswordError(data.error || 'Failed to update password');
      }
    } catch {
      setPasswordError('Connection error while updating password.');
    } finally {
      setPasswordUpdating(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-stone-400">Loading settings...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <span className="text-xs font-semibold text-stone-400">Blog Configuration</span>
      </div>

      <header className="space-y-1">
        <h1 className="text-2xl font-serif font-black text-slate-900 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-blue-600" />
          <span>Site & Author Settings</span>
        </h1>
        <p className="text-xs text-stone-500">
          Customize your blog identity, author profile, and manage admin security credentials.
        </p>
      </header>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200/90 p-8 shadow-sm space-y-6">
        {/* Blog Identity */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b pb-2">
            Blog Identity
          </h2>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
              Site Title
            </label>
            <input
              type="text"
              required
              value={formData.siteTitle}
              onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
              className="w-full text-sm border border-stone-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
              Tagline / Subheading
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full text-sm border border-stone-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Author Profile */}
        <div className="space-y-4 pt-4 border-t border-stone-100">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b pb-2">
            Author Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Author Name
              </label>
              <input
                type="text"
                required
                value={formData.authorName}
                onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                className="w-full text-sm border border-stone-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Author Notification Email
              </label>
              <input
                type="email"
                required
                value={formData.authorEmail}
                onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
                className="w-full text-sm border border-stone-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
              Author Biography
            </label>
            <textarea
              rows={3}
              value={formData.authorBio}
              onChange={(e) => setFormData({ ...formData, authorBio: e.target.value })}
              className="w-full text-sm border border-stone-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Admin Password Security Section */}
        <div className="space-y-4 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-2 border-b pb-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Admin Password & Security
            </h2>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Current Password Status
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-xs tracking-widest text-slate-800 bg-white px-2.5 py-1 rounded-md border border-stone-300">
                  ••••••••••••
                </span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Protected
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowPasswordModal(true);
                setPasswordError('');
                setPasswordSuccess('');
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-slate-800 text-xs font-semibold shadow-sm transition-colors"
            >
              <Key className="w-3.5 h-3.5 text-blue-600" />
              <span>Change Admin Password</span>
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-200">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Password Change Dialog Box / Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Change Admin Password</h3>
                  <p className="text-xs text-stone-500">Update your secret password for author access.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              {passwordError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full text-sm border border-stone-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="At least 4 characters"
                  className="w-full text-sm border border-stone-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Re-type new password"
                  className="w-full text-sm border border-stone-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 text-xs font-semibold hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordUpdating}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  {passwordUpdating ? 'Updating...' : 'Save New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
