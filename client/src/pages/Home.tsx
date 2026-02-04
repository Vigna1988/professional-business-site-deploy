import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Anchor, Wheat, Factory, Leaf, Globe, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";

export default function Home() {


  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663306370278/BzVYDOOiVxISCBBT.jpg",
      title: "AGRICULTURE EXCELLENCE",
      subtitle: "Sourcing premium grains, rice, and sugar directly from global origins.",
      cta: "View Agriculture",
      link: "/business#agriculture"
    },
    {
      image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663306370278/inGsHjBMPxNWthow.jpg",
      title: "ENERGY & COAL",
      subtitle: "Reliable energy solutions powering industries across continents.",
      cta: "Explore Energy",
      link: "/business#energy"
    },
    {
      image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663306370278/WCILRjMPUanOzvJd.jpg",
      title: "OIL TRADING",
      subtitle: "Strategic trading of crude and refined oil products for global markets.",
      cta: "Discover Oil Trading",
      link: "/business#oil"
    },
    {
      image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663306370278/QWHUGmeAgXIWbLXi.jpg",
      title: "MEAT & POULTRY",
      subtitle: "High-quality frozen meat and poultry sourced from trusted producers.",
      cta: "View Meat Products",
      link: "/business#meat"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const products = [
    { name: "Agriculture", icon: Wheat, image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663306370278/BzVYDOOiVxISCBBT.jpg", desc: "Premium grains, rice, and sugar sourced from global origins.", link: "/business#agriculture" },
    { name: "Energy & Coal", icon: Factory, image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663306370278/inGsHjBMPxNWthow.jpg", desc: "Reliable energy solutions powering industries across continents.", link: "/business#energy" },
    { name: "Oil Trading", icon: Leaf, image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663306370278/WCILRjMPUanOzvJd.jpg", desc: "Strategic trading of crude and refined oil products for global markets.", link: "/business#oil" },
    { name: "Meat & Poultry", icon: Wheat, image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663306370278/QWHUGmeAgXIWbLXi.jpg", desc: "High-quality frozen meat and poultry from trusted producers.", link: "/business#meat" },
  ];

  return (
    <Layout>


      {/* Hero Section */}
      <section className="relative h-[85vh] w-full overflow-hidden bg-sidebar">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/20 z-10" /> {/* Light overlay */}
          <img 
            key={slides[currentSlide].image}
            src={slides[currentSlide].image} 
            alt={slides[currentSlide].title} 
            className="w-full h-full object-cover animate-in zoom-in-105 duration-[10s]"
          />
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div className="container text-center text-white space-y-6 max-w-4xl px-4">
              <h1 
                key={`title-${currentSlide}`}
                className="text-5xl md:text-7xl font-heading font-bold tracking-tight animate-in slide-in-from-bottom-10 fade-in duration-700 delay-100 drop-shadow-lg"
              >
                {slides[currentSlide].title}
              </h1>
              <p 
                key={`subtitle-${currentSlide}`}
                className="text-xl md:text-2xl font-light text-white/90 max-w-2xl mx-auto animate-in slide-in-from-bottom-10 fade-in duration-700 delay-300"
              >
                {slides[currentSlide].subtitle}
              </p>
              <div 
                key={`cta-${currentSlide}`}
                className="pt-8 animate-in slide-in-from-bottom-10 fade-in duration-700 delay-500"
              >
                <Link href={slides[currentSlide].link}>
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 rounded-sm font-heading tracking-wider">
                    {slides[currentSlide].cta}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Slider Indicators */}
        <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 transition-all duration-300 rounded-full ${index === currentSlide ? "w-12 bg-primary" : "w-3 bg-white/50 hover:bg-white"}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* About Teaser Section */}
      <section className="py-24 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-primary font-heading font-bold tracking-widest uppercase text-sm">Who We Are</h4>
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-sidebar-primary leading-tight">
                  Your Trusted Trading Partner Delivering Promises
                </h2>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Harvest Commodities Limited has rapidly emerged as a diversified commodities powerhouse. We leverage extensive sourcing networks across Southeast Asia to meet the dynamic demands of our global clientele.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div className="space-y-2">
                  <h3 className="text-4xl font-heading font-bold text-primary">50,000 MT</h3>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">Average Monthly Grains</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-4xl font-heading font-bold text-primary">100,000 MT</h3>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">Average Monthly Coal</p>
                </div>
              </div>
              <Link href="/about">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-sm px-8">
                  Read Our Story
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 border-t-4 border-l-4 border-primary z-0" />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-4 border-r-4 border-primary z-0" />
              <img 
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663306370278/WjGiHblFZDEFVJZK.jpg" 
                alt="Business Meeting" 
                className="relative z-10 w-full h-[500px] object-cover shadow-2xl rounded-sm grayscale-[20%] hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features/Values */}
      <section className="py-20 bg-sidebar text-sidebar-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-sidebar via-sidebar/95 to-sidebar" />
        <div className="relative z-10">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center space-y-4 p-6 border border-sidebar-border/30 bg-sidebar-accent/5 rounded-sm hover:bg-sidebar-accent/10 transition-colors">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                  <Globe className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-heading font-bold">Global Sourcing</h3>
                <p className="text-gray-300">Strategic partnerships across continents ensuring reliable supplies.</p>
              </div>
              <div className="text-center space-y-4 p-6 border border-sidebar-border/30 bg-sidebar-accent/5 rounded-sm hover:bg-sidebar-accent/10 transition-colors">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-heading font-bold">Quality Assurance</h3>
                <p className="text-gray-300">Rigorous inspection and quality control standards for all commodities.</p>
              </div>
              <div className="text-center space-y-4 p-6 border border-sidebar-border/30 bg-sidebar-accent/5 rounded-sm hover:bg-sidebar-accent/10 transition-colors">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                  <Anchor className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-heading font-bold">Competitive Pricing</h3>
                <p className="text-gray-300">Access to current market intelligence to provide the most competitive pricing.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business/Products Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h4 className="text-primary font-heading font-bold tracking-widest uppercase text-sm">Our Business</h4>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-sidebar-primary">
              Commodities We Trade
            </h2>
            <p className="text-muted-foreground text-lg">
              A diverse portfolio of soft commodities and energy products sourced from reliable partners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <a key={index} href={product.link} className="block">
              <Card className="group overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 rounded-sm cursor-pointer h-full flex flex-col">
                <div className="relative h-64 overflow-hidden flex-shrink-0">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-12">
                    <h3 className="text-2xl font-heading font-bold text-white flex items-center gap-3">
                      <product.icon className="h-5 w-5 text-primary" />
                      {product.name}
                    </h3>
                  </div>
                </div>
                <CardContent className="p-6 bg-card flex-1 flex flex-col">
                  <p className="text-muted-foreground mb-4 flex-1">{product.desc}</p>
                  <div className="flex items-center text-primary font-medium text-sm group-hover:translate-x-2 transition-transform">
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="container relative z-10 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-heading font-bold">Ready to Partner With Us?</h2>
          <p className="text-xl max-w-2xl mx-auto opacity-90">
            Contact our team today to discuss your commodity needs and logistics requirements.
          </p>
          <Link href="/contact">
            <Button size="lg" variant="secondary" className="text-sidebar-primary font-bold text-lg px-10 py-6 rounded-sm shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
              Get in Touch
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
