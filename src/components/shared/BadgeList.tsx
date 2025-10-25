"use client";

import { Shield, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BadgeItem {
  id: string;
  provider: string;
  badgeId: string;
  issuedAt: Date | string;
}

interface BadgeListProps {
  badges: BadgeItem[];
  className?: string;
}

export default function BadgeList({ badges, className = "" }: BadgeListProps) {
  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {badges.map((badge) => (
        <TooltipProvider key={badge.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="flex items-center gap-1 cursor-help">
                <Shield className="h-3 w-3" />
                <span className="capitalize">{badge.provider}</span>
                <CheckCircle2 className="h-3 w-3 text-green-600" />
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <div className="font-medium">Verified Badge</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Provider: {badge.provider}
                </div>
                <div className="text-xs text-muted-foreground">
                  Issued: {new Date(badge.issuedAt).toLocaleDateString()}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
}
