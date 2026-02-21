import { Card, CardContent, CardHeader } from "@/frontend_lib/components/ui/card";
import { Button } from "@/frontend_lib/components/ui/button";
import { FileText, User } from "lucide-react";

const personalFiles = [
  { name: "Medical File.pdf", updated: "14-Sep-2024" },
  { name: "Identification Copy", updated: "17-Aug-2024" },
  { name: "Health Insurance.pdf", updated: "17-Aug-2024" },
];

export default function ProfileFilesPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h2 className="text-lg font-semibold">Personal Uploads</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">View all</Button>
            <Button size="sm"><User className="mr-1 h-4 w-4" /> Add</Button>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {personalFiles.map((file) => (
              <li
                key={file.name}
                className="flex items-center gap-3 rounded-md border border-border p-3 hover:bg-muted/50"
              >
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
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Shared with Me</h2>
          <p className="text-sm text-muted-foreground">Files shared by others.</p>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No shared files.
        </CardContent>
      </Card>
    </div>
  );
}
