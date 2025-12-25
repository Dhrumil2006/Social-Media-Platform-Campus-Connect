import { useRoute } from "wouter";
import { usePost } from "@/hooks/use-campus";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function PostDetail() {
  const [, params] = useRoute("/posts/:id");
  const id = parseInt(params?.id || "0");
  const { data: post, isLoading, error } = usePost(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive font-medium">Post not found</p>
        <Button asChild variant="link" className="mt-2">
          <Link href="/">Back to Feed</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="-ml-4 gap-2 text-muted-foreground hover:text-foreground">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" /> Back to Feed
          </Link>
        </Button>
      </div>

      <PostCard post={post} isDetailView={true} />
    </div>
  );
}
