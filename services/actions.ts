"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addFloor({ name, src }: { name: string; src: string }) {
  try {
    const result = await prisma.floor.create({
      data: {
        name,
        src,
      },
    });

    revalidatePath("/");

    return result;
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return { error: error };
    } else {
      return { error: "Unknown Error" };
    }
  }
}

export async function deleteFloor({ id }: { id: number }) {
  try {
    const result = await prisma.floor.delete({
      where: {
        id,
      },
    });

    revalidatePath("/");

    return result;
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return { error: error };
    } else {
      return { error: "Unknown Error" };
    }
  }
}
