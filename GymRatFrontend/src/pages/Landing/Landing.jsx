import Navbar from '../../components/Navbar/Navbar';
import HeroSection from './sections/HeroSection';
import StatsSection from './sections/StatsSection';
import FeaturesSection from './sections/FeaturesSection';
import HowItWorksSection from './sections/HowItWorksSection';
import CTASection from './sections/CTASection';

const Landing = () => {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #B8C4CC 0%, #C8D4D8 50%, #B0BCC4 100%)' }}>
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
    </div>
  );
};

export default Landing;