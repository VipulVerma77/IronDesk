import { useNavigate } from 'react-router-dom';
import Button from '../../../components/Button/Button';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="px-8 md:px-16 py-16 ">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#1C1C1C] rounded-3xl px-8 md:px-16 py-16 flex flex-col md:flex-row items-center justify-between gap-8">

          {/* Left */}
          <div className="flex flex-col gap-4 max-w-lg">
            <h2
              className="text-4xl md:text-5xl font-black text-white leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              READY TO MANAGE
              <br />
              YOUR GYM?
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Join gyms already using IronDesk to manage members,
              subscriptions and attendance — all in one place.
            </p>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-4 items-center md:items-end">

            {/* Avatar stack */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {['A', 'B', 'C', 'D'].map((letter) => (
                  <div
                    key={letter}
                    className="w-10 h-10 rounded-full bg-[#C4956A] border-2 border-[#1C1C1C] flex items-center justify-center text-white text-sm font-bold"
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <p className="text-white/60 text-sm">50+ gyms registered</p>
            </div>

            <div className="flex gap-4">
              <Button
                variant="accent"
                size="lg"
                onClick={() => navigate('/register-gym')}
              >
                Register Your Gym
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/login')}
              >
                <span className="text-white border-white">Login</span>
              </Button>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-8 gap-4">
          <p className="text-[#2A1F1A] text-sm">
            © 2026 IronDesk. All rights reserved.
          </p>
          <p className="text-[#6B6B6B] text-sm">
            Built with ASP.NET Core + React
          </p>
        </div>

      </div>
    </section>
  );
};

export default CTASection;