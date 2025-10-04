export function BrandPanel() {
  return (
    <div className="hidden bg-gradient-to-br from-[#0d4d4d] to-[#0a5c5c] lg:flex items-center justify-center p-12 relative overflow-hidden">
      <div className="max-w-lg w-full space-y-8 text-white relative z-10">
        <MainHeading />
        <Testimonial />
        <CompaniesSection />
      </div>

      <LightEffect />
      <BackgroundDecoration />
    </div>
  );
}

// Main Heading Component
function MainHeading() {
  return (
    <h1 className="text-5xl font-normal leading-tight">
      Revolutionize HR with Smarter Automation
    </h1>
  );
}

// Testimonial Component
function Testimonial() {
  return (
    <div className="space-y-6">
      <div className="relative">
        <svg
          className="absolute -top-6 -left-6 w-12 h-12 text-white/40"
          fill="currentColor"
          viewBox="0 0 32 32"
        >
          <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-2.2 1.8-4 4-4V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-2.2 1.8-4 4-4V8z" />
        </svg>
        <p className="text-lg leading-relaxed pl-8">
          &quot;PeopleBoard has completely transformed our HR process. It&apos;s
          reliable, efficient, and ensures our operations are always
          top-notch.&quot;
        </p>
      </div>

      {/* Testimonial Author */}
      <div className="flex items-center space-x-3 pl-8">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-sm font-semibold">
          JD
        </div>
        <div>
          <p className="font-medium">John Doe</p>
          <p className="text-sm text-white/80">HR Director at TechCorp</p>
        </div>
      </div>
    </div>
  );
}

// Companies Section Component
const companies = [
  "Microsoft",
  "Google",
  "Amazon",
  "Apple",
  "Meta",
  "Netflix",
  "Spotify",
  "Adobe",
  "Salesforce",
  "Slack",
  "Zoom",
  "Atlassian",
];

function CompaniesSection() {
  return (
    <div className="pt-8 space-y-4">
      <div className="flex items-center space-x-4">
        <p className="text-xs font-semibold tracking-wider uppercase text-white/80">
          TRUSTED BY 1K+ COMPANIES
        </p>
        <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
      </div>

      <div className="relative overflow-hidden">
        <div className="flex animate-scroll space-x-8 opacity-70">
          {/* First set of companies */}
          {companies.map((company, index) => (
            <div
              key={`first-${index}`}
              className="text-white/90 font-semibold text-sm whitespace-nowrap flex-shrink-0"
            >
              {company}
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {companies.map((company, index) => (
            <div
              key={`second-${index}`}
              className="text-white/90 font-semibold text-sm whitespace-nowrap flex-shrink-0"
            >
              {company}
            </div>
          ))}
        </div>
      </div>
    </div>
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
