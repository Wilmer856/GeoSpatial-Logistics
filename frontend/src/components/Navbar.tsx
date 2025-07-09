import React from "react";

export default function Navbar() {
  return (
    <header className="relative flex flex-wrap sm:justify-start sm:flex-nowrap w-full text-sm py-3 bg-base-100 text-base-content">
      <nav className="max-w-[85rem] w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center justify-between">
          <a
            className="flex-none text-2xl font-semibold focus:outline-hidden focus:opacity-80"
            href="#"
            aria-label="Brand"
          >
            Routify
          </a>
          <div className="sm:hidden">
            <button
              type="button"
              className="hs-collapse-toggle relative size-9 flex justify-center items-center gap-x-2 rounded-lg border border-base-200 bg-base-100 text-base-content shadow-2xs hover:bg-base-200 focus:outline-hidden focus:bg-base-200 disabled:opacity-50 disabled:pointer-events-none"
              id="hs-navbar-example-collapse"
              aria-expanded="false"
              aria-controls="hs-navbar-example"
              aria-label="Toggle navigation"
              data-hs-collapse="#hs-navbar-example"
            >
              {/* Hamburger/cross SVG icons unchanged */}
              <svg
                className="hs-collapse-open:hidden shrink-0 size-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" x2="21" y1="6" y2="6" />
                <line x1="3" x2="21" y1="12" y2="12" />
                <line x1="3" x2="21" y1="18" y2="18" />
              </svg>
              <svg
                className="hs-collapse-open:block hidden shrink-0 size-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
              <span className="sr-only">Toggle navigation</span>
            </button>
          </div>
        </div>
        <div
          id="hs-navbar-example"
          className="hidden hs-collapse overflow-hidden transition-all duration-300 basis-full grow sm:block"
          aria-labelledby="hs-navbar-example-collapse"
        >
          <div className="flex flex-col gap-5 mt-5 sm:flex-row sm:items-center sm:justify-end sm:mt-0 sm:ps-5">
            <a
              className="font-medium text-primary focus:outline-hidden"
              href="/"
              aria-current="page"
            >
              Home
            </a>
            <a
              className="font-medium text-base-content/70 hover:text-primary focus:outline-hidden focus:text-primary"
              href="#"
            >
              Account
            </a>
            <a
              className="font-medium text-base-content/70 hover:text-primary focus:outline-hidden focus:text-primary"
              href="#"
            >
              Work
            </a>
            <a
              className="font-medium text-base-content/70 hover:text-primary focus:outline-hidden focus:text-primary"
              href="#"
            >
              Blog
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
