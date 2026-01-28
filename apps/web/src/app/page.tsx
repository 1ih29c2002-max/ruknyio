import dynamic from 'next/dynamic';
import { Header } from "../components/landing/header";
import { Hero } from "../components/landing/hero";

// Lazy load non-critical sections for better LCP
const FeaturesSection = dynamic(() => import("../components/landing/features-enhanced").then(mod => ({ default: mod.FeaturesSection })), {
  loading: () => <div className="min-h-[400px] w-full animate-pulse bg-muted/20" />,
});

const WhyEnhanced = dynamic(() => import("../components/landing/why-enhanced").then(mod => ({ default: mod.WhyEnhanced })), {
  loading: () => <div className="min-h-[400px] w-full animate-pulse bg-muted/20" />,
});

const TestimonialsSection = dynamic(() => import("../components/landing/testimonials").then(mod => ({ default: mod.TestimonialsSection })), {
  loading: () => <div className="min-h-[400px] w-full animate-pulse bg-muted/20" />,
});

const Footer = dynamic(() => import("../components/landing/footer").then(mod => ({ default: mod.Footer })), {
  loading: () => <div className="min-h-[200px] w-full animate-pulse bg-muted/20" />,
});

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <FeaturesSection />
      <WhyEnhanced />
      <TestimonialsSection />
      <Footer />
    </div>
  );
}
