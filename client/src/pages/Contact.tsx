import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { MapView } from "@/components/Map";
import { useRef } from "react";
import RequestQuoteForm from "@/components/RequestQuoteForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";

export default function Contact() {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const mapRef = useRef<google.maps.Map | null>(null);

  const onSubmit = async (data: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(data);
    toast.success("Message sent successfully! We'll get back to you soon.");
    reset();
  };

  const OFFICES = [
    {
      name: "Hong Kong",
      address: "Unit 2A, 17F, Glenealy Tower, No.1 Glenealy Central, Hong Kong",
      coords: { lat: 22.2793278, lng: 114.1528583 },
      type: "REGISTERED OFFICE"
    },
    {
      name: "Singapore Office",
      address: "10 Anson Road, International Plaza #05-01 Singapore 079903",
      coords: { lat: 1.2757, lng: 103.8458 },
      type: "HEADQUARTER"
    },
    {
      name: "Indonesia Office",
      address: "Apartment Oasis Lobby Tower C, GF 06, JL Senen Raya No. 135-137, Jakarta",
      coords: { lat: -6.1751, lng: 106.8451 },
      type: "COAL OPERATIONS"
    }
  ];

  return (
    <Layout>
      {/* Page Header */}
      <div className="bg-sidebar text-sidebar-foreground py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://files.manuscdn.com/user_upload_by_module/session_file/310519663306370278/GeQHLeHtQgqQEqKP.jpg')] bg-cover bg-center opacity-20" />
        <div className="container relative z-10">
          <h1 className="text-5xl font-heading font-bold mb-4 animate-in slide-in-from-left-10 duration-700">Contact Us</h1>
          <div className="h-1 w-20 bg-primary mb-6" />
          <p className="text-xl text-muted-foreground max-w-2xl animate-in slide-in-from-left-10 duration-700 delay-100">
            Get in touch with our team for inquiries, quotes, or partnership opportunities.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-heading font-bold text-sidebar-primary mb-6">Get in Touch</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Whether you're looking to source commodities or need logistics support, our team is ready to assist you. Fill out the form or reach us directly via the contact details below.
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex items-start gap-6 group">
                  <div className="bg-primary/10 p-4 rounded-sm text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-2">Registered Office</h4>
                    <p className="text-muted-foreground">
                      Unit 2A, 17F, Glenealy Tower<br />
                      No.1 Glenealy Central<br />
                      Hong Kong
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="bg-primary/10 p-4 rounded-sm text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-2">Email Us</h4>
                    <a href="mailto:jericho.ang@theharvestman.com" className="text-muted-foreground hover:text-primary transition-colors">
                      jericho.ang@theharvestman.com
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">We reply within 24 hours.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabbed Forms */}
            <div>
              <Tabs defaultValue="message" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="message">Send Message</TabsTrigger>
                  <TabsTrigger value="quote">Request Quote</TabsTrigger>
                </TabsList>

                {/* Message Tab */}
                <TabsContent value="message" className="bg-card p-8 md:p-10 rounded-sm shadow-lg border border-border">
                  <h3 className="text-2xl font-heading font-bold mb-6">Send a Message</h3>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Name *</label>
                        <Input 
                          {...register("name", { required: true })} 
                          placeholder="Your Name" 
                          className="bg-background"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email *</label>
                      <Input 
                        {...register("email", { required: true, pattern: /^\S+@\S+$/i })} 
                        placeholder="your@email.com" 
                        type="email"
                        className="bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subject *</label>
                      <Input 
                        {...register("subject", { required: true })} 
                        placeholder="Inquiry about..." 
                        className="bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Message *</label>
                      <Textarea 
                        {...register("message", { required: true })} 
                        placeholder="How can we help you?" 
                        className="min-h-[150px] bg-background"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-heading tracking-wide py-6 text-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "SEND MESSAGE"}
                    </Button>
                  </form>
                </TabsContent>

                {/* Quote Tab */}
                <TabsContent value="quote">
                  <RequestQuoteForm />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      {/* Global Offices Section */}
      <section className="py-20 bg-muted/30 border-t border-border">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-heading font-bold text-sidebar-primary mb-4">Our Global Presence</h2>
            <p className="text-muted-foreground text-lg">
              Strategically located offices to serve our international partners and clients effectively.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {OFFICES.map((office, index) => (
              <div key={index} className="bg-card p-6 rounded-sm shadow-sm border border-border hover:shadow-md transition-all group">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-2">{office.name}</h3>
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">{office.type}</div>
                <p className="text-muted-foreground text-sm leading-relaxed">{office.address}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
