import {doctorProcedure, patientProcedure, publicProcedure, router} from '../trpc';
import {doctors, patients} from "../schema";
import {createInsertSchema, createSelectSchema} from 'drizzle-zod';
import bcrypt from 'bcryptjs';
import {db} from "lib/drrizle"
import {eq} from "drizzle-orm";
import { TypeOf } from "zod";
import {TRPCError} from "@trpc/server";
import jwt from 'jsonwebtoken';

const basePatientsInput = createInsertSchema(patients).required()
const baseDoctorsInput = createInsertSchema(doctors).required()
const basePatientsOutput = createSelectSchema(patients)
const baseDoctorsOutput = createSelectSchema(doctors)

const apiCreatePatient = basePatientsInput.omit({ id: true })
const apiCreateDoctor = baseDoctorsInput.omit({ id: true })
const apiSelectPatientByName = basePatientsInput.pick({ realName: true })
const apiSelectDoctorByName = baseDoctorsInput.pick({ realName: true })
const apiSelectPatientByUserName = basePatientsInput.pick({ userName: true })
const apiSelectDoctorByUserName = baseDoctorsInput.pick({ userName: true })
const apiLoginPatient = basePatientsInput.pick({ userName: true, password: true })
const apiLoginDoctor = baseDoctorsInput.pick({ userName: true, password: true })

export type Patient = TypeOf<typeof basePatientsOutput>;
export type Doctor = TypeOf<typeof baseDoctorsOutput>;
export type JWTUser = {
    user: Patient | Doctor | null
    role: string
}

const createPatient = async ( input :TypeOf<typeof apiCreatePatient>) => {
    const hashedPassword = await bcrypt.hash(input.password, 10);
    return db.insert(patients).values({
        ...input,
        password: hashedPassword
    });
}

const createDoctor = async ( input :TypeOf<typeof apiCreateDoctor>) => {
    const hashedPassword = await bcrypt.hash(input.password, 10);
    return db.insert(doctors).values({
        ...input,
        password: hashedPassword
    });
}

const selectPatientByRealName = async ( input :TypeOf<typeof apiSelectPatientByName>) => {
    return db.select().from(patients).where(eq(patients.realName, input.realName));
}

const selectDoctorByRealName = async ( input :TypeOf<typeof apiSelectDoctorByName>) => {
    return db.select().from(doctors).where(eq(doctors.realName, input.realName));
}

const selectPatientByName = async ( input :TypeOf<typeof apiSelectPatientByUserName>) => {
    return db.select().from(patients).where(eq(patients.userName, input.userName));
}

const selectDoctorByName = async ( input :TypeOf<typeof apiSelectDoctorByUserName>) => {
    return db.select().from(doctors).where(eq(doctors.userName, input.userName));
}

export const userRouter = router({
    createPatient: publicProcedure
        .input(apiCreatePatient)
        .query(async ({ input }) => {
            return createPatient(input);
        }),
    createDoctor: publicProcedure
        .input(apiCreateDoctor)
        .query(async ({ input }) => {
            return createDoctor(input);
        }),
    loginPatient: publicProcedure
        .input(apiLoginPatient)
        .query(async ({ input, ctx }) => {
            const patient = await selectPatientByName(input);
            if (patient.length === 0 || !await bcrypt.compare(input.password, patient[0].password)) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Invalid username or password',
                })
            }

            const secret = process.env.JWT_SECRET;
            const user: JWTUser = { user: patient[0], role: 'patient' };
            const token = jwt.sign(user, secret!, { expiresIn: '1h' });
            ctx.setCookie('token', token);
        }),
    loginDoctor: publicProcedure
        .input(apiLoginDoctor)
        .query(async ({ input, ctx }) => {
            const doctor = await selectDoctorByName(input);
            if (doctor.length === 0 || !await bcrypt.compare(input.password, doctor[0].password)) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Invalid username or password',
                })
            }

            const secret = process.env.JWT_SECRET;
            const user: JWTUser = { user: doctor[0], role: 'doctor' };
            const token = jwt.sign(user, secret!, { expiresIn: '1h' });
            ctx.setCookie('token', token);
        }),
    updatePatient: patientProcedure
        .input(apiCreatePatient)
        .query(async ({ input, ctx}) => {
            return db.update(patients).set(input).where(eq(patients.id, ctx.user.id));
        }),
    updateDoctor: doctorProcedure
        .input(apiCreateDoctor)
        .query(async ({ input, ctx}) => {
            return db.update(doctors).set(input).where(eq(doctors.id, ctx.user.id));
        }),
})