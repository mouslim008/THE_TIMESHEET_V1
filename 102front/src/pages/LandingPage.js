import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  BarChart3, 
  ArrowRight, 
  Play,
  Users,
  Briefcase,
  Layers,
  Zap,
  LayoutDashboard
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleAuthRedirect = () => {
    navigate('/login');
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-secondary selection:bg-primary/10">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Clock className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-secondary">TimeSync</span>
          </div>

          <div className="hidden md:flex items-center space-x-10 text-sm font-semibold text-gray-500">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#roles" className="hover:text-primary transition-colors">Roles</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
            <a href="#resources" className="hover:text-primary transition-colors">Resources</a>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={handleAuthRedirect}
              className="text-sm font-bold text-secondary hover:text-primary transition-colors px-4 py-2"
            >
              Log in
            </button>
            <button 
              onClick={handleAuthRedirect}
              className="bg-primary text-white text-sm font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
            >
              Start for free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center space-x-2 bg-primary/5 text-primary text-xs font-bold px-4 py-2 rounded-full mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>Timesheet Management 2.0</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-secondary tracking-tight mb-8 leading-[1.1]"
          >
            Effortless Time Tracking <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">for Modern Teams</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto text-lg text-gray-500 font-medium mb-12 leading-relaxed"
          >
            Streamline your entire organization's workflow. Built with dedicated experiences for employees, managers, and administrators to make time tracking entirely frictionless.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <button 
              onClick={handleAuthRedirect}
              className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all flex items-center justify-center space-x-2"
            >
              <span>Start your free trial</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-secondary font-bold rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center space-x-2">
              <Play className="w-5 h-5 fill-current" />
              <span>Watch demo</span>
            </button>
          </motion.div>

          {/* App Preview Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-20 relative max-w-5xl mx-auto"
          >
            <div className="absolute -inset-4 bg-gradient-to-b from-primary/20 to-transparent rounded-[2.5rem] blur-3xl -z-10 opacity-50" />
            <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden p-4">
               <div className="bg-gray-50 rounded-[1.5rem] border border-gray-100 p-8 flex flex-col items-start text-left">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                      <LayoutDashboard className="text-primary w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-secondary">Timesheet Overview</h3>
                      <p className="text-xs text-gray-400">Manage your weekly activity</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 w-full mb-8">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Project Progress</span>
                        <Zap className="text-amber-500 w-4 h-4" />
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full border-4 border-primary border-r-transparent rotate-45 flex items-center justify-center">
                          <span className="text-sm font-bold text-secondary -rotate-45">75%</span>
                        </div>
                        <div>
                          <p className="text-xl font-black">240 Hours</p>
                          <p className="text-xs text-gray-400">Total spent this month</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                       <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Weekly Activity</span>
                        <BarChart3 className="text-primary w-4 h-4" />
                      </div>
                      <div className="flex items-end space-x-2 h-16">
                        <div className="w-full bg-primary/10 rounded-t-lg h-1/2" />
                        <div className="w-full bg-primary/20 rounded-t-lg h-3/4" />
                        <div className="w-full bg-primary rounded-t-lg h-full" />
                        <div className="w-full bg-primary/40 rounded-t-lg h-2/3" />
                        <div className="w-full bg-primary/10 rounded-t-lg h-1/3" />
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                      <span className="text-xs font-bold text-secondary uppercase tracking-wider">Recent Entries</span>
                      <ArrowRight className="text-gray-300 w-4 h-4" />
                    </div>
                    <div className="divide-y divide-gray-50">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="px-6 py-4 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-xs font-bold text-primary">PR</div>
                            <span className="text-sm font-medium text-secondary">Project Apollo</span>
                          </div>
                          <span className="text-sm text-gray-400">8.0 Hours</span>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features - Role Based */}
      <section id="roles" className="py-32 px-6 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-secondary tracking-tight mb-4">Tailored for every role</h2>
            <p className="text-gray-500 font-medium max-w-xl mx-auto">TimeSync provides a perfectly optimized interface for everyone in your company, ensuring they only see what they need to succeed.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "For Employees",
                desc: "A beautifully simple interface to log hours, track assigned projects, and submit weekly timesheets with zero friction.",
                icon: Users,
                color: "bg-blue-500",
                features: ["One-click time entries", "Clear summary of earnings", "Real-time status tracking"]
              },
              {
                title: "For Managers",
                desc: "Powerful team oversight. Monitor hours, review pending approvals, and ensure your entire team is staying on track.",
                icon: Briefcase,
                color: "bg-amber-500",
                features: ["Bulk approvals & rejections", "Team utilization insights", "Automated late alerts"]
              },
              {
                title: "For Admins",
                desc: "Complete system control. Manage roles, onboard users, oversee total platform usage, and create new projects in seconds.",
                icon: ShieldCheck,
                color: "bg-emerald-500",
                features: ["Global user management", "Project & billing setup", "Company-wide reporting"]
              }
            ].map((role, i) => (
              <motion.div
                key={i}
                {...fadeInUp}
                className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl hover:shadow-2xl transition-all group"
              >
                <div className={`w-14 h-14 ${role.color} rounded-2xl flex items-center justify-center shadow-lg shadow-${role.color.split('-')[1]}-500/20 mb-8 group-hover:-translate-y-1 transition-transform`}>
                  <role.icon className="text-white w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-secondary mb-4">{role.title}</h3>
                <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">{role.desc}</p>
                <div className="space-y-4">
                  {role.features.map((feat, j) => (
                    <div key={j} className="flex items-center space-x-3 text-sm font-bold text-secondary">
                      <CheckCircle2 className={`w-5 h-5 ${role.color.replace('bg-', 'text-')}`} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcase - Approval */}
      <section className="py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div {...fadeInUp}>
              <span className="text-xs font-bold text-amber-500 bg-amber-50 px-4 py-2 rounded-full mb-6 inline-block">Manager View</span>
              <h2 className="text-4xl md:text-5xl font-black text-secondary tracking-tight mb-8 leading-tight">
                Approve timesheets in <br /> seconds, not hours
              </h2>
              <p className="text-lg text-gray-500 font-medium mb-10 leading-relaxed">
                Say goodbye to endless email threads and manual spreadsheets. Managers get a clean dashboard highlighting pending approvals, total team hours, and quick actions to approve or reject with contextual comments.
              </p>
              <button className="text-secondary font-black border-b-2 border-primary pb-1 hover:text-primary transition-colors">
                Explore Manager Features
              </button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-10 bg-amber-500/10 rounded-full blur-3xl -z-10" />
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 rotate-2">
                <div className="bg-gray-50 rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
                  <LayoutDashboard className="w-20 h-20 text-gray-200" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

       {/* Feature Showcase - Admin */}
      <section className="py-32 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
             <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative order-2 lg:order-1"
            >
              <div className="absolute -inset-10 bg-primary/10 rounded-full blur-3xl -z-10" />
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 -rotate-2">
                <div className="bg-gray-50 rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
                  <ShieldCheck className="w-20 h-20 text-gray-200" />
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeInUp} className="order-1 lg:order-2">
              <span className="text-xs font-bold text-primary bg-primary/5 px-4 py-2 rounded-full mb-6 inline-block">Admin View</span>
              <h2 className="text-4xl md:text-5xl font-black text-secondary tracking-tight mb-8 leading-tight">
                Total control over your entire organization
              </h2>
              <p className="text-lg text-gray-500 font-medium mb-10 leading-relaxed">
                Administrators have complete visibility. Instantly add new employees, manage active projects, assign roles, and ensure your system is perfectly aligned with your company's structure.
              </p>
              <button className="text-secondary font-black border-b-2 border-primary pb-1 hover:text-primary transition-colors">
                Explore Admin Features
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto bg-secondary rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-secondary/20"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full -ml-48 -mb-48" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-8 leading-tight">
              Ready to transform your <br className="hidden md:block" /> time tracking?
            </h2>
            <p className="text-xl text-gray-400 font-medium mb-12 max-w-xl mx-auto">
              Join thousands of modern teams using TimeSync to save hours every week on timesheet management and approvals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button 
                onClick={handleAuthRedirect}
                className="w-full sm:w-auto px-10 py-5 bg-white text-secondary font-black rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                Get Started Now
              </button>
              <button className="w-full sm:w-auto px-10 py-5 bg-white/5 text-white font-black rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                Talk to Sales
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-8 md:mb-0">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Clock className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-secondary">TimeSync</span>
          </div>
          <div className="flex items-center space-x-10 text-sm font-bold text-gray-400">
            <span>© 2024 TimeSync Inc.</span>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
