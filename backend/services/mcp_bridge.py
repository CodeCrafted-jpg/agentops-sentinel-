"""
Bridge for letting the diagnosis agent call out to MCP servers (e.g. a
SigNoz MCP tool, or an internal runbook/docs server) while investigating
a trace.

Phase 0: interface skeleton only, no live connections.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class McpBridge:
    server_url: str

    async def call_tool(self, tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        """Invoke a tool on the connected MCP server.

        Not implemented in Phase 0.
        """
        raise NotImplementedError("McpBridge.call_tool: implemented in a later phase")
