'use client'
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  Heart, Map, Calendar, CheckCircle2, ArrowRight, 
  Sparkles, Star, Quote 
} from "lucide-react";
import { JourneyHeader } from "@/components/JourneyHeader";

// Animation variants for staggered reveals
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      
      {/* --- 1. HERO SECTION --- */}
      <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden">
        
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background z-10" />
          <img 
            src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop" 
            alt="Wedding Background" 
            className="w-full h-full object-cover"
          />
        </div>

        <JourneyHeader transparent/>

        {/* Hero Content */}
        <div className="container mx-auto px-6 relative z-20 pt-20 text-center text-white">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={item}>
              <span className="inline-block py-1 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-6 tracking-wider uppercase">
                The Stress-Free Way to Say "I Do"
              </span>
            </motion.div>
            
            <motion.div variants={item}>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-8 leading-tight drop-shadow-lg">
                Your Wedding, <br />
                <span className="text-primary italic">Perfectly Planned.</span>
              </h1>
            </motion.div>

            <motion.div variants={item}>
              <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
                Ditch the overwhelming spreadsheets. Follow a beautiful, guided roadmap that turns your wedding planning into a joyful journey.
              </p>
            </motion.div>
            
            <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/signup">
                <Button size="lg" className="h-16 px-10 text-sm md:text-xl rounded-full bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25 transition-transform hover:scale-105">
                  Start Your Journey Free
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-16 px-10 text-sm md:text-xl rounded-full border-2 bg-transparent text-white border-white hover:bg-white hover:text-black transition-all">
                  See How It Works
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- 2. VALUE PROPOSITION --- */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-primary text-sm font-bold uppercase tracking-widest mb-3">Why Choose Us</h2>
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Everything you need, nothing you don't.</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Map className="w-8 h-8 text-white" />,
                color: "bg-rose-400",
                title: "Visual Roadmap",
                desc: "A clear, step-by-step path from engagement to honeymoon. Never guess what to do next."
              },
              {
                icon: <Sparkles className="w-8 h-8 text-white" />,
                color: "bg-amber-400",
                title: "Smart Budgeting",
                desc: "Track estimates vs. actual spend. Keep your finances in check without the math headaches."
              },
              {
                icon: <Calendar className="w-8 h-8 text-white" />,
                color: "bg-emerald-400",
                title: "Guest & Gift Manager",
                desc: "Manage your guest list and registry in one place. Let guests mark gifts as taken effortlessly."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="group p-8 rounded-3xl bg-secondary/5 border border-border/50 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 3. INTERACTIVE PREVIEW SECTION --- */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 to-transparent opacity-30" />
        
        <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 space-y-8">
            <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight">
              See your big day <br/> take shape.
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              Watch your progress grow as you tick off milestones. Our interactive dashboard gives you peace of mind, knowing every detail is handled.
            </p>
            <ul className="space-y-4">
              {["Customizable Phases", "Vendor Tracking", "Day-of Timeline"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-lg">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Visual Mockup Card */}
          <div className="lg:w-1/2 w-full">
            <motion.div 
              initial={{ rotate: 6, opacity: 0, x: 50 }}
              whileInView={{ rotate: 3, opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              {/* Fake UI Elements to simulate the app */}
              <div className="flex gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500"/>
                <div className="w-3 h-3 rounded-full bg-yellow-500"/>
                <div className="w-3 h-3 rounded-full bg-green-500"/>
              </div>
              <div className="space-y-4">
                <div className="h-32 rounded-xl bg-gradient-to-r from-primary/80 to-accent/80 flex items-center justify-center">
                  <h3 className="text-3xl font-serif font-bold text-white">Our Wedding</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 rounded-lg bg-white/10 p-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 mb-2"/>
                    <div className="h-2 w-16 bg-white/20 rounded"/>
                  </div>
                  <div className="h-24 rounded-lg bg-white/10 p-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 mb-2"/>
                    <div className="h-2 w-20 bg-white/20 rounded"/>
                  </div>
                </div>
                <div className="h-12 rounded-lg bg-white/5 w-full"/>
                <div className="h-12 rounded-lg bg-white/5 w-3/4"/>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      

      {/* --- 5. FINAL CTA --- */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10 -z-10" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-6 text-center max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-foreground">
            Ready to Plan the Wedding of Your Dreams?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join thousands of couples who are planning stress-free. Your roadmap is waiting.
          </p>
          <Link href="/signup">
            <Button size="lg" className="h-14 px-12 text-sm md:text-xl rounded-full shadow-xl shadow-primary/25 hover:scale-105 transition-transform">
              Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            <span className="font-serif font-bold text-lg">Aisle Roadmap</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Aisle Roadmap. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary">Privacy</Link>
            <Link href="#" className="hover:text-primary">Terms</Link>
            <Link href="#" className="hover:text-primary">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}