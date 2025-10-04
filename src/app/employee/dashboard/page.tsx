export default function EmployeeDashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-muted/50 p-6">
          <h3 className="text-lg font-semibold mb-2">Leave Balance</h3>
          <p className="text-3xl font-bold text-primary">18</p>
          <p className="text-sm text-muted-foreground mt-1">days remaining</p>
        </div>
        <div className="rounded-xl bg-muted/50 p-6">
          <h3 className="text-lg font-semibold mb-2">Attendance</h3>
          <p className="text-3xl font-bold text-primary">98%</p>
          <p className="text-sm text-muted-foreground mt-1">this month</p>
        </div>
        <div className="rounded-xl bg-muted/50 p-6">
          <h3 className="text-lg font-semibold mb-2">Tasks</h3>
          <p className="text-3xl font-bold text-primary">5</p>
          <p className="text-sm text-muted-foreground mt-1">
            pending completion
          </p>
        </div>
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 p-6">
        <h2 className="text-xl font-semibold mb-4">Employee Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to your employee portal. Here you can view your attendance,
          request leave, update your profile, and more.
        </p>
      </div>
    </div>
  );
}
