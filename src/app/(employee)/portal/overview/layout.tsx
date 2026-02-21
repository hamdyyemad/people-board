"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/frontend_lib/components/ui/card";
import { Button } from "@/frontend_lib/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/frontend_lib/components/ui/avatar";
import { Clock, LogIn, LogOut } from "lucide-react";

// --- Constants & Data ---
const AVATAR_IMAGE = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";

const EMPLOYEE = {
  id: "ZY198",
  name: "Christine Spalding",
  title: "HR Manager",
  avatar: AVATAR_IMAGE,
  status: "Present" as const,
};

const MANAGER = {
  id: "ZY190",
  name: "Jones Terri",
  avatar: AVATAR_IMAGE,
  status: "Present" as const,
};

const REPORTEES = [
  { id: "ZY204", name: "Randall Gladstone", avatar: AVATAR_IMAGE, status: "Present" as const },
];

// --- Utilities ---
function formatTimer(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")} : ${String(m).padStart(2, "0")} : ${String(s).padStart(2, "0")}`;
}

// --- Main Export ---
export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col gap-6 bg-muted/30 p-4 md:flex-row md:gap-8 md:p-6">
      <aside className="w-full shrink-0 md:w-80 lg:w-96">
        <Card className="relative -mt-16 overflow-hidden border bg-card shadow-lg">
          <CardContent className="p-6">
            <ProfileHeader />
            <AttendanceTimer />
            <OrgHierarchy />
          </CardContent>
        </Card>
      </aside>
      <main className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}

// --- Components ---

/**
 * AttendanceTimer: Isolated state and effect.
 * Only this component re-renders every second.
 */
function AttendanceTimer() {
  const [checkedIn, setCheckedIn] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(7 * 3600 + 26 * 60 + 27);

  useEffect(() => {
    if (!checkedIn) return;
    const id = setInterval(() => setTimerSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(id);
  }, [checkedIn]);

  return (
    <div className="mt-6 rounded-lg border border-border bg-muted/50 p-4">
      <div className="flex items-center justify-center gap-2 text-2xl font-mono tabular-nums text-foreground">
        <Clock className="h-6 w-6 text-muted-foreground" />
        {formatTimer(timerSeconds)}
      </div>
      <Button
        className="mt-3 w-full"
        variant={checkedIn ? "destructive" : "default"}
        onClick={() => setCheckedIn(!checkedIn)}
      >
        {checkedIn ? (
          <><LogOut className="mr-2 h-4 w-4" /> Check-out</>
        ) : (
          <><LogIn className="mr-2 h-4 w-4" /> Check-in</>
        )}
      </Button>
    </div>
  );
}

function ProfileHeader() {
  return (
    <div className="flex flex-col items-center text-center">
      <Avatar className="h-24 w-24 border-4 border-card shadow-md">
        <AvatarImage src={EMPLOYEE.avatar} alt={EMPLOYEE.name} />
        <AvatarFallback className="text-lg">
          {EMPLOYEE.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <p className="mt-3 text-xs font-medium text-muted-foreground">{EMPLOYEE.id}</p>
      <h1 className="mt-0.5 text-lg font-semibold text-foreground">{EMPLOYEE.name}</h1>
      <p className="text-sm text-muted-foreground">{EMPLOYEE.title}</p>
      <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
        {EMPLOYEE.status}
      </span>
    </div>
  );
}

function OrgHierarchy() {
  return (
    <div className="space-y-4 mt-6 border-t border-border pt-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Reporting To</h3>
        <div className="mt-2 flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={MANAGER.avatar} alt={MANAGER.name} />
            <AvatarFallback className="text-xs">{MANAGER.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-medium">{MANAGER.id} - {MANAGER.name}</p>
            <p className="text-xs text-green-600 dark:text-green-400">{MANAGER.status}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h3 className="text-sm font-semibold text-foreground">Reportees</h3>
        <ul className="mt-2 space-y-2">
          {REPORTEES.map((r) => (
            <li key={r.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={r.avatar} alt={r.name} />
                <AvatarFallback className="text-xs">{r.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium">{r.id} - {r.name}</p>
                <p className="text-xs text-green-600 dark:text-green-400">{r.status}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}