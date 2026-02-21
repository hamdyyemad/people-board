import { type TabConfig } from "@/frontend_lib/types";

import { FileText, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/frontend_lib/components/ui/card";
import { Button } from "@/frontend_lib/components/ui/button";
import { TabEngine } from "@/frontend_lib/components/shared/tabs/tab-engine";

export default function ProfileOverviewPage() {
  const profileTabs: TabConfig[] = [
    {
      value: "activities",
      label: "Activities",
      component: <InfoCard title="Activities" description="Recent activity and updates." content="No recent activities." />
    },
    {
      value: "profile",
      label: "Profile",
      component: <InfoCard title="Profile Details" description="Personal and employment info." content="Edit profile details here." />
    },
    {
      value: "leave",
      label: "Leave",
      component: <InfoCard title="Leave" description="Balance and requests." content="Leave balance history." />
    },
    {
      value: "attendance",
      label: "Attendance",
      component: <InfoCard title="Attendance" description="Check-in history." content="Attendance records." />
    },
    {
      value: "files",
      label: "Files",
      component: <FilesTab />
    },
  ];

  return (
    <div className="w-full px-1">
      <TabEngine tabs={profileTabs} defaultValue="activities" />
    </div>
  );
}

// A reusable wrapper for simple info cards
const InfoCard = ({ title, description, content }: { title: string, description: string, content: string }) => (
  <Card>
    <CardHeader>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardHeader>
    <CardContent className="text-sm text-muted-foreground">{content}</CardContent>
  </Card>
);

const FilesTab = () => {
  const personalFiles = [
    { name: "Medical File.pdf", updated: "14-Sep-2024" },
    { name: "Identification Copy", updated: "17-Aug-2024" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h2 className="text-lg font-semibold">Personal Uploads</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">View all</Button>
            <Button size="sm"><User className="mr-1 h-4 w-4" />Add</Button>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {personalFiles.map((file) => (
              <li key={file.name} className="flex items-center gap-3 rounded-md border p-3 hover:bg-muted/50">
                <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">Updated on {file.updated}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

