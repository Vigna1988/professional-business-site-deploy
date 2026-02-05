import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wheat, Factory, Leaf, Anchor, Fuel, Droplet, Beef } from "lucide-react";
import { useState, useEffect } from "react";

export default function Business() {
  const [activeTab, setActiveTab] = useState("agriculture");
  
  // Handle initial hash and hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && ['agriculture', 'energy', 'oil', 'meat'].includes(hash)) {
        setActiveTab(hash);
        // Scroll to top after a short delay to ensure content is rendered
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      } else {
        // If no valid hash, default to agriculture
        setActiveTab('agriculture');
      }
    };
    
    // Set initial tab from hash immediately
    handleHashChange();
    
    // Listen for hash changes (browser back/forward and external links)
    window.addEventListener('hashchange', handleHashChange);
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.location.hash = value;
  };
  
  const categories = [
    {
      id: "agriculture",
      label: "Agriculture",
      icon: Wheat,
      description: "At Harvest Commodities, we specialize in connecting global markets with high-quality agricultural products sourced directly from trusted growers and producers. As a leading agriculture trading partner, we focus on delivering reliable supply chains, competitive pricing, and exceptional product standards across grains, oilseeds, pulses, spices, fresh produce, and more. With a strong network of farmers, processors, logistics providers, and buyers, we ensure seamless end-to-end trading solutions—from sourcing and quality control to transportation, documentation, and on-time delivery.",
      items: [
        { name: "Rice", image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663306370278/gMrJDDGvaETPjncU.jpg", desc: "We source premium varieties including Jasmine, Basmati, and Long Grain White Rice from Vietnam, Thailand, and India." },
        { name: "Corn", image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=800", desc: "High-quality yellow corn suitable for animal feed and industrial processing, sourced from major producing regions." },
        { name: "Wheat", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800", desc: "Milling wheat and feed wheat for diverse applications in the food and livestock industries." },
        { name: "Sugar", image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663306370278/fCdEtODQYygtdBcf.jpg", desc: "Raw and refined sugar (ICUMSA 45/150/600-1200) for global markets." },
        { name: "Edible Oil", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800", desc: "Palm oil, sunflower oil, and soybean oil available in bulk or consumer packaging." }
      ]
    },
    {
      id: "energy",
      label: "Energy & Coal",
      icon: Fuel,
      description: "We are a coal mining and trading company committed to delivering high-quality coal products to power generation, manufacturing, and industrial clients worldwide. With operations that span exploration, mining, processing, logistics, and international trade, we provide a reliable and efficient supply chain from the mine to the customer. Our mining operations use modern technologies and strict safety standards to ensure efficient extraction and responsible resource management.",
      items: [
        { name: "Thermal Coal", image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663306370278/inGsHjBMPxNWthow.jpg", desc: "High-calorific value thermal coal for power generation and industrial heating applications." },
        { name: "Coking Coal", image: "https://images.unsplash.com/photo-1524514587686-e2909d726e9b?auto=format&fit=crop&q=80&w=800", desc: "Metallurgical coal essential for steel production, sourced from reliable mines." }
      ]
    },
    {
      id: "oil",
      label: "Oil Trading",
      icon: Droplet,
      description: "Our oil trading division specializes in the sourcing, marketing, and distribution of refined petroleum products and crude oil to clients across global energy markets. With a strong network of producers, refineries, and logistics partners, we ensure a reliable supply chain that delivers energy solutions with consistency, transparency, and competitive pricing. We trade a wide range of products—including crude oil, diesel, fuel oil, gasoline, lubricants, and specialty petrochemicals.",
      items: [
        { name: "Petroleum Products", image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663306370278/WCILRjMPUanOzvJd.jpg", desc: "Trading of crude oil and refined petroleum products to meet global energy demands." },
        { name: "Fuel Oil", image: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&q=80&w=800", desc: "Industrial fuel oil for power plants and shipping vessels." }
      ]
    },
    {
      id: "meat",
      label: "Meat & Poultry",
      icon: Beef,
      description: "We specialize in the global sourcing and supply of premium meat and poultry products. As a trusted trading partner, we connect reputable farms, processors, and distributors to deliver high-quality beef, lamb, mutton, chicken, and turkey to markets around the world. We ensure strict adherence to international food safety and halal standards, offering products that meet the highest levels of quality, hygiene, and traceability.",
      items: [
        { name: "Frozen Poultry", image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663306370278/QWHUGmeAgXIWbLXi.jpg", desc: "High-quality frozen chicken and poultry products sourced from certified global suppliers." },
        { name: "Beef & Pork", image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=800", desc: "Premium cuts of beef and pork for retail and food service sectors." }
      ]
    }
  ];

  return (
    <Layout>
      {/* Page Header */}
      <div className="bg-sidebar text-sidebar-foreground py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://files.manuscdn.com/user_upload_by_module/session_file/310519663306370278/BzVYDOOiVxISCBBT.jpg')] bg-cover bg-center opacity-20" />
        <div className="container relative z-10">
          <h1 className="text-5xl font-heading font-bold mb-4 animate-in slide-in-from-left-10 duration-700">Our Business</h1>
          <div className="h-1 w-20 bg-primary mb-6" />
          <p className="text-xl text-muted-foreground max-w-2xl animate-in slide-in-from-left-10 duration-700 delay-100">
            A comprehensive portfolio of soft commodities and energy products.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-20">
        <div className="container">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="flex justify-center mb-12">
              <TabsList className="bg-secondary/50 p-1 h-auto flex flex-col md:flex-row justify-center gap-2 w-full max-w-4xl">
                {categories.map((cat) => (
                  <TabsTrigger 
                    key={cat.id} 
                    value={cat.id}
                    className="w-full md:w-auto px-6 py-3 text-base md:text-lg font-heading data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all justify-center"
                  >
                    <cat.icon className="mr-2 h-5 w-5" />
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {categories.map((cat) => (
              <TabsContent key={cat.id} value={cat.id} id={cat.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 scroll-mt-32">
                <div className="mb-12 max-w-4xl mx-auto text-center">
                  <h2 className="text-3xl font-heading font-bold text-sidebar-primary mb-6">{cat.label}</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">{cat.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {cat.items.map((item, idx) => (
                    <Card key={idx} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
                      <div className="h-64 overflow-hidden relative">
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors z-10" />
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-2xl font-heading font-bold text-sidebar-primary">{item.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>


    </Layout>
  );
}
