"use server";

import { prisma } from "@/lib/prisma";
import { Edge, Point, Prisma } from "@/prisma/generated/prisma";
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
      return { error: error.message };
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
      return { error: error.message };
    } else {
      return { error: "Unknown Error" };
    }
  }
}

export type EdgeWithName = Prisma.EdgeGetPayload<{
  include: {
    from: {
      select: {
        name: true;
      };
    };
    to: {
      select: {
        name: true;
      };
    };
  };
}>;

export type FloorWithPointsEdgesRooms = Prisma.FloorGetPayload<{
  include: {
    points: true;
    edges: {
      include: {
        from: {
          select: {
            name: true;
          };
        };
        to: {
          select: {
            name: true;
          };
        };
      };
    };
    rooms: true;
  };
}>;

export async function getFloorById({
  id,
}: {
  id: number;
}): Promise<{ result?: FloorWithPointsEdgesRooms | null; error?: string }> {
  try {
    const result = await prisma.floor.findFirst({
      where: {
        id,
      },
      include: {
        points: true,
        edges: {
          include: {
            from: {
              select: {
                name: true,
              },
            },
            to: {
              select: {
                name: true,
              },
            },
          },
        },
        rooms: true,
      },
    });
    return { result };
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return { error: error.message };
    } else {
      return { error: "Unknown Error" };
    }
  }
}

export async function updateFloor({
  id,
  points,
  edges,
  deletedPointIds = [],
}: {
  id: number;
  points: Point[];
  edges: Edge[];
  deletedPointIds?: number[];
}) {
  try {
    const result = await prisma.floor.update({
      where: {
        id,
      },
      data: {
        points: {
          deleteMany:
            deletedPointIds.length > 0
              ? { id: { in: deletedPointIds } }
              : undefined,
          connectOrCreate: points.map((p) => ({
            where: p.id ? { id: p.id } : { id: -1 },
            create: {
              name: p.name,
              type: p.type,
              x: p.x,
              y: p.y,
            },
          })),
        },
        edges: {
          connectOrCreate: edges.map((e) => ({
            where: e.id ? { id: e.id } : { id: -1 },
            create: {
              fromId: e.fromId,
              toId: e.toId,
            },
          })),
        },
      },
    });

    revalidatePath("/");
    return { result };
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return { error: error.message };
    } else {
      return { error: "Unknown Error" };
    }
  }
}
