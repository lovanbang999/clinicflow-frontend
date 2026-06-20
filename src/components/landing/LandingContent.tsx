import { Hero } from './HeroSection';
import { Features } from './FeaturesSection';
import { Specialists } from './SpecialistsSection';
import { HowItWorks } from './HowItWorksSection';
import { Services } from './ServicesSection';
import { CTA } from './CTASection';
import { ContactInfo } from './ContactInfoSection';

export function LandingContent() {
  return (
    <>
      <Hero />
      <Features />
      <Specialists />
      <HowItWorks />
      <Services />
      <CTA />
      <ContactInfo />
    </>
  );
}
