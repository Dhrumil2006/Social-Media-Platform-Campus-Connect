import { useState } from "react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Heart, Share2, MoreHorizontal, FileText, Link as LinkIcon, Trash2 } from "lucide-react";
import { 
  type Post, 
  type Comment, 
  type Like,
  type User 
} from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToggleLike, useCreateComment, useDeletePost } from "@/hooks/use-campus";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type PostWithDetails = Post & { 
  author: User; 
  likesCount: number; 
  commentsCount: number;
  comments?: (Comment & { author: User })[];
};

interface PostCardProps {
  post: PostWithDetails;
  isDetailView?: boolean;
}

export function PostCard({ post, isDetailView = false }: PostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const toggleLike = useToggleLike();
  const createComment = useCreateComment();
  const deletePost = useDeletePost();
  
  const [commentText, setCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(false); // In a real app, check if user liked from API

  const handleLike = () => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be signed in to like posts." });
      return;
    }
    toggleLike.mutate(post.id);
    setIsLiked(!isLiked);
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    createComment.mutate(
      { postId: post.id, content: commentText },
      { onSuccess: () => setCommentText("") }
    );
  };

  const handleDelete = () => {
    deletePost.mutate(post.id, {
      onSuccess: () => toast({ title: "Post deleted" })
    });
  };

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.authorId}`}>
            <Avatar className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
              <AvatarImage src={post.author.profileImageUrl || undefined} />
              <AvatarFallback>{post.author.firstName?.[0]}{post.author.lastName?.[0]}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link href={`/profile/${post.authorId}`} className="font-semibold hover:underline">
              {post.author.firstName} {post.author.lastName}
            </Link>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt!), { addSuffix: true })}
            </p>
          </div>
        </div>

        {user && user.id === post.authorId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-2 space-y-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>

        {/* Media Attachments */}
        {post.type === 'image' && post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="rounded-xl overflow-hidden border border-border/50">
            <img 
              src={post.mediaUrls[0]} 
              alt="Post attachment" 
              className="w-full h-auto object-cover max-h-[500px]" 
            />
          </div>
        )}

        {post.type === 'link' && post.mediaUrls && post.mediaUrls.length > 0 && (
          <a 
            href={post.mediaUrls[0]} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-border hover:bg-muted transition-colors"
          >
            <div className="p-2 bg-background rounded-lg text-primary">
              <LinkIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-primary hover:underline">
                {post.mediaUrls[0]}
              </p>
              <p className="text-xs text-muted-foreground">External Link</p>
            </div>
          </a>
        )}

        {post.type === 'pdf' && post.mediaUrls && post.mediaUrls.length > 0 && (
          <a 
            href={post.mediaUrls[0]} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
          >
            <div className="p-2 bg-white dark:bg-red-950 rounded-lg text-red-500">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-foreground">
                Document Attachment
              </p>
              <p className="text-xs text-muted-foreground">PDF Document</p>
            </div>
          </a>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-border/50 flex items-center gap-6 text-sm text-muted-foreground">
        <button 
          onClick={handleLike}
          className={cn(
            "flex items-center gap-2 transition-colors hover:text-red-500",
            isLiked && "text-red-500"
          )}
        >
          <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
          <span>{post.likesCount || 0}</span>
        </button>

        <Link href={`/posts/${post.id}`} className="flex items-center gap-2 hover:text-primary transition-colors">
          <MessageCircle className="h-5 w-5" />
          <span>{post.commentsCount || 0}</span>
        </Link>

        <button className="flex items-center gap-2 hover:text-primary transition-colors ml-auto">
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      {/* Comments Section (Only in Detail View) */}
      {isDetailView && (
        <div className="bg-muted/30 border-t border-border/50 p-4 space-y-4">
          <h3 className="font-semibold text-sm">Comments</h3>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {post.comments?.map((comment) => (
              <div key={comment.id} className="flex gap-3 text-sm group">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src={comment.author.profileImageUrl || undefined} />
                  <AvatarFallback>{comment.author.firstName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="bg-background border border-border/50 rounded-2xl rounded-tl-none p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs">
                        {comment.author.firstName} {comment.author.lastName}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt!), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-foreground/90">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {(!post.comments || post.comments.length === 0) && (
              <p className="text-center text-muted-foreground text-sm py-4">No comments yet. Be the first!</p>
            )}
          </div>

          {user && (
            <form onSubmit={handleComment} className="flex gap-3 pt-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profileImageUrl || undefined} />
                <AvatarFallback>{user.firstName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input 
                  placeholder="Write a comment..." 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="rounded-full bg-background border-border/50 focus:border-primary"
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={createComment.isPending || !commentText.trim()}
                  className="rounded-full px-4"
                >
                  Send
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
