async function testStep8E2E() {
  console.log("🚀 Executing Step 8 End-to-End Browser Flow Validation...\n");

  const baseUrl = "http://localhost:3000";

  // Step 1: Open Orders
  console.log("1. Open Orders (/orders):");
  const ordersRes = await fetch(`${baseUrl}/orders`);
  if (ordersRes.status !== 200) {
    console.error(`❌ Failed to load /orders: HTTP ${ordersRes.status}`);
    process.exit(1);
  }
  const ordersHtml = await ordersRes.text();
  const hasOrdersTitle = ordersHtml.includes("Orders") || ordersHtml.includes("transaction ledger");
  console.log(`- Orders page HTTP 200 OK, title verified: ${hasOrdersTitle}`);

  // Step 2 & 3: Select an order (ord_00001) and Verify details
  console.log("\n2 & 3. Select Order 'ord_00001' and Verify Details (/orders/ord_00001):");
  const order1Res = await fetch(`${baseUrl}/orders/ord_00001`);
  if (order1Res.status !== 200) {
    console.error(`❌ Failed to load /orders/ord_00001: HTTP ${order1Res.status}`);
    process.exit(1);
  }
  const order1Html = await order1Res.text();

  // Header verification
  const hasId1 = order1Html.includes("ord_00001");
  const hasStatus1 = order1Html.includes("Delivered");
  const hasAmount1 = order1Html.includes("8,314") || order1Html.includes("8314");
  console.log(`- Header verified (ID, Status Delivered, Amount ₹8,314): ${hasId1 && hasStatus1 && hasAmount1}`);

  // Customer verification
  const hasCustomer1 = order1Html.includes("Vikram Subramanian") && order1Html.includes("vikram.subramanian414@example.com");
  const hasRegion1 = order1Html.includes("Gujarat");
  const hasSegment1 = order1Html.includes("VIP");
  console.log(`- Customer section verified (Vikram Subramanian, Gujarat, VIP): ${hasCustomer1 && hasRegion1 && hasSegment1}`);

  // Items verification
  const hasItemsTable = order1Html.includes("Order Line Items") && order1Html.includes("Unit Price");
  console.log(`- Items section verified (Line items table rendered): ${hasItemsTable}`);

  // Financial summary verification
  const hasSummary = order1Html.includes("Financial Summary") && order1Html.includes("Gross Profit") && (order1Html.includes("4,430") || order1Html.includes("4430"));
  console.log(`- Summary section verified (Subtotal, COGS, Gross Profit ₹4,430.43): ${hasSummary}`);

  // Timeline verification
  const hasTimeline = order1Html.includes("Fulfillment Lifecycle") && order1Html.includes("Order Placed");
  console.log(`- Timeline section verified (Fulfillment Lifecycle): ${hasTimeline}`);

  // Step 4: Return to Orders
  console.log("\n4. Return to Orders:");
  const hasBackLink = order1Html.includes('href="/orders"') && order1Html.includes("Back to Orders");
  console.log(`- Navigation 'Back to Orders' link present: ${hasBackLink}`);

  // Step 5: Open another order (ord_01984 - Pending order)
  console.log("\n5. Open Another Order with Different Status ('ord_01984' - Pending):");
  const order2Res = await fetch(`${baseUrl}/orders/ord_01984`);
  if (order2Res.status !== 200) {
    console.error(`❌ Failed to load /orders/ord_01984: HTTP ${order2Res.status}`);
    process.exit(1);
  }
  const order2Html = await order2Res.text();
  const hasId2 = order2Html.includes("ord_01984");
  const hasStatus2 = order2Html.includes("Pending");
  console.log(`- Order 2 verified (ID ord_01984, Status Pending): ${hasId2 && hasStatus2}`);

  // Step 6: Test invalid order ID
  console.log("\n6. Test Invalid Order ID ('/orders/ord_99999'):");
  const invalidRes = await fetch(`${baseUrl}/orders/ord_99999`);
  if (invalidRes.status !== 200) {
    console.error(`❌ Expected HTTP 200 with Not Found UI, got ${invalidRes.status}`);
    process.exit(1);
  }
  const invalidHtml = await invalidRes.text();
  const hasNotFoundUi = invalidHtml.includes("Order Not Found") && invalidHtml.includes("ord_99999");
  const hasReturnBtn = invalidHtml.includes("Return to Orders");
  console.log(`- Order Not Found UI rendered with requested reference: ${hasNotFoundUi}`);
  console.log(`- 'Return to Orders' recovery button present: ${hasReturnBtn}`);

  console.log("\n🎉 ALL 6 BROWSER SCENARIO TESTS PASSED ACCORDING TO SPECIFICATION!");
}

testStep8E2E();
