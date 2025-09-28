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
        active: true,
      },
      include: {
        points: {
          orderBy: {
            id: "asc",
          },
        },
        edges: {
          where: {
            floorId: id,
            from: {
              floor: {
                id,
              },
            },
            to: {
              floor: {
                id,
              },
            },
          },
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
        rooms: {
          where: {
            floor: {
              id,
            },
          },
        },
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
  deletedEdgeIds = [],
  deletedRoomIds = [],
  deletedInterFloorIds = [],
  interFloor = [],
}: {
  id: number;
  points: Point[];
  edges: Edge[];
  rooms: Room[];
  deletedPointIds?: number[];
  deletedEdgeIds?: number[];
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
          deleteMany:
            deletedEdgeIds.length > 0
              ? { id: { in: deletedEdgeIds } }
              : undefined,
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
      where: {
        from: {
          floor: {
            active: true,
          },
        },
        to: {
          floor: {
            active: true,
          },
        },
      },
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

type PointNew = {
  name: string;
  type: string;
  x: number;
  y: number;
  roomId: number | null;
};
type PointUpdate = { id: number } & PointNew;

type EdgeNew = {
  fromId: number;
  toId: number;
};
type EdgeUpdate = { id: number } & EdgeNew;

type RoomNew = {
  name: string;
};
type RoomUpdate = { id: number } & RoomNew;

// 2. Bundle into a single params type:
interface UpdateFloorParams {
  id: number;

  newPoints: PointNew[];
  updatedPoints: PointUpdate[];
  deletedPointIds: number[];

  newEdges: EdgeNew[];
  updatedEdges: EdgeUpdate[];
  deletedEdgeIds: number[];

  newRooms: RoomNew[];
  updatedRooms: RoomUpdate[];
  deletedRoomIds: number[];

  interFloor: Edge[];
  deletedInterFloorIds: number[];
}

// 3. Use nested creates/updates/deletes in Prisma:
export async function updateFloorOptimised(params: UpdateFloorParams) {
  try {
    const {
      id,
      newPoints,
      updatedPoints,
      deletedPointIds,
      newEdges,
      updatedEdges,
      deletedEdgeIds,
      newRooms,
      updatedRooms,
      deletedRoomIds,
      interFloor,
      deletedInterFloorIds,
    } = params;

    const result = await prisma.floor.update({
      where: { id },
      data: {
        points: {
          create: newPoints,
          update: updatedPoints.map((p) => ({
            where: { id: p.id },
            data: {
              name: p.name,
              type: p.type,
              x: p.x,
              y: p.y,
              roomId: p.roomId,
            },
          })),
          deleteMany: deletedPointIds.length
            ? { id: { in: deletedPointIds } }
            : undefined,
        },
        edges: {
          create: newEdges,
          update: updatedEdges.map((e) => ({
            where: { id: e.id },
            data: { fromId: e.fromId, toId: e.toId },
          })),
          deleteMany: deletedEdgeIds.length
            ? { id: { in: deletedEdgeIds } }
            : undefined,
        },
        rooms: {
          create: newRooms,
          update: updatedRooms.map((r) => ({
            where: { id: r.id },
            data: { name: r.name },
          })),
          deleteMany: deletedRoomIds.length
            ? { id: { in: deletedRoomIds } }
            : undefined,
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
