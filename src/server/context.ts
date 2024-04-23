/* eslint-disable @typescript-eslint/no-unused-vars */
import type * as trpcNext from '@trpc/server/adapters/next';
import { JWTUser } from 'server/routers/user';
import { verify } from 'jsonwebtoken';
interface CreateContextOptions {
  token: string,
}

/**
 * Inner function for `createContext` where we create the context.
 * This is useful for testing when we don't want to mock Next.js' request/response
 */
export function createContextInner(_opts: CreateContextOptions) : JWTUser {
  try {
    return verify(_opts.token, process.env.JWT_SECRET_KEY ?? '') as JWTUser
  } catch (error) {
    return {role: 'guest', user: null};
  }
}

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/v11/context
 */
export async function createContext(
  opts: trpcNext.CreateNextContextOptions,
) {
  // for API-response caching see https://trpc.io/docs/v11/caching

  return { ... createContextInner({token: opts.req.cookies.token ?? ''}),
    setCookie: (name: string, value: string) => {
      opts.res.setHeader('Set-Cookie', `${name}=${value}; Path=/; HttpOnly; SameSite=Strict; Secure;`)
    }
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>;
