"use client";

import { useEffect, useState } from "react";
import { Badge } from "@agentops/ui";


import { UserButton, SignInButton, useAuth } from "@clerk/nextjs";

export function Topbar() {
  const [updatedAt, setUpdatedAt] = useState("--:--");
  const { isSignedIn } = useAuth();

  useEffect(() => {
    setUpdatedAt(new Date().toISOString().slice(11, 16));
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-base-600 bg-base-900/80 px-6 py-4 backdrop-blur">
      <div>
        <h1 className="font-display text-lg text-ink-100">Overview</h1>
        <p className="text-xs text-ink-500">production · updated {updatedAt} UTC</p>
      </div>
      <div className="flex items-center gap-3">
        <Badge tone="signal" dot>
          Ingest live
        </Badge>
        {isSignedIn ? (
          <UserButton />
        ) : (
          <SignInButton mode="modal">
            <button className="rounded border border-signal/30 bg-signal/10 px-3 py-1.5 text-sm text-signal hover:bg-signal/20 cursor-pointer">
              Sign in
            </button>
          </SignInButton>
        )}
      </div>
    </header>
  );
}


