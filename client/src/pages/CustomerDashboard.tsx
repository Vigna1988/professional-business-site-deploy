import React, { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, MapPin, Phone, Mail, Building2, Calendar, Package } from "lucide-react";
import Layout from "@/components/Layout";

const accountFormSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  contactName: z.string().min(2, "Contact name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  address: z.string().optional(),
  country: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

const getStatusColor = (status: string) => {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-800";
    case "contacted":
      return "bg-yellow-100 text-yellow-800";
    case "quoted":
      return "bg-green-100 text-green-800";
    case "closed":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "new":
      return "New Request";
    case "contacted":
      return "In Progress";
    case "quoted":
      return "Quote Provided";
    case "closed":
      return "Closed";
    default:
      return status;
  }
};

export default function CustomerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [isEditingAccount, setIsEditingAccount] = useState(false);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
      country: "",
    },
  });

  // Fetch customer account
  const { data: account, isLoading: accountLoading } = trpc.customer.getAccount.useQuery();

  // Fetch customer quotes
  const { data: quotes = [], isLoading: quotesLoading } = trpc.customer.getQuotes.useQuery();

  // Setup account mutation
  const setupAccount = trpc.customer.setupAccount.useMutation();

  // Load account data into form when available
  useEffect(() => {
    if (account) {
      form.reset({
        companyName: account.companyName,
        contactName: account.contactName,
        email: account.email,
        phone: account.phone,
        address: account.address || "",
        country: account.country || "",
      });
    }
  }, [account, form]);

  async function onSubmitAccount(values: AccountFormValues) {
    try {
      await setupAccount.mutateAsync(values);
      toast.success("Account updated successfully!");
      setIsEditingAccount(false);
    } catch (error) {
      console.error("Failed to update account:", error);
      toast.error("Failed to update account. Please try again.");
    }
  }

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Login Required</CardTitle>
              <CardDescription>Please log in to view your quote history</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                You need to be logged in to access your customer dashboard and quote history.
              </p>
              <Button className="w-full">Log In</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Page Header */}
      <div className="bg-sidebar text-sidebar-foreground py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://files.manuscdn.com/user_upload_by_module/session_file/310519663306370278/GeQHLeHtQgqQEqKP.jpg')] bg-cover bg-center opacity-20" />
        <div className="container relative z-10">
          <h1 className="text-5xl font-heading font-bold mb-4 animate-in slide-in-from-left-10 duration-700">
            Customer Dashboard
          </h1>
          <div className="h-1 w-20 bg-primary mb-6" />
          <p className="text-xl text-muted-foreground max-w-2xl animate-in slide-in-from-left-10 duration-700 delay-100">
            Manage your account and view your quote history
          </p>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-20">
        <div className="container">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="quotes">Quote History</TabsTrigger>
            </TabsList>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6">
              {accountLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Account Information</CardTitle>
                      <CardDescription>
                        {account ? "Update your company and contact details" : "Set up your customer account"}
                      </CardDescription>
                    </div>
                    {account && !isEditingAccount && (
                      <Button onClick={() => setIsEditingAccount(true)} variant="outline">
                        Edit
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {!account && !isEditingAccount ? (
                      <div className="space-y-4">
                        <p className="text-muted-foreground">
                          You haven't set up your customer account yet. Create one to track your quotes and manage your orders.
                        </p>
                        <Button onClick={() => setIsEditingAccount(true)}>Create Account</Button>
                      </div>
                    ) : isEditingAccount ? (
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitAccount)} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="companyName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Company Name *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Your Company Ltd." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="contactName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Contact Name *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email *</FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="john@example.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="+1 (555) 123-4567" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="123 Business Street, City, State" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your Country" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex gap-2">
                            <Button type="submit" disabled={setupAccount.isPending}>
                              {setupAccount.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                            {account && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditingAccount(false)}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </form>
                      </Form>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex items-start gap-3">
                            <Building2 className="h-5 w-5 text-primary mt-1" />
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Company</p>
                              <p className="text-lg font-semibold">{account?.companyName}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Mail className="h-5 w-5 text-primary mt-1" />
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Email</p>
                              <p className="text-lg font-semibold">{account?.email}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Phone className="h-5 w-5 text-primary mt-1" />
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Phone</p>
                              <p className="text-lg font-semibold">{account?.phone}</p>
                            </div>
                          </div>

                          {account?.country && (
                            <div className="flex items-start gap-3">
                              <MapPin className="h-5 w-5 text-primary mt-1" />
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Country</p>
                                <p className="text-lg font-semibold">{account.country}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Quotes Tab */}
            <TabsContent value="quotes" className="space-y-6">
              {quotesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : quotes.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground py-12">
                      You haven't submitted any quote requests yet.{" "}
                      <a href="/contact" className="text-primary hover:underline">
                        Request a quote
                      </a>
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {quotes.map((quote) => (
                    <Card key={quote.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl">{quote.commodityType}</CardTitle>
                            <CardDescription>
                              Quote ID: #{quote.id} • Created {new Date(quote.createdAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(quote.status)}>
                            {getStatusLabel(quote.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                            <p className="text-lg font-semibold">
                              {quote.quantity} {quote.unit}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Delivery</p>
                            <p className="text-lg font-semibold">{quote.deliveryTimeline}</p>
                          </div>

                          {quote.quotedPrice && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Price</p>
                              <p className="text-lg font-semibold">
                                {quote.quotedPrice} {quote.currency || "USD"}
                              </p>
                            </div>
                          )}

                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                            <p className="text-lg font-semibold">
                              {new Date(quote.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {quote.notes && (
                          <div className="pt-4 border-t">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Your Notes</p>
                            <p className="text-muted-foreground">{quote.notes}</p>
                          </div>
                        )}

                        {quote.adminNotes && (
                          <div className="pt-4 border-t bg-blue-50 p-4 rounded">
                            <p className="text-sm font-medium text-blue-900 mb-2">Our Notes</p>
                            <p className="text-blue-800">{quote.adminNotes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}
