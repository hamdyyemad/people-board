import { Card, CardContent, CardHeader } from "@/frontend_lib/components/ui/card";

export default function ProfileActivitiesPage() {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Activities</h2>
        <p className="text-sm text-muted-foreground">Recent updates.</p>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">None.</CardContent>
    </Card>
  );
}
