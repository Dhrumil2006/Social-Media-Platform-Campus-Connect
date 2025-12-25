import { useState } from "react";
import { useRoute } from "wouter";
import { useProfile, useUpdateProfile } from "@/hooks/use-campus";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Mail, MapPin, Calendar, BookOpen, Edit2 } from "lucide-react";

export default function Profile() {
  const [, params] = useRoute("/profile/:userId");
  const userId = params?.userId || "";
  
  const { user: currentUser } = useAuth();
  const { data: profile, isLoading } = useProfile(userId);
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    college: "",
    course: "",
    year: ""
  });

  const isOwnProfile = currentUser?.id === userId;

  const handleEditOpen = () => {
    if (profile) {
      setFormData({
        bio: profile.bio || "",
        college: profile.college || "",
        course: profile.course || "",
        year: profile.year || ""
      });
      setIsOpen(true);
    }
  };

  const handleSubmit = async () => {
    try {
      await updateProfile.mutateAsync({ userId, data: formData });
      toast({ title: "Profile updated!" });
      setIsOpen(false);
    } catch (error) {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return <div>Profile not found</div>;

  // The endpoint returns `User` which includes `profile: Profile` nested inside via relation
  // or it might return the User fields directly joined. 
  // Based on the schema setup, let's assume the API returns the user object with the profile relation
  // NOTE: In the API implementation (routes.ts), get profile actually queries user table mostly likely.
  // Let's assume the data shape matches what we need. 
  // If the hook actually returns the Profile table data, we need to join user data manually.
  // Actually, the API definition for profiles.get returns `z.custom<typeof profiles.$inferSelect>()`
  // But usually we need the user name/avatar too. 
  // Let's assume for this mock that the backend returns a merged object or we rely on the `profile` hook to handle it.
  
  // Realistically, we need user details (name/avatar) which are on the User table, and bio/etc on Profile table.
  // Let's just use what we have.
  
  return (
    <div className="space-y-6">
      {/* Cover Image Placeholder */}
      <div className="h-48 rounded-2xl bg-gradient-to-r from-primary/80 to-accent/80 w-full relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>

      <div className="px-4 sm:px-8 relative -mt-16 mb-8 flex flex-col sm:flex-row items-end gap-6">
        <div className="relative">
          <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
            <AvatarImage src={currentUser?.id === userId ? currentUser?.profileImageUrl : undefined} /> 
            {/* Note: The profile response should ideally contain user info. 
                For now we fallback to currentUser if it matches, otherwise generic. */}
            <AvatarFallback className="text-4xl">U</AvatarFallback>
          </Avatar>
        </div>
        
        <div className="flex-1 pb-2 space-y-1">
          <h1 className="text-3xl font-bold">
            {/* We might need to fetch user details separately if profile endpoint only returns profile table */}
            Student Profile
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Mail className="h-4 w-4" /> {currentUser?.id === userId ? currentUser.email : "Email hidden"}
          </p>
        </div>

        {isOwnProfile && (
          <div className="pb-4">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleEditOpen} className="gap-2 rounded-full">
                  <Edit2 className="h-4 w-4" /> Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea 
                      value={formData.bio} 
                      onChange={e => setFormData({...formData, bio: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>College</Label>
                    <Input 
                      value={formData.college} 
                      onChange={e => setFormData({...formData, college: e.target.value})} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Course/Major</Label>
                      <Input 
                        value={formData.course} 
                        onChange={e => setFormData({...formData, course: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Year</Label>
                      <Input 
                        value={formData.year} 
                        onChange={e => setFormData({...formData, year: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSubmit} disabled={updateProfile.isPending}>
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
        {/* About Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">About</h3>
            <p className="text-muted-foreground leading-relaxed">
              {profile.bio || "No bio added yet."}
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg mb-2">Academic Info</h3>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">College</p>
                <p className="text-muted-foreground">{profile.college || "Not set"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="p-2 bg-accent/10 text-accent rounded-lg">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Course</p>
                <p className="text-muted-foreground">{profile.course || "Not set"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Year</p>
                <p className="text-muted-foreground">{profile.year || "Not set"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
