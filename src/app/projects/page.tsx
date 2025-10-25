"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ProjectCard from "@/components/shared/ProjectCard";

interface ProjectMember {
  id: string;
  userId: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  status: "ACTIVE" | "COMPLETED" | "ON_HOLD";
  createdAt: string;
  owner: { name: string | null };
  members: ProjectMember[];
}

export default function ProjectsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (!response.ok) throw new Error("Failed to fetch projects");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Community Projects</h1>
          <p className="text-muted-foreground">Collaborate on shared goals</p>
        </div>
        {session && (
          <Button onClick={() => router.push("/projects/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sm:max-w-sm"
        />
        <div className="flex gap-2">
          {["all", "ACTIVE", "COMPLETED", "ON_HOLD"].map((status) => (
            <Badge
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setStatusFilter(status)}
            >
              {status === "all" ? "All" : status.replace("_", " ")}
            </Badge>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No projects found</p>
          {session && (
            <Button onClick={() => router.push("/projects/new")}>Create First Project</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              title={project.title}
              description={project.description}
              ownerName={project.owner.name || "Anonymous"}
              memberCount={project.members.length}
              status={project.status}
              createdAt={project.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
