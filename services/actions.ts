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
  deletedInterFloorIds = [],
  interFloor = [],
}: {
  id: number;
  points: Point[];
  edges: Edge[];
  rooms: Room[];
  deletedPointIds?: number[];
  deletedRoomIds?: number[];
  deletedInterFloorIds?: number[];
  interFloor: Edge[];
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
            where: p.id !== -1 ? { id: p.id } : { id: -1 },
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
            where: e.id !== -1 ? { id: e.id } : { id: -1 },
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
            where: r.id !== -1 ? { id: r.id } : { id: -1 },
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

    await prisma.$transaction(
      interFloor.map(
        (i) =>
          prisma.edge.upsert({
            where: { id: i.id !== -1 ? i.id : -1 },
            create: {
              fromId: i.fromId,
              toId: i.toId,
            },
            update: {
              fromId: i.fromId,
              toId: i.toId,
            },
          }) as Prisma.PrismaPromise<Edge>
      )
    );

    if (deletedInterFloorIds.length > 0) {
      await prisma.edge.deleteMany({
        where: {
          id: { in: deletedInterFloorIds },
        },
      });
    }

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

export async function getInterFloorEdges() {
  try {
    const edges = await prisma.edge.findMany({
      include: {
        from: { select: { floorId: true, name: true } },
        to: { select: { floorId: true, name: true } },
      },
    });

    return { result: edges.filter((e) => e.from.floorId !== e.to.floorId) };
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return { error: error.message };
    } else {
      return { error: "Unknown Error" };
    }
  }
}
