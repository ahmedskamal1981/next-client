"use client";

import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";

export default function PDFViewer({
  pdfUrl,
  activeKey,
}: {
  pdfUrl: string;
  activeKey: string | null;
}) {
  const [numPages, setNumPages] = useState<number | null>(null);

  useEffect(() => {
    if (!activeKey) {
      // Clear all highlights when no active key
      const textSpans = document.querySelectorAll<HTMLSpanElement>(
        ".react-pdf__Page__textContent span"
      );
      textSpans.forEach((span) => {
        span.style.backgroundColor = "transparent";
        span.style.color = "";
      });
      return;
    }

    const interval = setInterval(() => {
      const textSpans = document.querySelectorAll<HTMLSpanElement>(
        ".react-pdf__Page__textContent span"
      );
      if (textSpans.length === 0) return;

      let foundFirstMatch = false;
      let hasMatches = false;

      textSpans.forEach((span) => {
        const text = span.textContent?.toLowerCase() || "";
        const searchText = activeKey.toLowerCase();

        if (text.includes(searchText)) {
          hasMatches = true;
          span.style.backgroundColor = "#ffeb3b"; // Light yellow
          span.style.borderRadius = "2px";
          span.style.color = "#000";
          span.style.padding = "0 2px";

          if (!foundFirstMatch) {
            foundFirstMatch = true;
            span.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
          }
        } else {
          span.style.backgroundColor = "transparent";
          span.style.color = "";
          span.style.padding = "";
        }
      });

      if (hasMatches) {
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [activeKey, numPages]);

  return (
    <div className="h-[80vh] overflow-auto border rounded p-2">
      <Document
        file={pdfUrl}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        className="space-y-4"
      >
        {Array.from(new Array(numPages), (_, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            renderTextLayer={true}
            renderAnnotationLayer={false}
            className="relative"
          />
        ))}
      </Document>
    </div>
  );
}
