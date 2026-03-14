'use client';

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
      <style dangerouslySetInnerHTML={{__html: `
        .shimmer-badge {
            background: linear-gradient(90deg, rgba(19,146,236,0.05) 0%, rgba(19,146,236,0.15) 50%, rgba(19,146,236,0.05) 100%);
            background-size: 200% 100%;
            animation: shimmer 3s infinite linear;
        }
        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        .text-gradient {
            background: linear-gradient(135deg, #1392ec 0%, #0066FF 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
      `}} />

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
