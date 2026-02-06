import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { createQuoteRequest, getQuoteRequests, createCustomerAccount, getCustomerAccountByUserId, getQuoteRequestsByCustomerId } from "./db";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  quotes: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        phone: z.string().min(10, "Phone must be at least 10 characters"),
        company: z.string().optional(),
        commodityType: z.string().min(1, "Please select a commodity type"),
        quantity: z.string().min(1, "Quantity is required"),
        unit: z.string().min(1, "Unit is required"),
        deliveryTimeline: z.string().min(1, "Delivery timeline is required"),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          await createQuoteRequest({
            name: input.name,
            email: input.email,
            phone: input.phone,
            company: input.company,
            commodityType: input.commodityType,
            quantity: input.quantity,
            unit: input.unit,
            deliveryTimeline: input.deliveryTimeline,
            notes: input.notes,
            status: "new",
          });

          // Notify owner of new quote request
          await notifyOwner({
            title: "New Quote Request",
            content: `New quote request from ${input.name} (${input.email})\n\nCommodity: ${input.commodityType}\nQuantity: ${input.quantity} ${input.unit}\nDelivery: ${input.deliveryTimeline}`,
          });

          return {
            success: true,
            message: "Quote request submitted successfully. We will contact you soon.",
          };
        } catch (error) {
          console.error("Failed to submit quote request:", error);
          throw new Error("Failed to submit quote request. Please try again.");
        }
      }),

    list: publicProcedure
      .query(async () => {
        try {
          const quotes = await getQuoteRequests();
          return quotes;
        } catch (error) {
          console.error("Failed to fetch quote requests:", error);
          return [];
        }
      }),
  }),

  customer: router({
    // Create or update customer account
    setupAccount: protectedProcedure
      .input(z.object({
        companyName: z.string().min(2, "Company name must be at least 2 characters"),
        contactName: z.string().min(2, "Contact name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        phone: z.string().min(10, "Phone must be at least 10 characters"),
        address: z.string().optional(),
        country: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Check if customer account already exists
          const existingAccount = await getCustomerAccountByUserId(ctx.user!.id);
          
          if (existingAccount) {
            // Update existing account
            return {
              success: true,
              message: "Account updated successfully",
              accountId: existingAccount.id,
            };
          }

          // Create new customer account
          await createCustomerAccount({
            userId: ctx.user!.id,
            companyName: input.companyName,
            contactName: input.contactName,
            email: input.email,
            phone: input.phone,
            address: input.address,
            country: input.country,
            status: "active",
          });

          // Fetch the newly created account
          const newAccount = await getCustomerAccountByUserId(ctx.user!.id);

          return {
            success: true,
            message: "Account created successfully",
            accountId: newAccount?.id,
          };
        } catch (error) {
          console.error("Failed to setup customer account:", error);
          throw new Error("Failed to setup account. Please try again.");
        }
      }),

    // Get customer account details
    getAccount: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const account = await getCustomerAccountByUserId(ctx.user!.id);
          return account || null;
        } catch (error) {
          console.error("Failed to fetch customer account:", error);
          return null;
        }
      }),

    // Get customer's quote history
    getQuotes: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const account = await getCustomerAccountByUserId(ctx.user!.id);
          if (!account) {
            return [];
          }

          const quotes = await getQuoteRequestsByCustomerId(account.id);
          return quotes;
        } catch (error) {
          console.error("Failed to fetch customer quotes:", error);
          return [];
        }
      }),

    // Get quote details
    getQuote: protectedProcedure
      .input(z.object({
        quoteId: z.number(),
      }))
      .query(async ({ input, ctx }) => {
        try {
          const account = await getCustomerAccountByUserId(ctx.user!.id);
          if (!account) {
            throw new Error("Customer account not found");
          }

          const quotes = await getQuoteRequestsByCustomerId(account.id);
          const quote = quotes.find(q => q.id === input.quoteId);
          
          if (!quote) {
            throw new Error("Quote not found");
          }

          return quote;
        } catch (error) {
          console.error("Failed to fetch quote:", error);
          throw error;
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
