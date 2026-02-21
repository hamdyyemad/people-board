import { Card, CardContent, CardHeader } from "@/frontend_lib/components/ui/card";

export default function ProfileCareerPage() {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Career History</h2>
        <p className="text-sm text-muted-foreground">Roles and milestones.</p>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">Career timeline.</CardContent>
    </Card>
  );
}
