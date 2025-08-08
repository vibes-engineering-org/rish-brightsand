"use client";

import GolfGame from "~/components/GolfGame";

export default function App() {
  return (
    <div className="w-[400px] mx-auto py-8 px-4 min-h-screen flex flex-col items-center justify-center">
      {/* TEMPLATE_CONTENT_START - Replace content below */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Mini Golf
          </h1>
          <p className="text-muted-foreground">
            18-hole course with real physics
          </p>
        </div>
        <GolfGame />
      </div>
      {/* TEMPLATE_CONTENT_END */}
    </div>
  );
}
