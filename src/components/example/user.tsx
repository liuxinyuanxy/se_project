import NextError from 'next/error';


import type { RouterOutput, RouterInput } from 'utils/trpc';
import { trpc } from 'utils/trpc';

type UserCreateInput = RouterInput['user']['create'];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type UserCreateOutput = RouterOutput['user']['create'];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function UserApiUsage( input:UserCreateInput ) {
  const createUser = trpc.user.create.useMutation({
    async onSuccess() {
      console.log("qwq")
    }
  });
  const selectByName = trpc.user.byName.useQuery(input);
  /**
   * In a real app you probably won't use it like this
   * Checkout React Hook Form - it works great with tRPC
   * @link https://react-hook-form.com/
   * @link https://kitchen-sink.trpc.io/react-hook-form
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit = async (input : UserCreateInput) => {
    await createUser.mutateAsync(input)
  }

  if (selectByName.error) {
    return (
      <NextError
        title={selectByName.error.message}
        statusCode={selectByName.error.data?.httpStatus ?? 500}
      />
    )
  }

  if (selectByName.status !== 'success') {
    return (
      <div>
        <div className="w-full bg-zinc-900/70 rounded-md h-10 animate-pulse mb-2"></div>
        <div className="w-2/6 bg-zinc-900/70 rounded-md h-5 animate-pulse mb-8"></div>

        <div className="w-full bg-zinc-900/70 rounded-md h-40 animate-pulse"></div>
      </div>
    )
  }

  return (
    <div>
      <h1>{selectByName.data.length === 1 ? selectByName.data[0].name : "No user found"}</h1>
    </div>
  )
}