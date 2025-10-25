import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        locationLat: true,
        locationLng: true,
        locationCity: true,
        createdAt: true,
        listings: {
          where: { isActive: true },
          take: 10,
          orderBy: { createdAt: "desc" },
        },
        reviewsReceived: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            reviewer: {
              select: {
                name: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        badges: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
