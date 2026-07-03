import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const join = internalMutation({
  args: {
    email: v.string(),
    locale: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing) {
      return null;
    }
    await ctx.db.insert("waitlist", { email, locale: args.locale });
    return null;
  },
});
