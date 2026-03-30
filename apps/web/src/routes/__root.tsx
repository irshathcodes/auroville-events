import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { Toaster } from "@/components/ui/sonner";

import appCss from "../index.css?url";
import { TooltipProvider } from "@/components/ui/tooltip";

export interface RouterAppContext { }

const SITE_URL = "https://events.auroville.org";

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, maximum-scale=1",
      },
      {
        title: "Auroville Events",
      },
      {
        name: "description",
        content: "Discover workshops, events, and classes happening in Auroville, India",
      },
      // OG base tags
      {
        property: "og:site_name",
        content: "Auroville Events",
      },
      {
        property: "og:locale",
        content: "en_US",
      },
      // Twitter card defaults
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      // Theme color
      {
        name: "theme-color",
        content: "#ffffff",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        href: "/favicon.ico",
      },
      {
        rel: "canonical",
        href: SITE_URL,
      },
    ],
  }),

  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <TooltipProvider>
          <div className="grid h-svh grid-rows-[auto_1fr]">
            <Outlet />
          </div>
          <Toaster richColors />
          <Scripts />
        </TooltipProvider>
      </body>
    </html>
  );
}
