import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createQuoteRequest, getQuoteRequests } from "./db";
import { notifyOwner } from "./_core/notification";
import { 
  validateMessageContent, 
  checkRateLimit, 
  validateUrl, 
  cleanupRateLimits,
  getIPReputation,
  blockIP,
  unblockIP
} from "./security/contentFilter";
import { TRPCError } from "@trpc/server";
import { sendCustomerConfirmation, sendAdminNotification } from "./email/emailService";
import { nanoid } from "nanoid";

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
        ipAddress: z.string().optional(),
      }))
      .mutation(({ input, ctx }) => {
        // Extract IP address from request
        const ipAddress = input.ipAddress || (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0] || 
                         ctx.req.socket?.remoteAddress || "unknown";

        // Check IP reputation
        const ipRep = getIPReputation(ipAddress);
        if (ipRep?.blocked) {
          return {
            isValid: false,
            message: "Your IP address has been temporarily blocked due to suspicious activity. Please try again later.",
            violations: ["IP blocked"],
            sanitized: "",
            remainingMessages: 0,
            blocked: true,
          };
        }

        // Check rate limiting
        const userId = input.userId || "anonymous";
        const rateLimitCheck = checkRateLimit(userId, ipAddress);
        
        if (!rateLimitCheck.allowed) {
          return {
            isValid: false,
            message: `Too many messages. Please wait ${Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000)} seconds.`,
            violations: ["Rate limit exceeded"],
            sanitized: "",
            remainingMessages: 0,
            blocked: rateLimitCheck.blocked,
          };
        }

        // Validate message content
        const validation = validateMessageContent(input.content);
        
        // Clean up old rate limit entries periodically
        if (Math.random() < 0.1) {
          cleanupRateLimits();
        }

        // If message contains violations, record it for IP reputation
        if (!validation.isValid && ipAddress !== "unknown") {
          // Increment violation count for this IP (handled in checkRateLimit)
        }

        return {
          isValid: validation.isValid,
          message: validation.isValid 
            ? "Message passed security checks" 
            : `Message validation failed: ${validation.violations.join("; ")}`,
          violations: validation.violations,
          sanitized: validation.sanitized,
          remainingMessages: rateLimitCheck.remainingMessages,
          blocked: false,
        };
      }),

    validateUrl: publicProcedure
      .input(z.object({
        url: z.string().url(),
      }))
      .query(({ input }) => {
        return validateUrl(input.url);
      }),

    // Admin endpoints for IP management
    blockIP: publicProcedure
      .input(z.object({
        ipAddress: z.string(),
        duration: z.number().optional(),
      }))
      .mutation(({ input }) => {
        blockIP(input.ipAddress, input.duration);
        return { success: true, message: `IP ${input.ipAddress} has been blocked` };
      }),

    unblockIP: publicProcedure
      .input(z.object({
        ipAddress: z.string(),
      }))
      .mutation(({ input }) => {
        unblockIP(input.ipAddress);
        return { success: true, message: `IP ${input.ipAddress} has been unblocked` };
      }),

    getIPReputation: publicProcedure
      .input(z.object({
        ipAddress: z.string(),
      }))
      .query(({ input }) => {
        const rep = getIPReputation(input.ipAddress);
        return rep || { violations: 0, lastViolation: 0, blocked: false };
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
          // Validate input content for security
          const nameValidation = validateMessageContent(input.name);
          const emailValidation = validateMessageContent(input.email);
          const notesValidation = input.notes ? validateMessageContent(input.notes) : { isValid: true, violations: [] };

          if (!nameValidation.isValid || !emailValidation.isValid || !notesValidation.isValid) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Quote request contains inappropriate content",
            });
          }

          // Generate unique reference number
          const referenceNumber = `HC-${Date.now()}-${nanoid(6).toUpperCase()}`;

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

          // Send confirmation email to customer
          const customerEmailSent = await sendCustomerConfirmation(
            input.email,
            input.name,
            input.commodityType,
            input.quantity,
            input.unit,
            referenceNumber
          );

          // Send notification email to admin
          const adminEmailSent = await sendAdminNotification(
            input.name,
            input.email,
            input.phone,
            input.company,
            input.commodityType,
            input.quantity,
            input.unit,
            input.deliveryTimeline,
            input.notes,
            referenceNumber
          );

          // Notify owner of new quote request
          await notifyOwner({
            title: "New Quote Request",
            content: `New quote request from ${input.name} (${input.email})\n\nReference: ${referenceNumber}\nCommodity: ${input.commodityType}\nQuantity: ${input.quantity} ${input.unit}\nDelivery: ${input.deliveryTimeline}`,
          });

          return {
            success: true,
            message: "Quote request submitted successfully. We will contact you soon.",
            referenceNumber,
            emailsSent: {
              customer: customerEmailSent,
              admin: adminEmailSent,
            },
          };
        } catch (error) {
          console.error("Failed to submit quote request:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to submit quote request. Please try again.",
          });
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
