import { SetupPage } from "@/components/pages/SetupPage";
import { ACTIVE_SHOOT_COOKIE } from "@/constants";
import { formatResponseArray } from "@/helpers/formatResponse";
import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/mongoose";
import { IUser } from "@/models";
import { User } from "@/models/mongoose";
import { cookies } from "next/headers";

export default async function Home() {
  // Check if there is an active shoot to resume
  const cookieStore = await cookies();
  const activeShootId = cookieStore.get(ACTIVE_SHOOT_COOKIE)?.value;

  // Fetch list of users
  const session = await auth();
  await connectMongoose();

  const users = formatResponseArray<IUser>(
    await User.find({}, { name: 1 }).lean(),
  );

  return (
    <SetupPage
      activeShootId={activeShootId}
      users={users}
      currentUser={session?.user as IUser}
    />
  );
}
