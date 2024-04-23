/**
 * This is your entry point to setup the root configuration for tRPC on the server.
 * - `initTRPC` should only be used once per app.
 * - We export only the functionality that we use so we can enforce which base procedures should be used
 *
 * Learn how to create protected base procedures and other things below:
 * @link https://trpc.io/docs/v11/router
 * @link https://trpc.io/docs/v11/procedures
 */

import {initTRPC, TRPCError} from '@trpc/server';
import { transformer } from 'utils/transformer';
import type { Context } from './context';
import {Doctor, Patient} from "./routers/user";

const t = initTRPC.context<Context>().create({
  /**
   * @link https://trpc.io/docs/v11/data-transformers
   */
  transformer,
  /**
   * @link https://trpc.io/docs/v11/error-formatting
   */
  errorFormatter({ shape }) {
    return shape;
  },
});

/**
 * Create a router
 * @link https://trpc.io/docs/v11/router
 */
export const router = t.router;

/**
 * Create an unprotected procedure
 * @link https://trpc.io/docs/v11/procedures
 **/
export const publicProcedure = t.procedure;

/**
 * Merge multiple routers together
 * @link https://trpc.io/docs/v11/merging-routers
 */
export const mergeRouters = t.mergeRouters;

/**
 * Create a server-side caller
 * @link https://trpc.io/docs/v11/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

export const middleware = t.middleware;

const isAuthed = middleware(({ next, ctx }) => {
    const user = ctx.user;

    if (!user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Please log in' });
    }

    return next({
        ctx
    });
});

const isPatient = middleware(({ next, ctx }) => {
    if (ctx.role !== 'patient') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not authorized to access this resource' });
    }

    return next({
        ctx: {
            ...ctx,
            user: ctx.user as Patient,
        }
    });
});

const isDoctor = middleware(({ next, ctx }) => {
    if (ctx.role !== 'doctor') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not authorized to access this resource' });
    }

    return next({
        ctx: {
            ...ctx,
            user: ctx.user as Doctor,
        }
    });
});

const isAdmin = middleware(({ next, ctx }) => {
    if (ctx.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not authorized to access this resource' });
    }

    return next({
        ctx
    });
});

export const authedProcedure = publicProcedure.use(isAuthed);
export const patientProcedure = authedProcedure.use(isPatient);
export const doctorProcedure = authedProcedure.use(isDoctor);
export const adminProcedure = authedProcedure.use(isAdmin);