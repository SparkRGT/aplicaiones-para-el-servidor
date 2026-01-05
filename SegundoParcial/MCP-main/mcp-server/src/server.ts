import express from "express";
import { toolsRegistry } from "./tools/registry";

const app = express();
app.use(express.json());

// Endpoint JSON-RPC 2.0
app.post("/rpc", async (req, res) => {
  const { jsonrpc, id, method, params } = req.body ?? {};

  // Validación mínima JSON-RPC
  if (jsonrpc !== "2.0" || !method) {
    return res.json({
      jsonrpc: "2.0",
      id: id ?? null,
      error: { code: -32600, message: "Invalid Request" },
    });
  }

  try {
    if (method === "tools/list") {
      return res.json({ jsonrpc: "2.0", id, result: toolsRegistry.list() });
    }

    if (method === "tools/call") {
      const { name, arguments: args } = params ?? {};
      const result = await toolsRegistry.call(name, args);
      return res.json({ jsonrpc: "2.0", id, result });
    }

    return res.json({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: "Method not found" },
    });
  } catch (err: any) {
    return res.json({
      jsonrpc: "2.0",
      id,
      error: { code: -32000, message: err?.message ?? "Server error" },
    });
  }
});

const PORT = Number(process.env.PORT ?? 3005);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`MCP server listening on http://0.0.0.0:${PORT}`);
});
