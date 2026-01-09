import DockWrapper from "@/components/DockWrapper";
import SetupForm from "@/components/SetupForm";
import { formatResponse } from "@/helpers/formatResponse";
import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/mongoose";
import { IUser } from "@/models";
import { User } from "@/models/mongoose";

export default async function Home() {
  const session = await auth();
  await connectMongoose();

  const users = formatResponse<IUser>(
    await User.find({}, { email: 1, name: 1 }).lean()
  );

  return (
    <DockWrapper>
      <div className="flex flex-col justify-center bg-base-200 items-center min-h-screen w-full p-4 box-border">
        <h1 className="text-2xl font-thin mb-3">Start a new shoot</h1>
        <SetupForm
          users={users as IUser[]}
          currentUser={session?.user as IUser}
        />
      </div>
    </DockWrapper>
  );
}
