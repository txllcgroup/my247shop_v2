"use client";
import { motion } from "framer-motion";
import Link from 'next/link';
import ClientOnly from "../components/ClientOnly";

const aiFeatures = [
  "Write product descriptions",
  "Suggest better pricing",
  "Recommend categories",
  "Track sales trends",
  "Improve marketing copy",
  "Refine store content"
];

const featureCards = [
  {
    title: "Easy Store Setup",
    description: "Create a professional online store in minutes without technical knowledge.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
    )
  },
  {
    title: "Product Management",
    description: "Add, organize, and manage your products from one simple dashboard.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="9" y1="21" x2="9" y2="9"></line>
      </svg>
    )
  },
  {
    title: "Smart Content Tools",
    description: "Generate product copy, improve store messaging, and create content faster.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>
    )
  },
  {
    title: "Secure Payments",
    description: "Accept customer payments through trusted and secure payment gateways.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
        <line x1="1" y1="10" x2="23" y2="10"></line>
      </svg>
    )
  },
  {
    title: "Sales Insights",
    description: "Track performance with real-time analytics and useful business insights.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
    )
  },
  {
    title: "Mobile-Ready Stores",
    description: "Every My247Shop store works smoothly across mobile, tablet, and desktop.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
        <line x1="12" y1="18" x2="12.01" y2="18"></line>
      </svg>
    )
  }
];

const steps = [
  { num: "1", title: "Create Your Store", desc: "Sign up and set up your online shop in minutes." },
  { num: "2", title: "Add Your Products", desc: "Upload, organize, and showcase your products with ease." },
  { num: "3", title: "Grow Smarter", desc: "Use built-in tools to improve listings, pricing, and marketing." }
];

const categories = [
  "Fashion and apparel",
  "Electronics",
  "Beauty products",
  "Digital products",
  "Handmade goods",
  "Services and bookings"
];

const reasons = [
  "Smart tools for store management",
  "Easy product management",
  "Secure online payments",
  "Useful analytics and insights",
  "Mobile-optimized storefronts",
  "Built for growing businesses"
];

const fadeUpVariant = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function Home() {
  return (
    <ClientOnly>
      <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Navbar */}
      <nav className="w-full bg-white z-50 py-6 absolute top-0">
        <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">
          <div
            className="text-xl font-medium tracking-tight text-black flex items-center gap-2 cursor-pointer"
            onClick={() => (window.location.href = "/")}
          >
            <img src="/my247shop-logo.png" alt="My247Shop Logo" className="h-8 w-auto object-contain" />
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500 font-semibold">
            <button className="hover:text-black transition-colors">Product</button>
            <button className="hover:text-black transition-colors">Company</button>
            <button className="hover:text-black transition-colors">Legal</button>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="/login" className="text-black px-4 py-2 hover:opacity-70 transition-opacity">Log in</Link>
            <Link href="/onboarding" className="bg-black text-white px-5 py-2.5 rounded hover:bg-black/80 transition-colors">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-24 px-6 max-w-[1240px] mx-auto flex flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-[3.5rem] md:text-[5.5rem] font-medium tracking-tight leading-[1.05] max-w-5xl mb-8"
        >
          Your online store, made smarter
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-800 max-w-2xl mb-12 font-semibold leading-relaxed"
        >
          Create your store, add your products, and manage your business with tools designed to help you
          work faster and sell better.
        </motion.p>

        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/onboarding" className="bg-black text-white px-8 py-4 rounded text-sm font-medium hover:bg-black/90 transition-colors text-center">
              Create Your Store
            </Link>
            <Link href="/onboarding" className="bg-white text-black border border-gray-200 px-8 py-4 rounded text-sm font-medium hover:bg-gray-50 transition-colors text-center">
              Start Free
            </Link>
          </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-24 w-full overflow-hidden rounded-lg"
        >
          <img
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=2000"
            alt="Hero interface"
            className="w-full h-[600px] object-cover"
          />
        </motion.div>
      </section>

      {/* A Smarter Way Section */}
      <section className="py-32 px-6 max-w-[1240px] mx-auto text-center border-t border-gray-100">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-4xl mx-auto"
        >
          <motion.h2
            variants={fadeUpVariant}
            className="text-3xl md:text-[3rem] font-medium tracking-tight mb-8 leading-tight"
          >
            A Smarter Way to Run Your Online Store
          </motion.h2>
          <motion.p variants={fadeUpVariant} className="text-xl text-gray-500 font-semibold mb-6">
            My247Shop combines powerful e-commerce tools with smart features to help you run your business
            more effectively.
          </motion.p>
          <motion.p variants={fadeUpVariant} className="text-xl text-gray-500 font-semibold">
            From product management to marketing support, everything works together to make running your
            store easier and faster.
          </motion.p>
        </motion.div>
      </section>

      {/* Tools That Help You Sell Better */}
      <section className="py-32 px-6 max-w-[1240px] mx-auto border-t border-gray-100">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeUpVariant}
              className="text-3xl md:text-[2.75rem] font-medium tracking-tight mb-6 leading-tight"
            >
              Tools That Help You Sell Better
            </motion.h2>
            <motion.p
              variants={fadeUpVariant}
              className="text-gray-500 text-[1.1rem] font-semibold mb-10 leading-relaxed max-w-lg"
            >
              My247Shop helps you manage your store more efficiently with built-in tools that support
              better decisions and faster execution.
            </motion.p>

            <div className="mb-10">
              <motion.p variants={fadeUpVariant} className="font-medium text-black mb-6">
                My247Shop helps you:
              </motion.p>
              <ul className="space-y-4">
                {aiFeatures.map((feature, i) => (
                  <motion.li
                    variants={fadeUpVariant}
                    key={i}
                    className="flex items-center gap-4 text-gray-900 font-semibold text-[1.05rem]"
                  >
                    <span className="w-1.5 h-1.5 bg-black rounded-full block shrink-0" />
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </div>

            <motion.div variants={fadeUpVariant} className="mt-8 pt-6 border-t border-gray-100 max-w-md">
              <p className="font-medium text-black text-lg">
                You stay in control while the platform helps you move faster.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full h-full min-h-[500px] bg-gray-50 overflow-hidden rounded-lg"
          >
            <img
              src="https://images.unsplash.com/photo-1481437156560-3205f6a55735?auto=format&fit=crop&q=80&w=1200"
              alt="Design layout"
              className="w-full h-full object-cover scale-105"
            />
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-[1240px] mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeUpVariant}
              className="text-3xl md:text-[2.75rem] font-medium tracking-tight mb-20 text-center leading-tight"
            >
              Everything You Need to Sell Online
            </motion.h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
              {featureCards.map((card, i) => (
                <motion.div variants={fadeUpVariant} key={i} className="flex flex-col">
                  <div className="mb-6 text-black border-b border-black/10 pb-6 inline-block shrink-0">
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-medium text-black mb-3">{card.title}</h3>
                  <p className="text-gray-500 font-semibold leading-relaxed flex-1">{card.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-32 px-6 max-w-[1240px] mx-auto border-t border-gray-100">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          <motion.h2
            variants={fadeUpVariant}
            className="text-3xl md:text-[2.75rem] font-medium tracking-tight mb-24 text-center leading-tight"
          >
            How My247Shop Works
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-16 lg:gap-24 relative">
            <div className="hidden md:block absolute top-[10%] left-[20%] right-[20%] h-px bg-gray-100 -z-10" />
            {steps.map((step, i) => (
              <motion.div variants={fadeUpVariant} key={i} className="bg-white">
                <div className="text-[4rem] font-medium text-gray-200 mb-6 leading-none">{step.num}.</div>
                <h3 className="text-xl font-medium text-black mb-4">{step.title}</h3>
                <p className="text-gray-500 font-semibold leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Built for Entrepreneurs */}
      <section className="py-32 px-6 max-w-5xl mx-auto border-t border-gray-100">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="text-center"
        >
          <motion.h2
            variants={fadeUpVariant}
            className="text-3xl md:text-[2.75rem] font-medium tracking-tight mb-6 leading-tight"
          >
            Built for Every Kind of Business
          </motion.h2>
          <motion.p variants={fadeUpVariant} className="text-gray-500 text-lg font-semibold mb-14 max-w-2xl mx-auto">
            My247Shop is perfect for businesses selling:
          </motion.p>
          <motion.div variants={fadeUpVariant} className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto mb-16">
            {categories.map((c, i) => (
              <span
                key={i}
                className="px-6 py-3 rounded-full border border-gray-200 text-[0.95rem] font-medium text-black hover:border-black transition-colors cursor-default"
              >
                {c}
              </span>
            ))}
          </motion.div>
          <motion.p variants={fadeUpVariant} className="text-2xl font-medium text-black">
            No matter what you sell, My247Shop helps you sell smarter and grow faster.
          </motion.p>
        </motion.div>
      </section>

      {/* Why Businesses Choose Us */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="flex flex-col items-center"
          >
            <motion.h2
              variants={fadeUpVariant}
              className="text-3xl md:text-[2.75rem] font-medium tracking-tight mb-12 leading-tight"
            >
              Why Businesses Choose My247Shop
            </motion.h2>
            <div className="grid sm:grid-cols-2 gap-x-12 gap-y-6 text-left w-full mb-16">
              {reasons.map((r, i) => (
                <motion.div variants={fadeUpVariant} key={i} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-black rounded-full block shrink-0" />
                  <span className="text-lg font-semibold text-gray-800">{r}</span>
                </motion.div>
              ))}
            </div>
            <motion.p variants={fadeUpVariant} className="text-xl font-medium text-black">
              My247Shop gives you the tools to run your business with confidence and clarity.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-40 bg-black text-white px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="max-w-[800px] mx-auto text-center"
        >
          <motion.h2
            variants={fadeUpVariant}
            className="text-[3rem] md:text-[4.5rem] font-medium tracking-tight mb-8 leading-[1.05]"
          >
            Start Your Store Today
          </motion.h2>
          <motion.p variants={fadeUpVariant} className="text-gray-400 font-semibold text-xl mb-4">
            Join businesses using My247Shop to build and grow their online stores with smarter tools.
          </motion.p>
          <motion.p variants={fadeUpVariant} className="text-gray-400 font-semibold text-xl mb-12">
            Launch your store and start selling today.
          </motion.p>
          <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/onboarding" className="bg-white text-black px-10 py-4 rounded font-medium hover:bg-gray-100 transition-colors text-center">
              Create Your Store
            </Link>
            <Link href="/onboarding" className="bg-transparent text-white border border-white px-10 py-4 rounded font-medium hover:bg-white/10 transition-colors text-center">
              Start Free Trial
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-gray-100/10 bg-white text-[0.95rem] font-semibold text-gray-500">
        <div className="max-w-[1240px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
          <div className="col-span-2">
            <div className="text-xl font-medium tracking-tight text-black flex items-center gap-2 mb-4">
              <img src="/my247shop-logo.png" alt="My247Shop Logo" className="h-8 w-auto object-contain" />
            </div>
            <p className="max-w-[300px] leading-relaxed mb-6">
              My247Shop is a commerce platform designed to help businesses build and manage online stores
              with smarter tools.
            </p>
            <div className="text-sm">© 2026 My247Shop</div>
          </div>

          <div>
            <h4 className="font-bold text-black mb-4 uppercase text-xs tracking-wider">Product</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="hover:text-black">
                  Store Builder
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  Payments
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  Analytics
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  Marketing Tools
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-black mb-4 uppercase text-xs tracking-wider">Company</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="hover:text-black">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  Support
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-black mb-4 uppercase text-xs tracking-wider">Legal</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="hover:text-black">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
      </div>
    </ClientOnly>
  );
}