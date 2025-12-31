import DockWrapper from "@/components/DockWrapper";
import SetupForm from "@/components/SetupForm";
import { getUsers } from "@/functions/getUsers";
import { auth } from "@/lib/auth";
import { User } from "@prisma-local/client";

export default async function Home() {
  const users = await getUsers();

  const session = await auth();

  return (
    <DockWrapper>
      <div className="flex flex-col justify-center bg-base-200 items-center min-h-screen w-full p-4 box-border">
        <h1 className="text-2xl font-thin mb-3">Start a new shoot</h1>
        <SetupForm
          users={users as User[]}
          currentUser={session?.user as User}
        />
      </div>
    </DockWrapper>
  );
}
