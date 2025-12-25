import { useState } from "react";
import { useEvents, useCreateEvent } from "@/hooks/use-campus";
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
import { Calendar as CalendarIcon, MapPin, Clock, Plus, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function Events() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: events, isLoading } = useEvents();
  
  const [isOpen, setIsOpen] = useState(false);
  const createEvent = useCreateEvent();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: ""
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.date || !formData.location) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    try {
      await createEvent.mutateAsync(formData);
      toast({ title: "Event created successfully!" });
      setIsOpen(false);
      setFormData({ title: "", description: "", location: "", date: "" });
    } catch (error) {
      toast({ title: "Failed to create event", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Campus Events</h1>
          <p className="text-muted-foreground mt-1">Discover seminars, workshops, and student fests</p>
        </div>
        
        {user && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full gap-2 shadow-lg shadow-accent/20 bg-accent hover:bg-accent/90">
                <Plus className="h-4 w-4" /> Create Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Announce an Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Event Title</Label>
                  <Input 
                    placeholder="e.g. Annual Tech Symposium" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date & Time</Label>
                    <Input 
                      type="datetime-local"
                      value={formData.date} 
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input 
                      placeholder="e.g. Auditorium B" 
                      value={formData.location} 
                      onChange={e => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="What's this event about?" 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSubmit} disabled={createEvent.isPending}>
                  {createEvent.isPending ? "Creating..." : "Create Event"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events?.map((event) => (
            <div 
              key={event.id} 
              className="group bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Decorative Header */}
              <div className="h-24 bg-gradient-to-br from-primary/80 to-accent/80 relative">
                <div className="absolute -bottom-4 left-4 bg-background p-3 rounded-xl border border-border shadow-sm">
                  <CalendarIcon className="h-6 w-6 text-primary" />
                </div>
              </div>
              
              <div className="pt-8 px-5 pb-5 space-y-4">
                <div>
                  <h3 className="font-bold text-lg leading-tight mb-1">{event.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary/70" />
                    <span>{format(new Date(event.date), "PPP p")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-accent/70" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 mt-4">
                  <span>Organized by {event.author.firstName}</span>
                  <Button variant="ghost" size="sm" className="h-8 text-xs hover:text-primary">
                    Details
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {events?.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No upcoming events.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
