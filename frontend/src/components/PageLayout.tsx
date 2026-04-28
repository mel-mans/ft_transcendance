import retroCityBg from "@/assets/retro-city-bg.png";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const PageLayout = ({ children, className = "" }: PageLayoutProps) => {
  return (
    <div className={`min-h-screen bg-background relative overflow-hidden ${className}`}>
      {/* Retro pixel art background with color grading */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: `url(${retroCityBg})` }}
      />
      
      {/* Green/Violet color grade overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 mix-blend-overlay" />
      <div className="fixed inset-0 bg-gradient-to-tr from-secondary/15 via-transparent to-primary/15 mix-blend-color" />
      
      {/* Smooth dark overlay */}
      <div className="fixed inset-0 bg-background/60" />
      
      {/* Ambient glow effects */}
      <div className="fixed top-0 left-1/4 w-[25vw] h-[25vw] bg-primary/10 rounded-full blur-3xl animate-glow" />
      <div className="fixed bottom-0 right-1/4 w-[25vw] h-[25vw] bg-secondary/10 rounded-full blur-3xl animate-glow" style={{ animationDelay: '1.5s' }} />
      
      {/* Fixed top ticker - always visible */}
      <div className="fixed top-0 left-0 right-0 z-50 overflow-hidden py-2 bg-background/80 backdrop-blur-sm border-b border-white/5">
        <div className="top-marquee text-xs whitespace-nowrap font-medium tracking-wider opacity-70">
          <span className="text-primary">✦ WELCOME TO 42ROOMMATES</span>
          <span className="text-muted-foreground mx-6">—</span>
          <span className="text-secondary">EXCLUSIVE FOR 1337/42 STUDENTS</span>
          <span className="text-muted-foreground mx-6">—</span>
          <span className="text-primary">✦ WELCOME TO 42ROOMMATES</span>
          <span className="text-muted-foreground mx-6">—</span>
          <span className="text-secondary">EXCLUSIVE FOR 1337/42 STUDENTS</span>
          <span className="text-muted-foreground mx-6">—</span>
          <span className="text-primary">✦ WELCOME TO 42ROOMMATES</span>
          <span className="text-muted-foreground mx-6">—</span>
          <span className="text-secondary">EXCLUSIVE FOR 1337/42 STUDENTS</span>
          <span className="text-muted-foreground mx-6">—</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
