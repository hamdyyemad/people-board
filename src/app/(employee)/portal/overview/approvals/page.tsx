import { Card, CardContent, CardHeader } from "@/frontend_lib/components/ui/card";

export default function ProfileApprovalsPage() {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Approvals</h2>
        <p className="text-sm text-muted-foreground">Pending and past approvals.</p>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">No pending approvals.</CardContent>
    </Card>
  );
}
