import { inngest } from "./client.js";
import { getInventorySource } from "../checkers/inventoryFactory.js";
import { b } from "../baml_client/index.js";
import Handlebars from "handlebars";


export const checkInventory = inngest.createFunction(
  { id: "inventory-check" },
  { event: "order.received" }, 
  async ({ event, step }) => {
    const { sku } = event.data;
    const primary = getInventorySource(false);
    try {
      const available = await primary.check(sku);
      return { available, source: primary.name };
    } catch (error) {
      const fallback = getInventorySource(true);
      const available = await fallback.check(sku);
      return { available, source: fallback.name, note: "Fallback used" };
    }
  }
);

export const classifyOrder = inngest.createFunction(
  { id: "ai-classification" },
  { event: "inventory.checked" }, 
  async ({ event, step }) => {
    const { orderId, inventoryData } = event.data;
    const result = await b.ClassifyOrder(JSON.stringify({ orderId, inventory: inventoryData }));
    return result;
  }
);


export const renderNotification = inngest.createFunction(
  { id: "render-notification" },
  { event: "ai.classified" },
  async ({ event, step }) => {
    const { decision, orderId, reason } = event.data;
    const templates: Record<string, string> = {
      Approve: " Order {{orderId}} Confirmed! Reason: {{reason}}",
      Review:  "Order {{orderId}} under review. Reason: {{reason}}",
      Reject:  "Order {{orderId}} Rejected. Reason: {{reason}}"
    };
    const template = Handlebars.compile(templates[decision] || "Update for {{orderId}}");
    return template({ orderId, reason });
  }
);


export const processOrderWorkflow = inngest.createFunction(
  { id: "main-order-workflow", idempotency: "event.data.orderId" },
  { event: "order.received" },
  async ({ event, step }) => {
    const { orderId, sku } = event.data;

    const inv = await step.run("check-inventory", () => 
      getInventorySource(false).check(sku)
    );

    const ai = await step.run("classify", () => 
      b.ClassifyOrder(JSON.stringify({ orderId, inv }))
    );

    return { status: "Workflow Complete", decision: 'ai.decision' };
  }
);