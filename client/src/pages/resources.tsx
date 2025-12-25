import { useState } from "react";
import { useResources, useCreateResource } from "@/hooks/use-campus";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Book, FileText, Link as LinkIcon, Download, Loader2, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const CATEGORIES = ["Notes", "Papers", "Assignments", "Books", "Other"];

export default function Resources() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const { data: resources, isLoading } = useResources(selectedCategory);
  
  // Create Modal State
  const [isOpen, setIsOpen] = useState(false);
  const createResource = useCreateResource();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Notes",
    fileUrl: ""
  });

  const handleSubmit = async () => {
    try {
      await createResource.mutateAsync(formData);
      toast({ title: "Resource shared successfully!" });
      setIsOpen(false);
      setFormData({ title: "", description: "", category: "Notes", fileUrl: "" });
    } catch (error) {
      toast({ title: "Failed to share resource", variant: "destructive" });
    }
  };

  const getIcon = (cat: string) => {
    switch (cat) {
      case "Notes": return <FileText className="h-5 w-5 text-blue-500" />;
      case "Books": return <Book className="h-5 w-5 text-purple-500" />;
      case "Papers": return <FileText className="h-5 w-5 text-orange-500" />;
      default: return <LinkIcon className="h-5 w-5 text-green-500" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Study Resources</h1>
          <p className="text-muted-foreground mt-1">Share and find materials for your courses</p>
        </div>
        
        {user && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                <Plus className="h-4 w-4" /> Share Resource
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share a Study Resource</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input 
                    placeholder="e.g. Calculus Midterm Notes" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={val => setFormData({...formData, category: val})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>URL (File Link)</Label>
                  <Input 
                    placeholder="https://drive.google.com/..." 
                    value={formData.fileUrl} 
                    onChange={e => setFormData({...formData, fileUrl: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea 
                    placeholder="Brief details about this resource..." 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSubmit} disabled={createResource.isPending}>
                  {createResource.isPending ? "Sharing..." : "Share Resource"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        <Button 
          variant={!selectedCategory ? "default" : "outline"}
          onClick={() => setSelectedCategory(undefined)}
          className="rounded-full"
        >
          All
        </Button>
        {CATEGORIES.map(cat => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat)}
            className="rounded-full"
          >
            {cat}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources?.map((resource) => (
            <div 
              key={resource.id} 
              className="bg-card hover:bg-accent/5 transition-colors border border-border/50 rounded-xl p-5 shadow-sm hover:shadow-md group flex gap-4 items-start"
            >
              <div className="p-3 bg-background rounded-xl border border-border shadow-sm">
                {getIcon(resource.category)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate pr-2">{resource.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {resource.description || "No description provided."}
                </p>
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <span className="font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {resource.category}
                  </span>
                  <span>•</span>
                  <span>{resource.author.firstName}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(resource.createdAt!), { addSuffix: true })}</span>
                </div>
              </div>
              <a 
                href={resource.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <Download className="h-5 w-5" />
              </a>
            </div>
          ))}
          
          {resources?.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No resources found in this category.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
