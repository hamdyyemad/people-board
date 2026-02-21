import { Card, CardContent, CardHeader } from "@/frontend_lib/components/ui/card";

export default function ProfileTimesheetsPage() {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Timesheets</h2>
        <p className="text-sm text-muted-foreground">Log and view timesheets.</p>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Timesheet entries.
      </CardContent>
    </Card>
  );
}
