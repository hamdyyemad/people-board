import { Card, CardContent, CardHeader } from "@/frontend_lib/components/ui/card";

export default function ProfileAttendancePage() {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Attendance</h2>
        <p className="text-sm text-muted-foreground">Check-in history and reports.</p>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Attendance records.
      </CardContent>
    </Card>
  );
}
