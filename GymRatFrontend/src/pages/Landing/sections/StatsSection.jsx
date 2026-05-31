import { motion } from 'framer-motion';

const stats = [
  {
    value: '500+',
    label: 'Members Managed',
    description: 'Active gym members tracked',
  },
  {
    value: '50+',
    label: 'Gyms Registered',
    description: 'Growing across India',
  },
  {
    value: '99.9%',
    label: 'System Uptime',
    description: 'Reliable cloud infrastructure',
  },
  {
    value: '24/7',
    label: 'Automations Running',
    description: 'Attendance & renewal reminders',
  },
];

const StatsSection = () => {
  return (
    <section className="px-8 md:px-16  bg-[#FAF7F4]">
      <div className="max-w-7xl mx-auto">

        {/* Card */}
        <div className="relative overflow-hidden rounded-[32px] bg-[#1C1C1C] p-10 md:p-14">
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#C4956A]/10 blur-3xl rounded-full" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 blur-3xl rounded-full" />

          <div className="relative z-10">
            <div className="text-center mb-12">
              <p className="text-[#C4956A] uppercase tracking-[0.3em] text-xs mb-3">
                Trusted Platform
              </p>

              <h2
                className="text-white text-3xl md:text-4xl font-bold"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Built for Modern Gym Management
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 text-center"
                >
                  <p
                    className="text-4xl md:text-5xl font-black text-white mb-3"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {stat.value}
                  </p>

                  <p className="text-white font-medium mb-2">
                    {stat.label}
                  </p>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    {stat.description}
                  </p>
                </motion.div>
              ))}

            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default StatsSection;