import { Card, CardContent, CardHeader } from "@/frontend_lib/components/ui/card";

export default function ProfileLeavePage() {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Leave</h2>
        <p className="text-sm text-muted-foreground">Balance and leave requests.</p>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">Leave balance and history.</CardContent>
    </Card>
  );
}
