import { z } from 'zod';

export const emailSchema = z.string().trim().email();

export const newsletterSchema = z.object({
  email: emailSchema,
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: emailSchema,
  phone: z.string().trim().max(40).optional(),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(10).max(5000),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(200),
});

export type ContactFormInput = z.infer<typeof contactSchema>;
