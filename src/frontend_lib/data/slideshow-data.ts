interface SlideshowData {
  image: {
    src: string;
    alt: string;
  };
  heading: string;
  testimonial: {
    text: string;
    author: string;
    role: string;
    initials: string;
  };
}

// Function to get translated slideshow data
export function getSlideshowData(t: (key: string) => string): SlideshowData[] {
  return [
    {
      image: {
        src: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        alt: "Team collaboration",
      },
      heading: t("revolutionizeHR"),
      testimonial: {
        text: t("testimonial1"),
        author: t("johnDoe"),
        role: t("hrDirector"),
        initials: "JD",
      },
    },
    {
      image: {
        src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        alt: "Business meeting",
      },
      heading: t("streamlineWorkforce"),
      testimonial: {
        text: t("testimonial2"),
        author: t("sarahJohnson"),
        role: t("vpOperations"),
        initials: "SJ",
      },
    },
    {
      image: {
        src: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        alt: "Office workspace",
      },
      heading: t("empowerTeams"),
      testimonial: {
        text: t("testimonial3"),
        author: t("michaelChen"),
        role: t("headOfPeople"),
        initials: "MC",
      },
    },
    {
      image: {
        src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        alt: "Professional team",
      },
      heading: t("transformHROperations"),
      testimonial: {
        text: t("testimonial4"),
        author: t("emilyRodriguez"),
        role: t("chiefPeopleOfficer"),
        initials: "ER",
      },
    },
  ];
}

// Fallback for non-translated usage (backwards compatibility)
export const slideshowData: SlideshowData[] = [
  {
    image: {
      src: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      alt: "Team collaboration",
    },
    heading: "Revolutionize HR with Smarter Automation",
    testimonial: {
      text: "PeopleBoard has completely transformed our HR process. It's reliable, efficient, and ensures our operations are always top-notch.",
      author: "John Doe",
      role: "HR Director at TechCorp",
      initials: "JD",
    },
  },
  {
    image: {
      src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      alt: "Business meeting",
    },
    heading: "Streamline Your Workforce Management",
    testimonial: {
      text: "The automation features have saved us countless hours. Our team can now focus on strategic initiatives instead of manual processes.",
      author: "Sarah Johnson",
      role: "VP of Operations at InnovateCorp",
      initials: "SJ",
    },
  },
  {
    image: {
      src: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      alt: "Office workspace",
    },
    heading: "Empower Teams with Intelligent Solutions",
    testimonial: {
      text: "The analytics dashboard gives us insights we never had before. We can make data-driven decisions that actually improve our workplace.",
      author: "Michael Chen",
      role: "Head of People at DataFlow",
      initials: "MC",
    },
  },
  {
    image: {
      src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      alt: "Professional team",
    },
    heading: "Transform Your HR Operations Today",
    testimonial: {
      text: "Implementation was seamless and the support team is outstanding. Our employees love the new streamlined experience.",
      author: "Emily Rodriguez",
      role: "Chief People Officer at GrowthTech",
      initials: "ER",
    },
  },
];
