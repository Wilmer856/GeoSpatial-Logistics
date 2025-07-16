import React from "react";

export default function ActionsPanel() {
  return (
    <div className="flex flex-col sm:inline-flex sm:flex-row rounded-lg shadow-2xs gap-4">
      <button
        type="button"
        className="py-3 px-4 inline-flex items-center gap-x-2 -mt-px -ms-px first:rounded-t-md last:rounded-b-md sm:first:rounded-s-md sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e-md text-sm font-medium focus:z-10 border shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
      >
        Add Job
      </button>
      <button
        type="button"
        className="py-3 px-4 inline-flex items-center gap-x-2 -mt-px -ms-px first:rounded-t-md last:rounded-b-md sm:first:rounded-s-md sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e-md text-sm font-medium focus:z-10 border shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
      >
        Upload CSV
      </button>
      <button
        type="button"
        className="py-3 px-4 inline-flex items-center gap-x-2 -mt-px -ms-px first:rounded-t-md last:rounded-b-md sm:first:rounded-s-md sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e-md text-sm font-medium focus:z-10 border shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
      >
        Export CSV
      </button>
      <button
        type="button"
        className="py-3 px-4 inline-flex items-center gap-x-2 -mt-px -ms-px first:rounded-t-md last:rounded-b-md sm:first:rounded-s-md sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e-md text-sm font-medium focus:z-10 border shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
      >
        Optimize
      </button>
    </div>
  );
}
