import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateCommodityPDF } from "@/lib/pdfGenerator";
import { useTabFromHash } from "@/hooks/useTabFromHash";

interface Specification {
  parameter: string;
  value?: string;
  unit?: string;
  adb?: string;
  arb?: string;
  merged?: string;
}

interface Commodity {
  name: string;
  origin?: string;
  hasBasis?: boolean;
  specifications: Specification[];
}

interface Category {
  name: string;
  commodities: Commodity[];
}

interface SpecsData {
  categories: Category[];
}

export default function Specifications() {
  const [specsData, setSpecsData] = useState<SpecsData | null>(null);
  const [activeTab, setActiveTab] = useState("");
  useTabFromHash(setActiveTab);

  useEffect(() => {
    fetch('/commodity-specs.json')
      .then(res => res.json())
      .then(data => setSpecsData(data))
      .catch(err => console.error('Error loading specifications:', err));
  }, []);

  if (!specsData) {
    return (
      <Layout>
        <div className="container py-24">
          <p className="text-center text-muted-foreground">Loading specifications...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-sidebar via-sidebar-accent to-sidebar-primary">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center text-white">
            <FileText className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h1 className="text-5xl font-heading font-bold mb-6">
              Commodity Specifications
            </h1>
            <p className="text-xl text-white/90">
              Detailed technical specifications for all our commodities, ensuring quality and transparency in every transaction.
            </p>
          </div>
        </div>
      </section>

      {/* Specifications Content */}
      <section className="py-16 bg-background">
        <div className="container">
          <Tabs value={activeTab || specsData.categories[0]?.name.toLowerCase().replace(/\s+/g, '-')} onValueChange={setActiveTab} className="w-full">
            <div className="mb-8 md:mb-12 overflow-x-auto pb-2">
              <TabsList className="bg-secondary/50 p-1 h-auto inline-flex md:flex md:flex-wrap md:justify-center gap-2 w-max md:w-full">
                {specsData.categories.map((category, idx) => (
                  <TabsTrigger
                    key={idx}
                    value={category.name.toLowerCase().replace(/\s+/g, '-')}
                    className="px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm transition-all whitespace-nowrap"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {specsData.categories.map((category, catIndex) => (
              <TabsContent key={catIndex} value={category.name.toLowerCase().replace(/\s+/g, '-')} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center">
                  <h2 className="text-4xl font-heading font-bold text-sidebar-primary mb-3">
                    {category.name}
                  </h2>
                  <div className="w-24 h-1 bg-primary mx-auto"></div>
                </div>

                <div className="grid gap-8">
                  {category.commodities.map((commodity, commIndex) => (
                    <Card key={commIndex} className="overflow-hidden border-2 border-border hover:border-primary transition-colors">
                      <CardHeader className="bg-sidebar/5">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-2xl font-heading flex items-center gap-3">
                            <span className="text-primary">■</span>
                            {commodity.name}
                          </CardTitle>
                          <Button
                            onClick={() => generateCommodityPDF(category.name, commodity)}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Download PDF
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 md:p-0">
                        {commodity.hasBasis ? (
                          // Coal table with ADB/ARB basis
                          <>
                          {/* Mobile card layout */}
                          <div className="md:hidden space-y-4">
                            {commodity.specifications.map((spec, specIndex) => (
                              <div key={specIndex} className="border border-border rounded p-3 bg-muted/10">
                                <div className="font-semibold text-sidebar-primary mb-2">{spec.parameter}</div>
                                {spec.merged ? (
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">Value: </span>
                                    <span className="font-semibold text-primary">{spec.merged}</span>
                                  </div>
                                ) : (
                                  <>
                                    <div className="text-sm mb-1">
                                      <span className="text-muted-foreground">Unit: </span>
                                      <span>{spec.unit}</span>
                                    </div>
                                    <div className="text-sm mb-1">
                                      <span className="text-muted-foreground">ADB: </span>
                                      <span className="font-medium">{spec.adb || '-'}</span>
                                    </div>
                                    <div className="text-sm">
                                      <span className="text-muted-foreground">ARB: </span>
                                      <span className="font-medium">{spec.arb || '-'}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                          {/* Desktop table layout */}
                          <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b-2 border-border bg-muted/30">
                                  <th className="text-left p-4 font-heading text-sidebar-primary">Parameter</th>
                                  <th className="text-center p-4 font-heading text-sidebar-primary">Units</th>
                                  <th className="text-center p-4 font-heading text-sidebar-primary" colSpan={2}>Basis</th>
                                </tr>
                                <tr className="border-b border-border bg-muted/20">
                                  <th className="p-4"></th>
                                  <th className="p-4"></th>
                                  <th className="text-center p-4 font-semibold text-sidebar-primary">ADB</th>
                                  <th className="text-center p-4 font-semibold text-sidebar-primary">ARB</th>
                                </tr>
                              </thead>
                              <tbody>
                                {commodity.specifications.map((spec, specIndex) => (
                                  <tr key={specIndex} className="border-b border-border hover:bg-muted/20 transition-colors">
                                    <td className="p-4 font-medium">{spec.parameter}</td>
                                    <td className="p-4 text-center text-muted-foreground">{spec.unit}</td>
                                    {spec.merged ? (
                                      <td colSpan={2} className="p-4 text-center font-semibold text-primary">
                                        {spec.merged}
                                      </td>
                                    ) : (
                                      <>
                                        <td className="p-4 text-center">{spec.adb || '-'}</td>
                                        <td className="p-4 text-center">{spec.arb || '-'}</td>
                                      </>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          </>
                        ) : (
                          // Standard specifications table
                          <>
                          {/* Mobile card layout */}
                          <div className="md:hidden space-y-3">
                            {commodity.specifications.map((spec, specIndex) => (
                              <div key={specIndex} className="border border-border rounded p-3 bg-muted/10">
                                <div className="font-medium text-sidebar-primary mb-1">{spec.parameter}</div>
                                <div className="text-primary font-semibold">{spec.value}</div>
                              </div>
                            ))}
                          </div>
                          {/* Desktop table layout */}
                          <div className="hidden md:block overflow-x-auto">
                            <table className="w-full table-fixed">
                              <colgroup>
                                <col className="w-1/2" />
                                <col className="w-1/2" />
                              </colgroup>
                              <thead>
                                <tr className="border-b-2 border-border bg-muted/30">
                                  <th className="text-left p-4 font-heading text-sidebar-primary">Parameter</th>
                                  <th className="text-left p-4 font-heading text-sidebar-primary">Specification</th>
                                </tr>
                              </thead>
                              <tbody>
                                {commodity.specifications.map((spec, specIndex) => (
                                  <tr key={specIndex} className="border-b border-border hover:bg-muted/20 transition-colors">
                                    <td className="p-4 font-medium">{spec.parameter}</td>
                                    <td className="p-4 text-primary font-semibold">{spec.value}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-sidebar text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">
            Need More Information?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Our team is ready to provide detailed specifications, certifications, and answer any questions about our commodities.
          </p>
          <a href="/contact" className="inline-block">
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-sm font-heading text-lg transition-colors">
              Contact Our Team
            </button>
          </a>
        </div>
      </section>
    </Layout>
  );
}
