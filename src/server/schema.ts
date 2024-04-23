import {pgTable, bigint, varchar, text, serial} from "drizzle-orm/pg-core"

export const patients = pgTable("patient", {
  id: serial("id").primaryKey().notNull(),
  phone: varchar("phone", { length: 255 }),
  userName: varchar("user_name", { length: 255 }).notNull(),
  realName: varchar("real_name", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  identification: varchar("identification", { length: 255 }),
  authType: varchar("auth_type", { length: 255 }),
  bloodType: varchar("blood_type", { length: 255 }),
  medicalHistory: text("medical_history"),
});

export const doctors = pgTable("doctor", {
  id: serial("id").primaryKey().notNull(),
  phone: varchar("phone", { length: 255 }),
  userName: varchar("user_name", { length: 255 }).notNull(),
  realName: varchar("real_name", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  identification: varchar("identification", { length: 255 }),
  authType: varchar("auth_type", { length: 255 }),
  workId: varchar("work_id", { length: 255 }),
  office: varchar("office", { length: 255 }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  departmentId: bigint("department_id", { mode: "number" }),
  position: varchar("position", { length: 255 }),
  description: text("description"),
});