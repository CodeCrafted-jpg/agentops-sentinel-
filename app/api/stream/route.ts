import { NextResponse } from "next/server";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: string) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${data}\n\n`));
      };

      send("connected", JSON.stringify({ ok: true }));

      const interval = setInterval(() => {
        send("tick", JSON.stringify({ at: new Date().toISOString() }));
      }, 5000);

      const cleanup = () => {
        clearInterval(interval);
        controller.close();
      };

      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(":keepalive\n\n"));
      }, 15000);

      const originalCancel = (controller as ReadableStreamDefaultController & { cancel?: () => void }).cancel;
      (controller as ReadableStreamDefaultController & { cancel?: () => void }).cancel = () => {
        clearInterval(interval);
        clearInterval(keepAlive);
        if (originalCancel) originalCancel();
      };

      const timeout = setTimeout(() => {
        cleanup();
      }, 60000);

      controller.enqueue(encoder.encode("\n"));

      (controller as ReadableStreamDefaultController & { cancel?: () => void }).cancel = () => {
        clearInterval(interval);
        clearInterval(keepAlive);
        clearTimeout(timeout);
        controller.close();
      };
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
