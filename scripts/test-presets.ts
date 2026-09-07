import { SEED_DATA } from "../lib/data/seed-data";
import { getDateFilterRange, DatePresetKey } from "../components/dashboard/date-filter-bar";
import {
  comparePeriods,
  getRevenueByDay,
  getRevenueByMonth,
  getRevenueByCategory,
  getRevenueByRegion,
  getTopProducts,
} from "../lib/analytics";

for (const preset of ["7d", "30d", "90d", "12m"] as DatePresetKey[]) {
  const range = getDateFilterRange(preset);
  const filter = { dateRange: { startDate: range.startDate, endDate: range.endDate } };
  const comp = comparePeriods(SEED_DATA, filter);
  const daily = preset === "12m" ? getRevenueByMonth(SEED_DATA, filter) : getRevenueByDay(SEED_DATA, filter);
  const cats = getRevenueByCategory(SEED_DATA, filter);
  const regs = getRevenueByRegion(SEED_DATA, filter);
  const prods = getTopProducts(SEED_DATA, filter, 5);
  console.log(`=== PRESET: ${preset} (${range.label}) ===`);
  console.log(`Rev: $${comp.revenue.current} vs $${comp.revenue.previous} (${comp.revenue.percentageChange}%)`);
  console.log(`Orders: ${comp.orders.current} vs ${comp.orders.previous} (${comp.orders.percentageChange}%)`);
  console.log(`Custs: ${comp.customers.current} vs ${comp.customers.previous} (${comp.customers.percentageChange}%)`);
  console.log(`AOV: $${comp.averageOrderValue.current} vs $${comp.averageOrderValue.previous} (${comp.averageOrderValue.percentageChange}%)`);
  console.log(`Trend points: ${daily.length}, Categories: ${cats.length}, Regions: ${regs.length}, Top products: ${prods.length}`);
}

console.log("\n=== TESTING COMBINATION: 30d + Maharashtra + Electronics + Delivered ===");
const range30d = getDateFilterRange("30d");
const electronicsCat = SEED_DATA.categories.find((c) => c.name === "Electronics");
const comboFilter = {
  dateRange: { startDate: range30d.startDate, endDate: range30d.endDate },
  regions: ["Maharashtra" as const],
  categories: electronicsCat ? [electronicsCat.id] : [],
  statuses: ["Delivered" as const],
};
const comboComp = comparePeriods(SEED_DATA, comboFilter);
const comboDaily = getRevenueByDay(SEED_DATA, comboFilter);
const comboCats = getRevenueByCategory(SEED_DATA, comboFilter);
const comboRegs = getRevenueByRegion(SEED_DATA, comboFilter);
const comboProds = getTopProducts(SEED_DATA, comboFilter, 5);

console.log(`Combo Rev: ₹${comboComp.revenue.current} vs ₹${comboComp.revenue.previous} (${comboComp.revenue.percentageChange}%)`);
console.log(`Combo Orders: ${comboComp.orders.current} vs ${comboComp.orders.previous} (${comboComp.orders.percentageChange}%)`);
console.log(`Combo Daily points: ${comboDaily.length}, Categories: ${comboCats.length}, Regions: ${comboRegs.length}, Top products: ${comboProds.length}`);
