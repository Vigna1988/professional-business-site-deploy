import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, TrendingUp, Users, Globe2 } from "lucide-react";
import { useEffect } from "react";

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <Layout>
      {/* Page Header */}
      <div className="bg-sidebar text-sidebar-foreground py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://files.manuscdn.com/user_upload_by_module/session_file/310519663306370278/tAEsdFmmvUbtVGSQ.jpg')] bg-cover bg-center opacity-20" />
        <div className="container relative z-10">
          <h1 className="text-5xl font-heading font-bold mb-4 animate-in slide-in-from-left-10 duration-700">About Harvest</h1>
          <div className="h-1 w-20 bg-primary mb-6" />
          <p className="text-xl text-muted-foreground max-w-2xl animate-in slide-in-from-left-10 duration-700 delay-100">
            Building trust through transparency and delivering excellence in global commodities trading.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <section id="our-story" className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <h2 className="text-4xl font-heading font-bold text-sidebar-primary">Our Story</h2>
              <div className="prose prose-lg text-muted-foreground">
                <p>
                  With decade of experience, Harvest Commodities has evolved alongside the world’s most dynamic commodity markets. What began as a small trading enterprise has developed into a diversified global commodities business with operations across sourcing, logistics, and market intelligence.
                </p>
                <p>
                  Our long-standing expertise allows us to anticipate market trends, navigate volatility, and deliver dependable value to producers, industrial customers, and financial partners.
                </p>
                <p>
                  Guided by our heritage and strengthened by modern technology, we continue to uphold the principles that have sustained us through generations of trade.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full text-primary">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Decade of Experience</h4>
                    <p className="text-sm text-muted-foreground">Evolving alongside dynamic global markets.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full text-primary">
                    <Globe2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Diversified Operations</h4>
                    <p className="text-sm text-muted-foreground">Sourcing, logistics, and market intelligence.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-primary/5 transform rotate-3 rounded-sm" />
              <img 
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663306370278/WjGiHblFZDEFVJZK.jpg" 
                alt="Harvest Team" 
                className="relative z-10 w-full rounded-sm shadow-xl grayscale-[10%] hover:grayscale-0 transition-all duration-500"
              />
              <div className="absolute -bottom-10 -left-10 bg-white p-8 shadow-2xl rounded-sm max-w-xs hidden md:block z-20 border-l-4 border-primary">
                <p className="font-heading font-bold text-2xl text-sidebar-primary mb-2">"Your trusted trading partner."</p>
                <p className="text-sm text-muted-foreground">- The Harvest Promise</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-heading font-bold text-sidebar-primary mb-4">Our Core Values</h2>
            <p className="text-muted-foreground text-lg">The principles that guide every transaction and partnership we build.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Integrity", desc: "We conduct our business with the highest standards of professional behavior and ethics." },
              { title: "Reliability", desc: "We deliver on our promises, ensuring timely execution and consistent quality." },
              { title: "Partnership", desc: "We believe in long-term relationships that create mutual value for all stakeholders." }
            ].map((value, i) => (
              <div key={i} className="bg-card p-8 rounded-sm shadow-sm border border-border hover:border-primary/50 transition-colors group">
                <CheckCircle2 className="h-10 w-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-heading font-bold mb-4">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
