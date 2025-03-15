import {
    Dialog,
    DialogTrigger,
  } from "@/components/ui/dialog"
  import {
    Tooltip,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"

import React from "react"
import { DialogProps, DialogTriggerProps } from "@radix-ui/react-dialog"
import { TooltipProps, TooltipProviderProps, TooltipTriggerProps } from "@radix-ui/react-tooltip"
export const DialogTooltip = React.forwardRef<
  HTMLDivElement,
  { 
    children: React.ReactNode 
    dialogProps?: DialogProps 
    TooltipProviderProps?: TooltipProviderProps; tooltipProps?: TooltipProps 
  }
>(({ children, dialogProps, TooltipProviderProps, tooltipProps,  }, ref) => {
  return (
    <Dialog {...dialogProps}>
      <TooltipProvider {...TooltipProviderProps}>
        <Tooltip {...tooltipProps}>
          <div ref={ref}>
            {children}
          </div>
        </Tooltip>
      </TooltipProvider>
    </Dialog>
  );
});

export const DialogTooltipTrigger = React.forwardRef<
  HTMLDivElement,
  { 
    children: React.ReactNode;
    dialogTriggerProps?: DialogTriggerProps & React.RefAttributes<HTMLButtonElement>
    tooltipTriggerProps?: TooltipTriggerProps & React.RefAttributes<HTMLButtonElement>
  }
>(({ children, dialogTriggerProps, tooltipTriggerProps }, ref) => {
  return (
    <DialogTrigger {...dialogTriggerProps}>
        <TooltipTrigger {...tooltipTriggerProps}>
          <div ref={ref}>
            {children}
          </div>
        </TooltipTrigger>
    </DialogTrigger>
  );
});
