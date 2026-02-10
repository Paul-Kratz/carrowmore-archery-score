import { SetupPage } from "@/components/pages/SetupPage";
import { formatResponseArray } from "@/helpers/formatResponse";
import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/mongoose";
import { IUser } from "@/models";
import { User } from "@/models/mongoose";

export default async function Setup() {
  const session = await auth();
  await connectMongoose();

  const users = formatResponseArray<IUser>(
    await User.find({}, { email: 1, name: 1 }).lean(),
  );

  return <SetupPage users={users} currentUser={session?.user as IUser} />;
}
