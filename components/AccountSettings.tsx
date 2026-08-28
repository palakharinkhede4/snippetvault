"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  plan: string;
  snippetCount: number;
  createdAt: string;
  stripeCurrentPeriodEnd: string | null;
}

export default function AccountSettings({ user }: { user: UserProfile }) {
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Account deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Password criteria check
  const passwordCriteria = [
    { label: "At least 8 characters", met: newPassword.length >= 8 },
    { label: "At least one uppercase letter (A-Z)", met: /[A-Z]/.test(newPassword) },
    { label: "At least one lowercase letter (a-z)", met: /[a-z]/.test(newPassword) },
    { label: "At least one number (0-9)", met: /[0-9]/.test(newPassword) },
    { label: "At least one special character (!@#$%^&*)", met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) },
  ];
  const allCriteriaMet = passwordCriteria.every((c) => c.met);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }

    if (!allCriteriaMet) {
      setPasswordError("Please ensure all new password criteria are met.");
      return;
    }

    if (!passwordsMatch) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      setPasswordLoading(false);

      if (!res.ok) {
        setPasswordError(data.error || "Failed to update password.");
        return;
      }

      setPasswordSuccess("Your password has been changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordLoading(false);
      setPasswordError("Network or server error while changing password.");
    }
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setDeleteError("");

    if (deleteConfirmationText.trim() !== "Delete Account") {
      setDeleteError('Please type exactly "Delete Account" to confirm.');
      return;
    }

    if (!deletePassword) {
      setDeleteError("Please enter your password to confirm deletion.");
      return;
    }

    setDeleteLoading(true);

    try {
      const res = await fetch("/api/user/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmationText: deleteConfirmationText.trim(),
          password: deletePassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setDeleteLoading(false);
        setDeleteError(data.error || "Failed to delete account.");
        return;
      }

      // Successfully deleted — sign out and redirect to login
      await signOut({ callbackUrl: "/login?deleted=1" });
    } catch (err: any) {
      setDeleteLoading(false);
      setDeleteError("Network error while deleting account.");
    }
  }

  return (
    <div className="space-y-8">
      {/* Profile & Plan Details */}
      <div className="rounded-card border border-ink/15 bg-white/50 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-ink/10 pb-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">Signed in as</p>
            <h2 className="mt-1 font-display text-2xl text-ink">{user.email}</h2>
            {user.name && user.name !== user.email && (
              <p className="text-sm text-ink/60">{user.name}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider ${
                user.plan === "pro"
                  ? "bg-teal text-ink shadow-sm"
                  : "bg-ink/10 text-ink/70"
              }`}
            >
              {user.plan} Plan
            </span>
            <Link
              href="/billing"
              className="focus-ring rounded-card border border-ink/20 bg-white px-3 py-1.5 font-mono text-xs text-ink/80 hover:border-ink hover:text-ink transition"
            >
              Manage Plan →
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 text-sm">
          <div className="rounded-card bg-paper/60 p-3.5 border border-ink/5">
            <p className="text-xs text-ink/50 font-mono uppercase">Snippet Storage</p>
            <p className="mt-1 font-display text-lg text-ink">
              {user.plan === "pro"
                ? `${user.snippetCount} Snippets (Unlimited)`
                : `${user.snippetCount} / 5 Snippets`}
            </p>
          </div>
          <div className="rounded-card bg-paper/60 p-3.5 border border-ink/5">
            <p className="text-xs text-ink/50 font-mono uppercase">Member Since</p>
            <p className="mt-1 font-display text-lg text-ink">
              {new Date(user.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="rounded-card border border-ink/15 bg-white/50 p-6 shadow-sm">
        <div className="border-b border-ink/10 pb-4">
          <h2 className="font-display text-xl text-ink">Change Password</h2>
          <p className="mt-1 text-xs text-ink/60">
            Update your account password. Must meet modern security standards.
          </p>
        </div>

        {passwordSuccess && (
          <div className="mt-4 flex items-center gap-2 rounded-card border border-teal/40 bg-teal/15 p-3.5 text-xs text-teal-dark font-medium">
            <span>✓</span>
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="mt-4 flex items-center gap-2 rounded-card border border-rust/30 bg-rust/10 p-3.5 text-xs text-rust font-medium">
            <span>⚠️</span>
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="mt-5 space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-ink/60">
              Current Password
            </label>
            <div className="relative mt-1.5">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
                className="focus-ring w-full rounded-card border border-ink/20 bg-white px-3.5 py-2.5 text-sm pr-16"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-ink/50 hover:text-ink px-1 py-0.5"
              >
                {showCurrentPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-ink/60">
              New Password
            </label>
            <div className="relative mt-1.5">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new strong password"
                required
                className="focus-ring w-full rounded-card border border-ink/20 bg-white px-3.5 py-2.5 text-sm pr-16"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-ink/50 hover:text-ink px-1 py-0.5"
              >
                {showNewPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* Live Password Criteria */}
            {newPassword.length > 0 && (
              <div className="mt-3 rounded-card bg-paper/70 p-3 border border-ink/10 space-y-1.5">
                <p className="text-[11px] font-mono uppercase text-ink/50 font-medium">
                  Password Requirements:
                </p>
                <div className="grid gap-1">
                  {passwordCriteria.map((crit, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs">
                      <span className={crit.met ? "text-teal-dark font-bold" : "text-ink/30"}>
                        {crit.met ? "✓" : "○"}
                      </span>
                      <span className={crit.met ? "text-ink font-medium" : "text-ink/60"}>
                        {crit.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-ink/60">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              className={`focus-ring mt-1.5 w-full rounded-card border bg-white px-3.5 py-2.5 text-sm ${
                confirmPassword.length > 0
                  ? passwordsMatch
                    ? "border-teal"
                    : "border-rust"
                  : "border-ink/20"
              }`}
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="mt-1 text-xs text-rust">Passwords do not match.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={passwordLoading || !allCriteriaMet || !passwordsMatch || !currentPassword}
            className="focus-ring mt-2 rounded-card bg-ink px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-ink-soft disabled:opacity-50"
          >
            {passwordLoading ? "Updating Password…" : "Update Password"}
          </button>
        </form>
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="rounded-card border border-rust/30 bg-rust/[0.03] p-6 shadow-sm">
        <div className="border-b border-rust/20 pb-4">
          <div className="flex items-center gap-2 text-rust">
            <span className="text-base">⚠️</span>
            <h2 className="font-display text-xl font-medium">Danger Zone: Delete Account</h2>
          </div>
          <p className="mt-1.5 text-xs text-ink/70 leading-relaxed">
            Permanently delete your SnippetVault account and all saved snippets. This action is <strong>immediate and irreversible</strong>.
          </p>
        </div>

        {!showDeleteConfirm ? (
          <div className="mt-5 flex items-center justify-between">
            <p className="text-xs text-ink/60">
              Need to close your account? All data will be wiped from our database.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="focus-ring rounded-card border border-rust bg-rust/10 px-4 py-2 font-mono text-xs font-semibold text-rust hover:bg-rust hover:text-white transition"
            >
              Delete Account…
            </button>
          </div>
        ) : (
          <form onSubmit={handleDeleteAccount} className="mt-5 space-y-4 max-w-md bg-white p-5 rounded-card border border-rust/30 shadow-sm">
            <div className="rounded-card bg-rust/10 p-3 text-xs text-rust font-medium">
              ⚠️ Warning: This will immediately delete all your snippets, your profile, and cancel any active subscription.
            </div>

            {deleteError && (
              <div className="rounded-card bg-rust/10 p-3 text-xs text-rust">
                {deleteError}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink/70">
                To confirm, type <span className="font-bold text-rust">"Delete Account"</span>
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder='Type "Delete Account"'
                required
                className="focus-ring mt-1.5 w-full rounded-card border border-ink/20 bg-paper/50 px-3.5 py-2 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink/70">
                Enter your password
              </label>
              <div className="relative mt-1.5">
                <input
                  type={showDeletePassword ? "text" : "password"}
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your current password"
                  required
                  className="focus-ring w-full rounded-card border border-ink/20 bg-paper/50 px-3.5 py-2 text-sm pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowDeletePassword(!showDeletePassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-ink/50 hover:text-ink px-1 py-0.5"
                >
                  {showDeletePassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={
                  deleteLoading ||
                  deleteConfirmationText.trim() !== "Delete Account" ||
                  !deletePassword
                }
                className="focus-ring rounded-card bg-rust px-4 py-2 text-xs font-semibold text-white transition hover:bg-rust-dark disabled:opacity-50"
              >
                {deleteLoading ? "Deleting Account…" : "Permanently Delete Account"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmationText("");
                  setDeletePassword("");
                  setDeleteError("");
                }}
                className="focus-ring rounded-card border border-ink/20 px-3 py-2 text-xs font-medium text-ink/70 hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
