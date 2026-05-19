"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  const handleSubmit = async () => {
    setError("");

    if (newPassword.length < 6) {
      setError(t("profile.passwordMinLength"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("profile.passwordMismatch"));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/profile/password", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t("profile.passwordChangeError"));
      }

      toast({ title: t("common.success"), description: t("profile.passwordChanged") });
      handleOpenChange(false);
    } catch (e: any) {
      setError(e.message || t("profile.passwordChangeError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t("profile.changePassword")}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
            {t("profile.passwordMinLength")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t("profile.currentPassword")}
            </Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border-none h-11 text-slate-900 dark:text-slate-100 focus-visible:ring-blue-500 focus-visible:ring-2"
              autoComplete="current-password"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t("profile.newPassword")}
            </Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border-none h-11 text-slate-900 dark:text-slate-100 focus-visible:ring-blue-500 focus-visible:ring-2"
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t("profile.confirmNewPassword")}
            </Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border-none h-11 text-slate-900 dark:text-slate-100 focus-visible:ring-blue-500 focus-visible:ring-2"
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 font-medium">{error}</p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
            className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-200"
          >
            {isSubmitting ? t("profile.changingPassword") : t("profile.changePassword")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
