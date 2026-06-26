import {
  Boxes,
  Database,
  HardDrive,
  Server,
  Sparkles,
} from "lucide-react";
import type { ElementType } from "react";
import type { Target } from "./cloudStudioDomain";

export * from "./cloudStudioDomain";

export const targetIcons: Record<Target, ElementType> = {
  VM: Server,
  Kubernetes: Boxes,
  Database: Database,
  Storage: HardDrive,
  "AI Endpoint": Sparkles,
};
