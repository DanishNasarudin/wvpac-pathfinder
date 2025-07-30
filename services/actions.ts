"use server";

import prisma from "@/lib/prisma";
import { Edge, Point, Prisma, Room } from "@/prisma/generated/prisma";
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
  rooms,
  deletedPointIds = [],
  deletedRoomIds = [],
}: {
  id: number;
  points: Point[];
  edges: Edge[];
  rooms: Room[];
  deletedPointIds?: number[];
  deletedRoomIds?: number[];
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
          upsert: points.map((p) => ({
            where: p.id ? { id: p.id } : { id: -1 },
            create: {
              name: p.name,
              type: p.type,
              x: p.x,
              y: p.y,
              ...(p.roomId && {
                room: {
                  connect: {
                    id: p.roomId,
                  },
                },
              }),
            },
            update: {
              name: p.name,
              type: p.type,
              x: p.x,
              y: p.y,
              ...(p.roomId && {
                room: {
                  connect: {
                    id: p.roomId,
                  },
                },
              }),
            },
          })),
        },
        edges: {
          upsert: edges.map((e) => ({
            where: e.id ? { id: e.id } : { id: -1 },
            create: {
              fromId: e.fromId,
              toId: e.toId,
            },
            update: {
              fromId: e.fromId,
              toId: e.toId,
            },
          })),
        },
        rooms: {
          deleteMany:
            deletedRoomIds.length > 0
              ? { id: { in: deletedRoomIds } }
              : undefined,
          upsert: rooms.map((r) => ({
            where: r.id ? { id: r.id } : { id: -1 },
            create: {
              name: r.name,
            },
            update: {
              name: r.name,
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
