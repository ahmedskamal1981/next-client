import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { colorManager } from "@/lib/colorManager";
import PDFViewer from "./PDFViewer";
import { FaCheckCircle } from "react-icons/fa";
import { TbXboxXFilled } from "react-icons/tb";

interface ContributingValue {
  name: string;
  value: number;
}

interface Calculation {
  calculation_of: string;
  total_amount: number;
  reasoning: string;
  contributing_values: ContributingValue[];
  is_calculation_correct?: boolean;
}

interface FinancialCalculationsProps {
  data: Calculation[];
  pdfUrl: string | null;
  fileType?: "pdf" | "image";
}

function FilePreview({
  url,
  type,
  activeKey,
}: {
  url: string;
  type: "pdf" | "image";
  activeKey: string | null;
}) {
  if (type === "pdf") {
    return <PDFViewer pdfUrl={url} activeKey={activeKey} />;
  }

  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <img
        src={url}
        alt="Document preview"
        className="max-h-full max-w-full object-contain"
      />
    </div>
  );
}

export default function FinancialCalculations({
  data,
  pdfUrl,
  fileType = "pdf",
}: FinancialCalculationsProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const getColor = (name: string) => colorManager.getColor(name);

  return (
    <div className="mx-auto p-4 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* File Preview - Fixed position on the right */}
        <div className="lg:col-span-2 lg:sticky lg:top-4 h-[90vh] border rounded-lg shadow-lg">
          <div className="h-full overflow-hidden">
            {pdfUrl && (
              <FilePreview url={pdfUrl} type={fileType} activeKey={activeKey} />
            )}
          </div>
        </div>

        {/* Calculations Grid - Scrollable on the left */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {data.map((calc, index) => {
              const calcColor = getColor(calc.calculation_of);
              const isActive = activeKey === calc.calculation_of;

              return (
                <Card
                  key={index}
                  onClick={() => setActiveKey(calc.calculation_of)}
                  className={cn(
                    "cursor-pointer border-2 transition-all hover:shadow-lg",
                    isActive ? "border-black scale-[1.01]" : "border-muted"
                  )}
                  style={{
                    backgroundColor: isActive ? `${calcColor}33` : undefined,
                  }}
                >
                  <CardContent className="p-4">
                    <h3
                      className="text-lg font-bold mb-2 flex items-center"
                      style={{ color: calcColor }}
                    >
                      {calc.calculation_of}: $
                      {calc.total_amount.toLocaleString()}
                      <div className="w-2"></div>
                      {calc?.is_calculation_correct && (
                        <FaCheckCircle color="#87C941" />
                      )}
                      {!calc?.is_calculation_correct && (
                        <TbXboxXFilled color="#EF2F37" />
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {calc.reasoning}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {calc.contributing_values.map((val, valIndex) => {
                        const valueColor = getColor(val.name);
                        const valueActive = activeKey === val.name;

                        return (
                          <Badge
                            key={valIndex}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveKey(val.name);
                            }}
                            className={cn(
                              "cursor-pointer px-2 py-1 text-xs font-medium transition-all",
                              "hover:scale-105",
                              valueActive && "ring-4 ring-fuchsia-500",
                              "block break-words whitespace-normal max-w-[200px] text-left"
                            )}
                            style={{
                              backgroundColor: valueColor,
                              color: "white",
                            }}
                            title={`${
                              val.name
                            }: $${val.value.toLocaleString()}`}
                          >
                            {val.name}: ${val.value.toLocaleString()}
                          </Badge>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
