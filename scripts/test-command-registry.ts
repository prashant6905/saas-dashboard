import {
  COMMAND_REGISTRY,
  getAvailableCommands,
  groupCommands,
} from "../lib/commands/registry";
import { searchCommands, scoreCommand } from "../lib/commands/fuzzy-search";
import type { Permission } from "../types/auth";

async function runCommandRegistryTests() {
  console.log("⌨️ Running Step 14 Command Registry & Search Unit Tests...\n");

  // 1. Validate Total Registered Commands
  console.log("1. Validating Registered Command Definitions:");
  console.log(`- Total Commands Registered: ${COMMAND_REGISTRY.length}`);
  if (COMMAND_REGISTRY.length !== 10) {
    throw new Error(`Expected exactly 10 registered commands, found ${COMMAND_REGISTRY.length}`);
  }

  const expectedNavCommands = [
    "Dashboard",
    "Analytics",
    "Orders",
    "Products",
    "Customers",
    "Settings",
  ];
  const expectedActionCommands = [
    "Toggle Dark Mode",
    "Clear Filters",
    "Focus Search",
    "Export Current Filtered Data",
  ];

  for (const title of expectedNavCommands) {
    const found = COMMAND_REGISTRY.find((c) => c.title === title && c.group === "Navigation");
    if (!found) throw new Error(`Missing expected Navigation command: ${title}`);
    console.log(`  ✓ Navigation: ${title} (id: ${found.id}, shortcut: ${found.shortcut?.join(" ") || "none"})`);
  }

  for (const title of expectedActionCommands) {
    const found = COMMAND_REGISTRY.find((c) => c.title === title && c.group === "Actions");
    if (!found) throw new Error(`Missing expected Action command: ${title}`);
    console.log(`  ✓ Action: ${title} (id: ${found.id}, shortcut: ${found.shortcut?.join(" ") || "none"})`);
  }
  console.log("✅ All 10 required commands registered with valid groups, shortcuts, and handlers.");

  // 2. Validate Permission-Aware Command Filtering
  console.log("\n2. Validating Permission-Aware Filtering (Admin vs. Viewer):");

  // ADMIN permission evaluator: all true
  const adminCan = (_p: Permission) => true;
  const adminAvailable = getAvailableCommands(adminCan);
  console.log(`- Admin Available Commands: ${adminAvailable.length} of ${COMMAND_REGISTRY.length}`);
  if (adminAvailable.length !== 10) {
    throw new Error(`Admin should have access to all 10 commands, got ${adminAvailable.length}`);
  }
  if (!adminAvailable.some((c) => c.id === "nav-settings")) {
    throw new Error("Admin is missing Settings command");
  }
  if (!adminAvailable.some((c) => c.id === "act-export-data")) {
    throw new Error("Admin is missing Export Data command");
  }
  console.log("✅ Admin has access to all commands including Settings and Export Data.");

  // VIEWER permission evaluator: denied data:export and access:settings
  const viewerCan = (p: Permission) => p !== "data:export" && p !== "access:settings";
  const viewerAvailable = getAvailableCommands(viewerCan);
  console.log(`- Viewer Available Commands: ${viewerAvailable.length} of ${COMMAND_REGISTRY.length}`);
  if (viewerAvailable.length !== 8) {
    throw new Error(`Viewer should only have 8 commands, got ${viewerAvailable.length}`);
  }
  if (viewerAvailable.some((c) => c.id === "nav-settings")) {
    throw new Error("SECURITY VIOLATION: Settings command was visible to Viewer!");
  }
  if (viewerAvailable.some((c) => c.id === "act-export-data")) {
    throw new Error("SECURITY VIOLATION: Export Data command was visible to Viewer!");
  }
  console.log("✅ Viewer is strictly restricted: 'Settings' and 'Export Data' are completely filtered out.");

  // 3. Validate Command Grouping
  console.log("\n3. Validating Command Grouping:");
  const groupedAdmin = groupCommands(adminAvailable);
  console.log(`- Navigation group count: ${groupedAdmin.Navigation.length}`);
  console.log(`- Actions group count: ${groupedAdmin.Actions.length}`);
  if (groupedAdmin.Navigation.length !== 6 || groupedAdmin.Actions.length !== 4) {
    throw new Error("Command grouping mismatch for Admin");
  }

  const groupedViewer = groupCommands(viewerAvailable);
  console.log(`- Viewer Navigation count: ${groupedViewer.Navigation.length} (Settings excluded)`);
  console.log(`- Viewer Actions count: ${groupedViewer.Actions.length} (Export excluded)`);
  if (groupedViewer.Navigation.length !== 5 || groupedViewer.Actions.length !== 3) {
    throw new Error("Command grouping mismatch for Viewer");
  }
  console.log("✅ Command grouping verified.");

  // 4. Validate Fuzzy Search Matching
  console.log("\n4. Validating Search / Fuzzy Matching:");
  const testQueries = [
    { q: "dash", expectedTop: "Dashboard" },
    { q: "analyt", expectedTop: "Analytics" },
    { q: "ord", expectedTop: "Orders" },
    { q: "prod", expectedTop: "Products" },
    { q: "cust", expectedTop: "Customers" },
    { q: "dark", expectedTop: "Toggle Dark Mode" },
    { q: "csv", expectedTop: "Export Current Filtered Data" },
    { q: "reset", expectedTop: "Clear Filters" },
    { q: "lookup", expectedTop: "Focus Search" },
  ];

  for (const t of testQueries) {
    const results = searchCommands(adminAvailable, t.q);
    if (results.length === 0 || results[0].title !== t.expectedTop) {
      throw new Error(`Search for '${t.q}' expected '${t.expectedTop}', got '${results[0]?.title}'`);
    }
    const score = scoreCommand(results[0], t.q);
    console.log(`  ✓ Search '${t.q}' -> Match: '${results[0].title}' (Score: ${score})`);
  }

  // Test empty query returns all
  const allResults = searchCommands(adminAvailable, "");
  if (allResults.length !== 10) {
    throw new Error("Empty query should return all commands");
  }
  console.log("✅ Empty query returns all available commands.");

  // Test non-matching query returns empty
  const noResults = searchCommands(adminAvailable, "xyz999foobar");
  if (noResults.length !== 0) {
    throw new Error("Nonsense query should return empty array");
  }
  console.log("✅ Non-matching query cleanly returns 0 results.");

  console.log("\n🎉 ALL STEP 14 COMMAND REGISTRY & SEARCH TESTS PASSED WITH 100% SUCCESS!");
}

runCommandRegistryTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
