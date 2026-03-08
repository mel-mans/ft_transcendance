import * as React from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];
type CarouselVariant = "default" | "cone-vertical";

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
  variant?: CarouselVariant;
  activeIndex?: number;
  autoplayDelay?: number;
  onSlideChange?: (index: number) => void;
  onSlideCountChange?: (count: number) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  variant: CarouselVariant;
  currentIndex: number;
  slideCount: number;
  setSlideCount: (count: number) => void;
  goTo: (index: number) => void;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

const Carousel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & CarouselProps>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      variant = "default",
      activeIndex,
      autoplayDelay,
      onSlideChange,
      onSlideCountChange,
      ...props
    },
    ref,
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      plugins,
    );
    const [internalIndex, setInternalIndex] = React.useState(0);
    const [slideCount, setSlideCount] = React.useState(0);
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);
    const isCone = variant === "cone-vertical";
    const isControlled = typeof activeIndex === "number";
    const currentIndex = isControlled ? activeIndex : internalIndex;
    const loop = Boolean(opts?.loop);

    const setCurrentIndex = React.useCallback(
      (next: number) => {
        const normalized = Number.isFinite(next) ? Math.max(0, next) : 0;
        if (!isControlled) {
          setInternalIndex(normalized);
        }
        onSlideChange?.(normalized);
      },
      [isControlled, onSlideChange],
    );

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) {
        return;
      }

      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
      setCurrentIndex(api.selectedScrollSnap());
      onSlideCountChange?.(api.scrollSnapList().length);
    }, [onSlideCountChange, setCurrentIndex]);

    const goTo = React.useCallback(
      (index: number) => {
        if (isCone) {
          if (slideCount <= 0) return;
          const next = loop ? ((index % slideCount) + slideCount) % slideCount : Math.min(Math.max(index, 0), slideCount - 1);
          setCurrentIndex(next);
          return;
        }

        api?.scrollTo(index);
      },
      [api, isCone, loop, setCurrentIndex, slideCount],
    );

    const scrollPrev = React.useCallback(() => {
      if (isCone) {
        if (slideCount <= 1) return;
        const next = loop
          ? (currentIndex - 1 + slideCount) % slideCount
          : Math.max(currentIndex - 1, 0);
        setCurrentIndex(next);
        return;
      }

      api?.scrollPrev();
    }, [api, currentIndex, isCone, loop, setCurrentIndex, slideCount]);

    const scrollNext = React.useCallback(() => {
      if (isCone) {
        if (slideCount <= 1) return;
        const next = loop
          ? (currentIndex + 1) % slideCount
          : Math.min(currentIndex + 1, slideCount - 1);
        setCurrentIndex(next);
        return;
      }

      api?.scrollNext();
    }, [api, currentIndex, isCone, loop, setCurrentIndex, slideCount]);

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          scrollNext();
        }
      },
      [scrollPrev, scrollNext],
    );

    React.useEffect(() => {
      if (!isCone) {
        return;
      }
      setCanScrollPrev(loop || currentIndex > 0);
      setCanScrollNext(loop || currentIndex < Math.max(slideCount - 1, 0));
    }, [currentIndex, isCone, loop, slideCount]);

    React.useEffect(() => {
      onSlideCountChange?.(slideCount);
    }, [onSlideCountChange, slideCount]);

    React.useEffect(() => {
      if (!isCone || !autoplayDelay || autoplayDelay <= 0 || slideCount <= 1) {
        return;
      }
      const timer = window.setInterval(() => {
        const next = loop
          ? (currentIndex + 1) % slideCount
          : Math.min(currentIndex + 1, slideCount - 1);
        setCurrentIndex(next);
      }, autoplayDelay);

      return () => window.clearInterval(timer);
    }, [autoplayDelay, currentIndex, isCone, loop, setCurrentIndex, slideCount]);

    React.useEffect(() => {
      if (slideCount <= 0 || currentIndex <= slideCount - 1) {
        return;
      }
      setCurrentIndex(slideCount - 1);
    }, [currentIndex, setCurrentIndex, slideCount]);

    React.useEffect(() => {
      if (!api || !setApi) {
        return;
      }

      setApi(api);
    }, [api, setApi]);

    React.useEffect(() => {
      if (!api || isCone) {
        return;
      }

      onSelect(api);
      api.on("reInit", onSelect);
      api.on("select", onSelect);

      return () => {
        api?.off("select", onSelect);
      };
    }, [api, isCone, onSelect]);

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
          variant,
          currentIndex,
          slideCount,
          setSlideCount,
          goTo,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  },
);
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { carouselRef, orientation, variant, setSlideCount } = useCarousel();
    const items = React.Children.toArray(children);
    const [rotation, setRotation] = React.useState(0);
    const rotationRef = React.useRef(0);
    const rafRef = React.useRef<number>(0);
    const isDraggingRef = React.useRef(false);
    const lastXRef = React.useRef(0);
    const velocityRef = React.useRef(-0.05);

    React.useEffect(() => {
      setSlideCount(items.length);
    }, [items.length, setSlideCount]);

    React.useEffect(() => {
      rotationRef.current = rotation;
    }, [rotation]);

    React.useEffect(() => {
      if (variant !== "cone-vertical") {
        return;
      }

      const animate = () => {
        if (!isDraggingRef.current) {
          velocityRef.current *= 0.985;
          if (Math.abs(velocityRef.current) < 0.005) {
            velocityRef.current = -0.05;
          }
          const next = rotationRef.current + velocityRef.current;
          rotationRef.current = next;
          setRotation(next);
        }
        rafRef.current = window.requestAnimationFrame(animate);
      };

      rafRef.current = window.requestAnimationFrame(animate);
      return () => window.cancelAnimationFrame(rafRef.current);
    }, [variant]);

    if (variant === "cone-vertical") {
      const count = Math.max(items.length, 1);
      const angleStep = 360 / count;
      const baseRadius = 180;

      const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        isDraggingRef.current = true;
        lastXRef.current = event.clientX;
        velocityRef.current = 0;
      };

      const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current) {
          return;
        }
        const dx = event.clientX - lastXRef.current;
        if (Math.abs(dx) < 2) {
          return;
        }
        const delta = dx * 0.2;
        const clampedVelocity = Math.max(-10, Math.min(10, delta * 0.25));
        velocityRef.current = clampedVelocity;
        const next = rotationRef.current + delta;
        rotationRef.current = next;
        setRotation(next);
        lastXRef.current = event.clientX;
      };

      const handlePointerUp = () => {
        isDraggingRef.current = false;
      };

      return (
        <div ref={carouselRef} className="overflow-visible">
          <div className="pointer-events-none absolute bottom-1 left-1/2 h-10 w-56 -translate-x-1/2 rounded-full bg-primary/25 blur-2xl" />
          <div className="pointer-events-none absolute bottom-4 left-1/2 h-6 w-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
          <div
            ref={ref}
            className={cn(
              "relative mx-auto h-[24rem] w-[340px] cursor-grab select-none active:cursor-grabbing sm:h-[26rem] sm:w-[380px] md:h-[28rem] md:w-[430px] [perspective:950px]",
              className,
            )}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            {...props}
          >
            <div
              className="absolute inset-0 [transform-style:preserve-3d]"
              style={{
                transform: `rotateX(-12deg) rotateY(${rotation}deg)`,
                transition: isDraggingRef.current ? "none" : undefined,
              }}
            >
              {items.map((child, index) => {
                if (!React.isValidElement(child)) {
                  return child;
                }

                const angle = index * angleStep;
                const yOffset = -index * 8;
                const itemRadius = baseRadius - index * 8;
                const scale = 1 - index * 0.03;
                const childStyle = (child.props as { style?: React.CSSProperties }).style;

                return React.cloneElement(child as React.ReactElement, {
                  className: cn(
                    "absolute left-1/2 top-1/2 w-full max-w-[10rem] sm:max-w-[11rem] md:max-w-[12rem] -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ease-out will-change-transform [filter:drop-shadow(0_0_18px_rgba(34,197,94,0.24))]",
                    (child.props as { className?: string }).className,
                  ),
                  style: {
                    ...childStyle,
                    transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${itemRadius}px) translateY(${yOffset}px) scale(${scale})`,
                  },
                });
              })}
            </div>

            <div
              className="pointer-events-none absolute bottom-2 left-1/2 h-3 w-56 -translate-x-1/2 rounded-full opacity-40"
              style={{
                background: "radial-gradient(ellipse, hsl(var(--primary) / 0.4) 0%, transparent 70%)",
              }}
            />
          </div>
        </div>
      );
    }

    return (
      <div ref={carouselRef} className="overflow-hidden">
        <div
          ref={ref}
          className={cn("flex", orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col", className)}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  },
);
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { orientation, variant } = useCarousel();

    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="slide"
        className={cn(
          "min-w-0 shrink-0 grow-0",
          variant === "cone-vertical" ? "basis-auto pt-0 pl-0" : "basis-full",
          variant === "cone-vertical" ? "" : orientation === "horizontal" ? "pl-4" : "pt-4",
          className,
        )}
        {...props}
      />
    );
  },
);
CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, scrollPrev, canScrollPrev } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute h-8 w-8 rounded-full",
          orientation === "horizontal"
            ? "-left-12 top-1/2 -translate-y-1/2"
            : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
          className,
        )}
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        {...props}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Previous slide</span>
      </Button>
    );
  },
);
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, scrollNext, canScrollNext } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute h-8 w-8 rounded-full",
          orientation === "horizontal"
            ? "-right-12 top-1/2 -translate-y-1/2"
            : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
          className,
        )}
        disabled={!canScrollNext}
        onClick={scrollNext}
        {...props}
      >
        <ArrowRight className="h-4 w-4" />
        <span className="sr-only">Next slide</span>
      </Button>
    );
  },
);
CarouselNext.displayName = "CarouselNext";

export { type CarouselApi, Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext };
