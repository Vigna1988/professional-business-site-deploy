import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createQuoteRequest, getQuoteRequests } from "./db";
import { notifyOwner } from "./_core/notification";
import { validateMessageContent, checkRateLimit, validateUrl, cleanupRateLimits } from "./security/contentFilter";

export const appRouter = router({
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

  chat: router({
    validateMessage: publicProcedure
      .input(z.object({
        content: z.string().min(1).max(1000),
        userId: z.string().optional(),
      }))
      .mutation(({ input }) => {
        // Check rate limiting
        const userId = input.userId || "anonymous";
        const rateLimitCheck = checkRateLimit(userId);
        
        if (!rateLimitCheck.allowed) {
          return {
            isValid: false,
            message: `Too many messages. Please wait ${Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000)} seconds.`,
            violations: ["Rate limit exceeded"],
            sanitized: "",
          };
        }

        // Validate message content
        const validation = validateMessageContent(input.content);
        
        // Clean up old rate limit entries periodically
        if (Math.random() < 0.1) {
          cleanupRateLimits();
        }

        return {
          isValid: validation.isValid,
          message: validation.isValid 
            ? "Message passed security checks" 
            : `Message validation failed: ${validation.violations.join("; ")}`,
          violations: validation.violations,
          sanitized: validation.sanitized,
          remainingMessages: rateLimitCheck.remainingMessages,
        };
      }),

    validateUrl: publicProcedure
      .input(z.object({
        url: z.string().url(),
      }))
      .query(({ input }) => {
        return validateUrl(input.url);
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
});

export type AppRouter = typeof appRouter;
