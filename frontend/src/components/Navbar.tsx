import React from "react";

export default function Navbar() {
  return (
    <header className="bg-base-100 border-b border-base-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">Routify</h1>
            <span className="ml-4 text-sm text-base-content/70 hidden sm:block">
              Route Optimization Tool
            </span>
          </div>
        </div>
      </nav>
    </header>
  );
}
