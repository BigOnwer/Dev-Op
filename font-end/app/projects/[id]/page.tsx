import { WorkspacePage } from "@/features/workspace/workspace-page";

export default async function ProjectWorkspacePage({ params }: PageProps<"/projects/[id]">) {
  const { id } = await params;
  return <WorkspacePage projectId={id} />;
}
