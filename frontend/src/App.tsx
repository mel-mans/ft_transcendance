import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { ChatSocketProvider } from "@/lib/chatSocket";
import MusicPlayer from "@/components/MusicPlayer";
import Index from "./pages/Index";
import FindRoommates from "./pages/FindRoommates";
import Matches from "./pages/Matches";
import Listings from "./pages/Listings";
import LoggedInListings from "./pages/loggedinlistings";
import LoggedInRoommates from "./pages/loggedinroommates";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Signup from "./pages/Signup";
import AuthCallback from "./pages/AuthCallback";
import { useAuth } from "./lib/auth";

const queryClient = new QueryClient();

const HomeRoute = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/profile" replace />;
  }

  return <Index />;
};

const RoommatesRoute = () => {
  const { user } = useAuth();
  return user ? <LoggedInRoommates /> : <FindRoommates />;
};

const ListingsRoute = () => {
  const { user } = useAuth();
  return user ? <LoggedInListings /> : <Listings />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ChatSocketProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MusicPlayer />
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/find-roommates" element={<RoommatesRoute />} />
          <Route path="/loggedin-roommates" element={<LoggedInRoommates />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/listings" element={<ListingsRoute />} />
          <Route path="/loggedin-listings" element={<LoggedInListings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/error" element={<AuthCallback />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </ChatSocketProvider>
  </QueryClientProvider>
);

export default App;
