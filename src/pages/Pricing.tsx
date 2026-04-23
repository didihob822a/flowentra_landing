import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Pricing from "@/components/landing/Pricing";
import ComparisonTable from "@/components/landing/ComparisonTable";
import CTABanner from "@/components/landing/CTABanner";
import EditableSection from "@/components/landing/EditableSection";

const PricingPage = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[20%] -left-40 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[140px]" />
        <div className="absolute top-[55%] -right-40 w-[700px] h-[700px] rounded-full bg-accent/8 blur-[160px]" />
      </div>

      <EditableSection sectionKey="nav" label="Nav">
        <Navbar />
      </EditableSection>

      <div className="pt-20">
        <EditableSection sectionKey="pricing" label="Pricing">
          <Pricing />
        </EditableSection>
        <EditableSection sectionKey="comparisonTable" label="Comparison">
          <ComparisonTable />
        </EditableSection>
        <EditableSection sectionKey="ctaBanner" label="CTA">
          <CTABanner />
        </EditableSection>
      </div>

      <EditableSection sectionKey="footer" label="Footer">
        <Footer />
      </EditableSection>
    </div>
  );
};

export default PricingPage;
