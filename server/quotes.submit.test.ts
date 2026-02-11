import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database and notification functions
vi.mock("./db", () => ({
  createQuoteRequest: vi.fn().mockResolvedValue({ insertId: 1 }),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("quotes.submit", () => {
  vi.setConfig({ testTimeout: 15000 });
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully submit a quote request with valid data", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const quoteData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      company: "Acme Corp",
      commodityType: "Rice",
      quantity: "1000",
      unit: "tons",
      deliveryTimeline: "1-2 weeks",
      notes: "High quality preferred",
    };

    const result = await caller.quotes.submit(quoteData);

    expect(result.success).toBe(true);
    expect(result.message).toBe("Quote request submitted successfully. We will contact you soon.");
    expect(result.referenceNumber).toBeDefined();
    expect(result.referenceNumber).toMatch(/^HC-\d+-[A-Z0-9]{6}$/);
    expect(result.emailsSent).toBeDefined();
    expect(result.emailsSent.customer).toBe(true);
    expect(result.emailsSent.admin).toBe(true);
  });

  it("should reject quote with missing required fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const invalidData = {
      name: "John Doe",
      email: "invalid-email",
      phone: "123",
      company: "Acme Corp",
      commodityType: "",
      quantity: "1000",
      unit: "tons",
      deliveryTimeline: "1-2 weeks",
    };

    try {
      await caller.quotes.submit(invalidData as any);
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.message).toContain("Invalid");
    }
  });

  it("should reject quote with invalid email format", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const invalidData = {
      name: "John Doe",
      email: "not-an-email",
      phone: "+1234567890",
      company: "Acme Corp",
      commodityType: "Rice",
      quantity: "1000",
      unit: "tons",
      deliveryTimeline: "1-2 weeks",
    };

    try {
      await caller.quotes.submit(invalidData as any);
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.message).toContain("Invalid");
    }
  });

  it("should reject quote with short phone number", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const invalidData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "123",
      company: "Acme Corp",
      commodityType: "Rice",
      quantity: "1000",
      unit: "tons",
      deliveryTimeline: "1-2 weeks",
    };

    try {
      await caller.quotes.submit(invalidData as any);
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.message).toContain("Phone must be at least 10 characters");
    }
  });

  it("should accept optional company and notes fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const quoteData = {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1987654321",
      commodityType: "Sugar",
      quantity: "500",
      unit: "tons",
      deliveryTimeline: "ASAP",
    };

    const result = await caller.quotes.submit(quoteData as any);

    expect(result.success).toBe(true);
    expect(result.message).toBe("Quote request submitted successfully. We will contact you soon.");
    expect(result.referenceNumber).toBeDefined();
    expect(result.emailsSent).toBeDefined();
    expect(result.emailsSent.customer).toBe(true);
    expect(result.emailsSent.admin).toBe(true);
  });
});
