import { NextResponse } from "next/server";

export async function GET() {
  const encoder = new TextEncoder();

  let closeStream: (() => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      let isClosed = false;

      const close = () => {
        if (isClosed) return;
        isClosed = true;
        clearInterval(interval);
        clearInterval(keepAlive);
        clearTimeout(timeout);
        try {
          controller.close();
        } catch {
          // Ignore if the stream is already closed or cancelled.
        }
      };

      const enqueue = (chunk: string) => {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          close();
        }
      };

      const send = (event: string, data: string) => {
        enqueue(`event: ${event}\ndata: ${data}\n\n`);
      };

      send("connected", JSON.stringify({ ok: true }));

      const interval = setInterval(() => {
        send("tick", JSON.stringify({ at: new Date().toISOString() }));
      }, 5000);

      const keepAlive = setInterval(() => {
        enqueue(":keepalive\n\n");
      }, 15000);

      const timeout = setTimeout(() => {
        close();
      }, 60000);

      closeStream = close;
    },
    cancel() {
      closeStream?.();
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
