export * from "./nav";
export * from "./ecommerce";

export interface WorkspaceConfig {
  name: string;
  plan: string;
  role: "ADMIN" | "VIEWER";
}
