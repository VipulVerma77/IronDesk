import {
  Building2,
  Users,
  CreditCard,
  ClipboardCheck,
} from "lucide-react";

const steps = [
  {
    icon: Building2,
    number: "01",
    title: "Create Your Gym",
    description: "Set up your gym profile and get your management dashboard.",
  },
  {
    icon: Users,
    number: "02",
    title: "Add Members",
    description: "Register members or allow self-registration from your page.",
  },
  {
    icon: CreditCard,
    number: "03",
    title: "Collect Payments",
    description: "Assign plans and track subscription payments easily.",
  },
  {
    icon: ClipboardCheck,
    number: "04",
    title: "Track Attendance",
    description: "Monitor daily attendance and member activity.",
  },
];

const HowItWorksSection = () => {
  return (
    <section
      id="howitworks"
      className="relative px-8 md:px-16 py-10 overflow-hidden bg-[#FAF7F4]"
    >

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Heading */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <p className="uppercase tracking-[0.35em] text-xl font-semibold text-[#C4956A] mb-4">
            Process
          </p>

          <h2
            className="text-5xl md:text-5xl text-[#2A1F1A] mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Start Managing Your Gym In Minutes
          </h2>

          <p className="text-[#6B6B6B] leading-relaxed">
            Everything from onboarding members to collecting payments and
            tracking attendance happens in one streamlined workflow.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="hidden lg:block absolute top-10 left-0 right-0 h-px bg-[#E7DDD2]" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div key={step.number} className="relative">
                  {/* Top Circle */}
                  <div className="hidden lg:flex justify-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-white border border-[#E7DDD2] flex items-center justify-center shadow-sm">
                      <Icon
                        size={28}
                        className="text-[#C4956A]"
                      />
                    </div>
                  </div>

                  {/* Card */}
                  <div className="bg-white rounded-[32px] border border-[#EFE8E0] p-6 hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                    <span
                      className="text-4xl text-[#C4956A]"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                      }}
                    >
                      {step.number}
                    </span>

                    <h3
                      className="mt-4 text-xl text-[#2A1F1A]"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                      }}
                    >
                      {step.title}
                    </h3>

                    <p className="mt-3 text-[#6B6B6B] text-sm leading-relaxed">
                      {step.description}
                    </p>

                    {/* Fake Product Preview */}
                    <div className="mt-6 bg-[#F5F0EB] rounded-2xl p-4">
                      <div className="bg-white rounded-xl p-3 shadow-sm">
                        <div className="h-2 bg-[#E5DDD5] rounded-full w-1/2 mb-2" />
                        <div className="h-2 bg-[#E5DDD5] rounded-full w-3/4 mb-2" />
                        <div className="h-2 bg-[#E5DDD5] rounded-full w-2/3" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Dashboard Showcase */}
        <div className="mt-20">
          <div className="bg-[#1C1C1C] rounded-[40px] p-10 md:p-14 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#C4956A]/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <p className="text-[#C4956A] uppercase tracking-[0.25em] text-xs mb-4">
                Result
              </p>

              <h3
                className="text-4xl md:text-5xl mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                One Dashboard.
                <br />
                Complete Control.
              </h3>

              <p className="text-white/70 max-w-xl">
                Manage members, payments, subscriptions and attendance from a
                single modern dashboard designed specifically for gym owners.
              </p>

              {/* Dashboard Mock */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                <div className="bg-white/5 rounded-2xl p-5">
                  <p className="text-white/60 text-sm">Members</p>
                  <p className="text-3xl font-bold mt-2">1,240</p>
                </div>

                <div className="bg-white/5 rounded-2xl p-5">
                  <p className="text-white/60 text-sm">Revenue</p>
                  <p className="text-3xl font-bold mt-2">₹84K</p>
                </div>

                <div className="bg-white/5 rounded-2xl p-5">
                  <p className="text-white/60 text-sm">Attendance</p>
                  <p className="text-3xl font-bold mt-2">98</p>
                </div>

                <div className="bg-white/5 rounded-2xl p-5">
                  <p className="text-white/60 text-sm">Expiring</p>
                  <p className="text-3xl font-bold mt-2">12</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;