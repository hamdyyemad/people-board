export default function Logo({ showText = true }: { showText?: boolean }) {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-foreground text-background text-sm font-bold">
        PB
      </div>
      {showText && <span className="text-lg font-semibold">PeopleBoard</span>}
    </div>
  );
}
