import { Card, CardContent, CardHeader } from "@/frontend_lib/components/ui/card";

export default function ProfileDashboardPage() {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Key metrics.</p>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">Content.</CardContent>
    </Card>
  );
}
