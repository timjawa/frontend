import Link from "next/link";
import React from "react";

interface BreadcrumbProps {
  pageTitle: string;
  className?: string;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle, className }) => {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 ${className !== undefined ? className : "mb-6"}`}>
      <h2
        className="text-xl font-semibold text-gray-800 dark:text-white/90"
        x-text="pageName"
      >
        {pageTitle}
      </h2>
    </div>
  );
};

export default PageBreadcrumb;
