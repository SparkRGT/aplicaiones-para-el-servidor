import { Injectable } from "@nestjs/common";
import axios from "axios";
import http from "http";

@Injectable()
export class McpClientService {
  private readonly url =
    process.env.MCP_RPC_URL ?? "http://host.docker.internal:3005/rpc";

  // 🔥 CLAVE: desactivar keepAlive
  private readonly httpAgent = new http.Agent({
    keepAlive: false,
  });

  private readonly client = axios.create({
    timeout: 15000, // Aumentado a 15 segundos para evitar timeouts
    httpAgent: this.httpAgent,
  });

  async callTool(name: string, args: any) {
    try {
      const r = await this.client.post(this.url, {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: { name, arguments: args },
      });

      if (r.data?.error) {
        throw new Error(
          `MCP tool "${name}" failed: ${JSON.stringify(r.data.error)}`
        );
      }

      return r.data.result;
    } catch (err: any) {
      // 🔎 Error real
      throw new Error(
        `MCP tool "${name}" failed: ${err?.message ?? String(err)}`
      );
    }
  }

  async listTools() {
    const r = await this.client.post(this.url, {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/list",
      params: {},
    });

    if (r.data?.error) {
      throw new Error(`MCP tools/list failed: ${JSON.stringify(r.data.error)}`);
    }

    return r.data.result;
  }
}
