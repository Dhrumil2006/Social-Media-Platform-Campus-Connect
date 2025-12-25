import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Layout from "@/components/layout";
import Home from "@/pages/home";
import Resources from "@/pages/resources";
import Events from "@/pages/events";
import Profile from "@/pages/profile";
import PostDetail from "@/pages/post-detail";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/resources" component={Resources} />
        <Route path="/events" component={Events} />
        <Route path="/profile/:userId" component={Profile} />
        <Route path="/posts/:id" component={PostDetail} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
