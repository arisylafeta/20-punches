import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  width?: string | number;
  height?: string | number;
  responsive?: boolean;
}

function Skeleton({
  className,
  width,
  height,
  responsive = false,
  ...props
}: SkeletonProps) {
  const style = {
    width: responsive ? '100%' : width,
    height: responsive ? '100%' : height,
    ...(responsive && { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const)
  }

  const wrapperStyle = responsive ? { position: 'relative', width, height } as const : undefined

  const Component = (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      style={style}
      {...props}
    />
  )

  if (responsive) {
    return (
      <div style={wrapperStyle}>
        {Component}
      </div>
    )
  }

  return Component
}

export { Skeleton }
