"use client";
import React, { useEffect, useState } from "react";
import PDFUploader from "./components/PDFUploader";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

const Home = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkPlatform = async () => {
      const isNative = Capacitor.isNativePlatform();
      setIsMobile(isNative);

      if (isNative) {
        // Set status bar style
        await StatusBar.setStyle({ style: Style.Dark });
        // Set status bar background color
        await StatusBar.setBackgroundColor({ color: "#1f2937" }); // dark gray color
      }
    };

    checkPlatform();
  }, []);

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 ${
        isMobile ? "pt-safe bg-red-500" : ""
      }`}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-[1600px] mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
            Document Analysis
          </h1>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <PDFUploader />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
