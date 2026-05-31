import { useNavigate } from 'react-router-dom';
import {
  Users,
  CreditCard,
  ClipboardCheck,
  Building2,
  Zap,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Member Management',
    description:
      'Manage members, statuses, profiles and account access from a single dashboard.',
    featured: true,
  },
  {
    icon: CreditCard,
    title: 'Subscriptions & Payments',
    description:
      'Track plans, payments, renewals and subscription lifecycle effortlessly.',
  },
  {
    icon: ClipboardCheck,
    title: 'Attendance Tracking',
    description:
      'Monitor check-ins, check-outs and member activity in real time.',
  },
  {
    icon: Building2,
    title: 'Multi-Tenant Security',
    description:
      'Every gym operates in a secure isolated environment with complete data separation.',
  },
  {
    icon: Zap,
    title: 'Smart Automation',
    description:
      'Automatic subscription activation, expiry handling and scheduled background tasks.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description:
      'Revenue, attendance, member growth and business insights in one place.',
  },
];

const FeaturesSection = () => {
  const navigate = useNavigate();

  return (
    <section
      id="features"
      className="relative px-8 md:px-16 pt-10 overflow-hidden bg-[#FAF7F4]"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Heading */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div>
            <p className="text-[#C4956A] uppercase tracking-[0.3em] text-xs font-semibold mb-4">
              Features
            </p>

            <h2
              className="text-5xl md:text-6xl font-bold text-[#2A1F1A] leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Everything Your
              <br />
              Gym Needs
            </h2>
          </div>

          <p className="max-w-md text-[#6B6B6B] leading-relaxed">
            Built specifically for gym owners who want to manage memberships,
            subscriptions, attendance and business performance from one modern
            platform.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className={`
                  group
                  rounded-[28px]
                  p-8
                  transition-all
                  duration-300
                  hover:-translate-y-2
                  hover:shadow-2xl
                  border
                  ${
                    feature.featured
                      ? 'lg:col-span-2 bg-[#1C1C1C] border-[#1C1C1C] text-white'
                      : 'bg-white/70 backdrop-blur-sm border-white/60 text-[#2A1F1A]'
                  }
                `}
              >
               <div className='flex justify-between items-center'>
                <span className="text-xs tracking-[0.25em] text-[#C4956A] font-semibold">
                  0{index + 1}
                </span>
                 <div className=" rounded-2xl ">
                  <ArrowRight
                    size={18}
                    className={`transition-transform duration-300 group-hover:translate-x-1 ${
                      feature.featured
                        ? 'text-white/60'
                        : 'text-[#C4956A]'
                    }`}
                  />
                </div>
               </div>

                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mt-6 mb-3 transition-transform duration-300 group-hover:scale-110 ${
                    feature.featured
                      ? 'bg-white/10'
                      : 'bg-[#F5F0EB]'
                  }`}
                >
                  <Icon
                    size={45}
                    strokeWidth={2}
                    className="text-[#C4956A]"
                  />
                </div>

                {/* Title */}
                <h3
                  className="text-2xl font-bold mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {feature.title}
                </h3>

                <p
                  className={`leading-relaxed ${
                    feature.featured
                      ? 'text-white/70'
                      : 'text-[#6B6B6B]'
                  }`}
                >
                  {feature.description}
                </p>

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;