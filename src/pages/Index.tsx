import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import TrustedBy from "@/components/landing/TrustedBy";
import Features from "@/components/landing/Features";
import ProductShowcase from "@/components/landing/ProductShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import Metrics from "@/components/landing/Metrics";
import IndustryVerticals from "@/components/landing/IndustryVerticals";
import IntegrationsShowcase from "@/components/landing/IntegrationsShowcase";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import ContactSection from "@/components/landing/ContactSection";
import CTABanner from "@/components/landing/CTABanner";
import Footer from "@/components/landing/Footer";
import EditableSection from "@/components/landing/EditableSection";
import LoadingScreen from "@/components/LoadingScreen";
import SEO from "@/components/SEO";
import { useState } from "react";

const Index = () => {
  const [showLoader] = useState(() => {
    if (typeof window === "undefined") return false;
    const seen = sessionStorage.getItem("flowentra:loader-seen");
    if (seen) return false;
    sessionStorage.setItem("flowentra:loader-seen", "1");
    return true;
  });

  return (
    <div className="min-h-screen relative overflow-hidden">
      <SEO
        title="Flowentra — All-in-One Business Management Platform"
        description="Unify CRM, workflows, analytics and AI in one platform. Stop juggling tools and focus on growing your business with Flowentra."
        keywords="CRM, business management, workflow automation, analytics, AI, all-in-one platform"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Flowentra",
          url: "https://flowentra.com/",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://flowentra.com/?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }}
      />
      {showLoader && <LoadingScreen />}
      {/* Ambient brand-color lights — subtle, wash the entire page */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[20%] -left-40 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[140px]" />
        <div className="absolute top-[55%] -right-40 w-[700px] h-[700px] rounded-full bg-accent/8 blur-[160px]" />
        <div className="absolute top-[85%] left-1/4 w-[600px] h-[500px] rounded-full bg-primary/6 blur-[140px]" />
      </div>

      <EditableSection sectionKey="nav" label="Nav">
        <Navbar />
      </EditableSection>
      <EditableSection sectionKey="hero" label="Hero">
        <Hero />
      </EditableSection>
      <EditableSection sectionKey="trustedBy" label="Trusted By">
        <TrustedBy />
      </EditableSection>
      <EditableSection sectionKey="features" label="Features">
        <Features />
      </EditableSection>
      <EditableSection sectionKey="productShowcase" label="Showcase">
        <ProductShowcase />
      </EditableSection>
      <EditableSection sectionKey="howItWorks" label="Steps">
        <HowItWorks />
      </EditableSection>
      <EditableSection sectionKey="metrics" label="Metrics">
        <Metrics />
      </EditableSection>
      <EditableSection sectionKey="industryVerticals" label="Industries">
        <IndustryVerticals />
      </EditableSection>
      <EditableSection sectionKey="integrations" label="Integrations">
        <IntegrationsShowcase />
      </EditableSection>
      <EditableSection sectionKey="testimonials" label="Testimonials">
        <Testimonials />
      </EditableSection>
      <EditableSection sectionKey="faq" label="FAQ">
        <FAQ />
      </EditableSection>
      <EditableSection sectionKey="contact" label="Contact">
        <ContactSection />
      </EditableSection>
      <EditableSection sectionKey="ctaBanner" label="CTA">
        <CTABanner />
      </EditableSection>
      <EditableSection sectionKey="footer" label="Footer">
        <Footer />
      </EditableSection>
    </div>
  );
};

export default Index;
