"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, UserCheck, Activity, ShieldCheck, Clock, HeartPulse, Search, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  /* State for Modal */
  const [showSpecialists, setShowSpecialists] = useState(false);

  const topDoctors = [
    { name: "Dr. Devi Shetty", role: "Chief Cardiologist", img: "D", color: "bg-red-100 text-red-600" },
    { name: "Dr. Paul Farmer", role: "Infectious Disease", img: "P", color: "bg-blue-100 text-blue-600" },
    { name: "Dr. Sanjay Gupta", role: "Chief Neurosurgeon", img: "S", color: "bg-purple-100 text-purple-600" },
    { name: "Dr. Soumya Swaminathan", role: "Pediatrician", img: "S", color: "bg-green-100 text-green-600" },
  ];

  const equipment = [
    { name: "Tesla MRI Scanner 3.0", img: "/images/mri.png", desc: "High-resolution imaging for precise diagnosis." },
    { name: "Da Vinci Surgical System", img: "/images/robot_surgery.png", desc: "Minimally invasive robotic surgery." },
    { name: "Advanced CT Scan", img: "/images/ct_scan.png", desc: "Rapid, detailed internal scanning." },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-secondary/20 blur-[100px]" />
          <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[40%] rounded-full bg-accent/20 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full glass border border-primary/20 mb-8">
                <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                <span className="text-sm font-medium text-primary">Accepting New Patients</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                Healthcare Reimagined for <span className="text-primary">You</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
                Experience the future of medical care with our advanced digital hospital management system. Book appointments, track recovery, and connect with top specialists instantly.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/patient/book">
                  <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8">
                    Book Appointment <Calendar className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#services">
                  <Button variant="ghost" size="lg" className="w-full sm:w-auto text-lg h-14 px-8">
                    Explore Services
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">World-Class Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive care designed around your needs. From digital records to instant specialist access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard
              icon={<Calendar className="h-8 w-8 text-primary" />}
              title="Instant Booking"
              description="Schedule appointments with doctors in seconds without waiting on hold."
            />
            <ServiceCard
              icon={<Activity className="h-8 w-8 text-secondary" />}
              title="Health Monitoring"
              description="Real-time updates on patient status and recovery progress."
            />
            <ServiceCard
              icon={<ShieldCheck className="h-8 w-8 text-accent" />}
              title="Secure Records"
              description="Your medical history is encrypted and accessible only to you and your doctor."
            />
            <div onClick={() => setShowSpecialists(true)} className="cursor-pointer">
              <ServiceCard
                icon={<UserCheck className="h-8 w-8 text-green-500" />}
                title="Top Specialists"
                description="Access to a network of world-renowned doctors and surgeons."
              />
            </div>
            <ServiceCard
              icon={<Clock className="h-8 w-8 text-orange-500" />}
              title="24/7 Support"
              description="Medical assistance and support available round the clock."
            />
            <ServiceCard
              icon={<HeartPulse className="h-8 w-8 text-red-500" />}
              title="Emergency Care"
              description="Immediate response units ready for critical situations."
            />
            <Link href="/patient/track" className="block h-full">
              <ServiceCard
                icon={<Search className="h-8 w-8 text-blue-500" />}
                title="Track Appointment"
                description="Monitor your appointment status with your Booking ID."
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Specialists & Equipment Modal */}
      <AnimatePresence>
        {showSpecialists && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-2xl my-8 relative flex flex-col max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowSpecialists(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="p-8 overflow-y-auto custom-scrollbar">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Excellence Center</h2>
                  <p className="text-muted-foreground text-lg">World-renowned specialists backed by state-of-the-art technology.</p>
                </div>

                {/* Top Doctors Grid */}
                <div className="mb-12">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <UserCheck className="h-6 w-6 text-primary" /> Top Specialists
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {topDoctors.map((doc, i) => (
                      <Card key={i} className="p-6 text-center hover:shadow-lg transition-all border-none bg-slate-50 dark:bg-slate-800/50">
                        <div className={`h-20 w-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold ${doc.color}`}>
                          {doc.img}
                        </div>
                        <h4 className="font-bold text-lg mb-1">{doc.name}</h4>
                        <p className="text-sm text-primary font-medium mb-2">{doc.role}</p>
                        <Link href="/patient/book">
                          <Button variant="ghost" size="sm" className="w-full">Book Appointment</Button>
                        </Link>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Equipment Showcase */}
                <div>
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Activity className="h-6 w-6 text-secondary" /> Advanced Technology
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {equipment.map((item, i) => (
                      <Card key={i} className="overflow-hidden border-none shadow-md group">
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={item.img}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-3 left-3 text-white">
                            <p className="font-bold">{item.name}</p>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-border flex justify-end bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
                <Button onClick={() => setShowSpecialists(false)}>Close Gallery</Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ServiceCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card variant="glass" className="card-hover p-8 border-white/40 dark:border-white/5 h-full">
      <div className="mb-6 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 w-fit">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </Card>
  );
}
