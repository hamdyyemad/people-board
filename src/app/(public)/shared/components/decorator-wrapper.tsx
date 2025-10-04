export function DecoratorWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="hidden bg-gradient-to-br from-[#0d4d4d] to-[#0a5c5c] lg:flex items-center justify-center p-12 relative overflow-hidden">
        {children}
        <LightEffect />
        <BackgroundDecoration />
      </div>
    </>
  );
}

// Light Effect Component
function LightEffect() {
  return (
    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-white/10 via-white/5 to-transparent rounded-full blur-3xl pointer-events-none" />
  );
}

// Background Decoration Component
function BackgroundDecoration() {
  return (
    <div className="absolute inset-0 bg-gradient-to-tr from-primary/60 to-transparent pointer-events-none" />
  );
}
