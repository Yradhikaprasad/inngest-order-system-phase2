import "dotenv/config";
import express from "express";
import { serve } from "inngest/express";
import { inngest } from "./inngest/client.js";

import { 
  checkInventory, 
  classifyOrder, 
  renderNotification, 
  processOrderWorkflow 
} from "./inngest/function.js";

const app = express();
app.use(express.json());

app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [
      checkInventory,
      classifyOrder,
      renderNotification,
      processOrderWorkflow
    ],
  })
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` Dashboard: http://localhost:8288`);
});