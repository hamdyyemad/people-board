export default function HRDashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-muted/50 p-6">
          <h3 className="text-lg font-semibold mb-2">Total Employees</h3>
          <p className="text-3xl font-bold text-primary">248</p>
          <p className="text-sm text-muted-foreground mt-1">
            +12 from last month
          </p>
        </div>
        <div className="rounded-xl bg-muted/50 p-6">
          <h3 className="text-lg font-semibold mb-2">On Leave Today</h3>
          <p className="text-3xl font-bold text-primary">15</p>
          <p className="text-sm text-muted-foreground mt-1">
            3 pending approvals
          </p>
        </div>
        <div className="rounded-xl bg-muted/50 p-6">
          <h3 className="text-lg font-semibold mb-2">Open Positions</h3>
          <p className="text-3xl font-bold text-primary">8</p>
          <p className="text-sm text-muted-foreground mt-1">
            2 closing this week
          </p>
        </div>
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 p-6">
        <h2 className="text-xl font-semibold mb-4">HR Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to the HR management portal. Here you can manage employees,
          track attendance, approve leave requests, and more.
        </p>
      </div>
    </div>
  );
}
