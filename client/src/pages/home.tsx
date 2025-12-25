import { usePosts } from "@/hooks/use-campus";
import { CreatePost } from "@/components/create-post";
import { PostCard } from "@/components/post-card";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { data: posts, isLoading, error } = usePosts();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive font-medium">Failed to load feed</p>
        <p className="text-muted-foreground text-sm">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-display font-bold">News Feed</h1>
        <p className="text-muted-foreground">Stay updated with campus life</p>
      </div>

      <CreatePost />

      <div className="space-y-6">
        {posts?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {posts?.length === 0 && (
          <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border">
            <p className="text-lg font-medium text-foreground">No posts yet</p>
            <p className="text-muted-foreground">Be the first to share something!</p>
          </div>
        )}
      </div>
    </div>
  );
}
