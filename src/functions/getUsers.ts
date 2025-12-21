import { prisma } from "@/lib/prisma";

export const getUsers = async () => {
  try {
    const users = await prisma.user.findMany();

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    }));
  } catch (e: unknown) {
    console.log(e);
  }
};
