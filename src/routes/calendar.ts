import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import calendarHtml from "../calendar.html?raw";

export const Route = createFileRoute("/calendar")({
  server: {
    handlers: {
      GET: () =>
        new Response(calendarHtml, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "X-Robots-Tag": "noindex, nofollow",
          },
        }),
    },
  },
});
