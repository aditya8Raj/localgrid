"use client";

import Link from "next/link";
import { Users, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  ownerName: string;
  memberCount: number;
  status: "ACTIVE" | "COMPLETED" | "ON_HOLD";
  createdAt: string;
  className?: string;
}

const statusColors = {
  ACTIVE: "bg-green-500/10 text-green-700 border-green-500/20",
  COMPLETED: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  ON_HOLD: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
};

const statusLabels = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
};

export default function ProjectCard({
  id,
  title,
  description,
  ownerName,
  memberCount,
  status,
  createdAt,
  className = "",
}: ProjectCardProps) {
  return (
    <Link href={`/projects/${id}`}>
      <Card className={`hover:shadow-lg transition-shadow cursor-pointer ${className}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="mt-1 line-clamp-2">
                {description}
              </CardDescription>
            </div>
            <Badge variant="outline" className={statusColors[status]}>
              {statusLabels[status]}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{memberCount} {memberCount === 1 ? "member" : "members"}</span>
            </div>

            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="text-sm">
            <span className="text-muted-foreground">Owner:</span>{" "}
            <span className="font-medium">{ownerName}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
