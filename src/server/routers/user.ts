import { router, publicProcedure } from '../trpc';
import { users } from "../schema";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from "zod";

const baseUserInput = createInsertSchema(users);
const baseUserOutput = createSelectSchema(users);

// zod schema for API user creation
const apiCreateUser = baseUserInput.omit({ id: true })
const apiUpdateEmail = baseUserInput.pick({ name: true, email: true });
const apiSelectUserByName = baseUserInput.pick({ name: true })
const apiSelectResultList = z.array(baseUserOutput);

// From lxy: If you want to use drizzle, I recommend you to use Neon/Vercel, a serverless PG client
// Feel free to ask me how to use other tools if you don't want to use Neon
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export const userRouter = router({
  create: publicProcedure
    .input(apiCreateUser)
    .output(apiSelectResultList)
    .mutation(async ({ input }) => {
      return db.insert(users).values(input).returning();
    }),
  updateEmail: publicProcedure
    .input(apiUpdateEmail)
    .mutation(async ({ input }) => {
      return db.update(users).set({email: input.email}).where(eq(users.name, input.name)).returning({ updatedId : users.id});
    }),
  byName: publicProcedure
    .input(apiSelectUserByName)
    .query(async ({ input }) => {
      return db.select().from(users).where(eq(users.name, input.name));
    }),
})