import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { SearchSection } from '@/components/home/SearchSection';
import { HowItWorks } from '@/components/home/HowItWorks';
import { SocialProof } from '@/components/home/SocialProof';
import { CtaSection } from '@/components/home/CtaSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-main">
      <Navbar />
      <HeroSection />
      <SearchSection />
      <HowItWorks />
      <SocialProof />
      <CtaSection />
      <Footer />
    </div>
  );
}
