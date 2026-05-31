import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../../../components/Button/Button";

const HeroSection = () => {
  const navigate = useNavigate();

  const bars = [35, 55, 42, 78, 60, 90, 72];

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#FAF7F4] pt-28 pb-16 px-6 md:px-12">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#FAF7F4]" />

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-[#C4956A]/10 rounded-full blur-3xl" />

        {/* Mesh Lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20"
          viewBox="0 0 1400 900"
          preserveAspectRatio="none"
        >
          {[...Array(18)].map((_, i) => (
            <path
              key={i}
              d={`M -100 ${250 + i * 35}
              Q 700 ${100 + i * 10}
              1500 ${250 + i * 35}`}
              fill="none"
              stroke="#C4956A"
              strokeWidth="1"
            />
          ))}
        </svg>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT SIDE */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-[#E8DED4] rounded-full px-4 py-2 mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />

              <span className="text-sm text-[#6B6B6B]">
                Trusted by 50+ gyms
              </span>
            </div>

            {/* Heading */}
            <h1
              className="text-5xl md:text-7xl leading-[0.95] text-[#1C1C1C]"
              style={{
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Run Your Entire Gym
              <br />
              From One
              <span className="text-[#C4956A]">
                {" "}
                Dashboard
              </span>
            </h1>

            {/* Description */}
            <p className="mt-8 text-lg leading-relaxed text-[#6B6B6B] max-w-xl">
              Manage members, subscriptions, payments, attendance and
              renewals without spreadsheets, WhatsApp groups or manual
              tracking.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 mt-10">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate("/register-gym")}
              >
                Start Free Trial
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                Explore Features
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-10 mt-14">
              <div>
                <h3 className="text-3xl font-bold text-[#1C1C1C]">
                  50+
                </h3>
                <p className="text-[#6B6B6B]">
                  Gyms
                </p>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-[#1C1C1C]">
                  12K+
                </h3>
                <p className="text-[#6B6B6B]">
                  Members
                </p>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-[#1C1C1C]">
                  ₹1Cr+
                </h3>
                <p className="text-[#6B6B6B]">
                  Revenue Managed
                </p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative h-[650px]"
          >
            {/* Main Dashboard */}
            <div className="absolute top-0 left-0 w-full max-w-[500px] bg-white rounded-[32px] border border-[#ECE4DC] shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="border-b border-[#F0E7DF] p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-[#1C1C1C]">
                    GymRat Analytics
                  </h3>

                  <p className="text-xs text-[#6B6B6B]">
                    Monthly Overview
                  </p>
                </div>

                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#E7DED6]" />
                  <div className="w-3 h-3 rounded-full bg-[#E7DED6]" />
                  <div className="w-3 h-3 rounded-full bg-[#E7DED6]" />
                </div>
              </div>

              <div className="p-6">
                {/* Revenue Chart */}
                <div className="bg-[#F7F2EE] rounded-3xl p-5">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <p className="text-sm text-[#6B6B6B]">
                        Revenue Growth
                      </p>

                      <h3 className="text-3xl font-bold text-[#1C1C1C]">
                        ₹84,000
                      </h3>
                    </div>

                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                      +18%
                    </span>
                  </div>

                  <div className="flex items-end gap-3 h-40">
                    {bars.map((height, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{
                          height: `${height}%`,
                        }}
                        transition={{
                          delay: i * 0.1,
                        }}
                        className="flex-1 bg-[#C4956A] rounded-t-xl"
                      />
                    ))}
                  </div>
                </div>

                {/* Bottom Cards */}
                <div className="grid grid-cols-2 gap-4 mt-5">
                  <div className="bg-[#FAF7F4] rounded-2xl p-4">
                    <p className="text-xs text-[#6B6B6B]">
                      Active Members
                    </p>

                    <h3 className="text-3xl font-bold mt-1 text-[#1C1C1C]">
                      1,240
                    </h3>
                  </div>

                  <div className="bg-[#FAF7F4] rounded-2xl p-4">
                    <p className="text-xs text-[#6B6B6B]">
                      Attendance
                    </p>

                    <h3 className="text-3xl font-bold mt-1 text-[#1C1C1C]">
                      92%
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Revenue */}
            <motion.div
              animate={{
                y: [-8, 8, -8],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
              className="absolute -left-10 top-[300px] bg-[#C4956A] text-white rounded-3xl p-5 shadow-xl w-[220px]"
            >
              <p className="text-sm opacity-80">
                Monthly Revenue
              </p>

              <h3
                className="text-4xl font-bold mt-2"
                style={{
                  fontFamily:
                    "'Playfair Display', serif",
                }}
              >
                ₹84K
              </h3>
            </motion.div>

            {/* Floating Renewals */}
            <motion.div
              animate={{
                y: [8, -8, 8],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
              className="absolute right-0 top-20 bg-[#1C1C1C] text-white rounded-3xl p-5 shadow-xl w-[220px]"
            >
              <p className="text-sm opacity-80">
                Renewals Due
              </p>

              <h3 className="text-4xl font-bold mt-2">
                12
              </h3>
            </motion.div>

            <motion.div
              animate={{
                y: [-5, 5, -5],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
              }}
              className="absolute right-0 bottom-10 bg-white border border-[#ECE4DC] rounded-3xl shadow-xl p-5 w-[280px]"
            >
              <h4 className="font-semibold text-[#1C1C1C] mb-4">
                Recent Members
              </h4>

              {[
                "Rahul Sharma",
                "Amit Patel",
                "Rohit Verma",
              ].map((member) => (
                <div
                  key={member}
                  className="flex items-center justify-between py-3 border-b border-[#F0E8E0] last:border-0"
                >
                  <span className="text-sm font-medium text-[#1C1C1C]">
                    {member}
                  </span>

                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    Active
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <div className="mt-24 border-t border-[#ECE4DC] pt-5">
          <p className="text-center text-[#6B6B6B] text-sm mb-8">
            Trusted by growing gyms across India
          </p>

          <div className="flex flex-wrap justify-center gap-12">
            {[
              "POWERHOUSE",
              "FITZONE",
              "IRON TEMPLE",
              "ELITE FITNESS",
              "MUSCLE FACTORY",
            ].map((gym) => (
              <span
                key={gym}
                className="text-xl font-semibold text-[#A39080]"
              >
                {gym}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;