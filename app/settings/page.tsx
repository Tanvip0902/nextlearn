"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/hooks/useSettings";

export default function SettingsPage() {
  const { settings, loading, saveSettings } = useSettings();
  const [form, setForm] = useState({ name: "", email: "" });

  useEffect(() => {
    if (settings) {
      setForm({ name: settings.name || "", email: settings.email || "" });
    }
  }, [settings]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Profile Settings</h1>

      <div>
        <label className="text-sm font-medium">Name</label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Email</label>
        <Input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>

      <Button onClick={() => saveSettings(form)}>Save Changes</Button>
    </div>
  );
}
