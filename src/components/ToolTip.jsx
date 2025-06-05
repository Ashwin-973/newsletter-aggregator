import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function ToolTip({children,info}) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        {/* <TooltipTrigger asChild> */}
        <TooltipTrigger>
          {children}
        </TooltipTrigger>
        <TooltipContent className="px-2 py-1 text-xs">
          {info}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
