import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const quoteFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  company: z.string().optional(),
  commodityType: z.string().min(1, "Please select a commodity type"),
  quantity: z.string().min(1, "Quantity is required"),
  unit: z.string().min(1, "Unit is required"),
  deliveryTimeline: z.string().min(1, "Delivery timeline is required"),
  notes: z.string().optional(),
});

type QuoteFormValues = z.infer<typeof quoteFormSchema>;

const COMMODITY_OPTIONS = [
  { value: "Rice", label: "Rice" },
  { value: "Corn", label: "Corn" },
  { value: "Wheat", label: "Wheat" },
  { value: "Sugar", label: "Sugar" },
  { value: "Edible Oil", label: "Edible Oil" },
  { value: "Thermal Coal", label: "Thermal Coal" },
  { value: "Coking Coal", label: "Coking Coal" },
  { value: "Crude Oil", label: "Crude Oil" },
  { value: "Petroleum Products", label: "Petroleum Products" },
  { value: "Fuel Oil", label: "Fuel Oil" },
  { value: "Frozen Poultry", label: "Frozen Poultry" },
  { value: "Beef & Pork", label: "Beef & Pork" },
];

const UNIT_OPTIONS = [
  { value: "tons", label: "Metric Tons" },
  { value: "barrels", label: "Barrels" },
  { value: "liters", label: "Liters" },
  { value: "kg", label: "Kilograms" },
  { value: "units", label: "Units" },
];

const TIMELINE_OPTIONS = [
  { value: "ASAP", label: "ASAP (Within 1 week)" },
  { value: "1-2 weeks", label: "1-2 weeks" },
  { value: "1 month", label: "Within 1 month" },
  { value: "2-3 months", label: "2-3 months" },
  { value: "3+ months", label: "3+ months" },
];

export default function RequestQuoteForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      commodityType: "",
      quantity: "",
      unit: "tons",
      deliveryTimeline: "",
      notes: "",
    },
  });

  const submitQuote = trpc.quotes.submit.useMutation();

  async function onSubmit(values: QuoteFormValues) {
    setIsSubmitting(true);
    try {
      await submitQuote.mutateAsync(values);
      toast.success("Quote request submitted successfully! We will contact you soon.");
      form.reset();
    } catch (error) {
      console.error("Failed to submit quote:", error);
      toast.error("Failed to submit quote request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-heading text-sidebar-primary">Request a Quote</CardTitle>
        <CardDescription>
          Fill out the form below and we'll get back to you with a competitive quote within 24 hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Contact Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-sidebar-primary">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Company Ltd." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Commodity Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-sidebar-primary">Commodity Details</h3>

              <FormField
                control={form.control}
                name="commodityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commodity Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a commodity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COMMODITY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1000" {...field} />
                      </FormControl>
                      <FormDescription>Enter the quantity needed</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit of Measurement *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {UNIT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Delivery Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-sidebar-primary">Delivery Information</h3>

              <FormField
                control={form.control}
                name="deliveryTimeline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desired Delivery Timeline *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select delivery timeline" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIMELINE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-sidebar-primary">Additional Information</h3>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Requirements or Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any special requirements, quality specifications, or other details we should know about?"
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Optional: Tell us about any special requirements</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              disabled={isSubmitting || submitQuote.isPending}
            >
              {isSubmitting || submitQuote.isPending ? "Submitting..." : "Submit Quote Request"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
