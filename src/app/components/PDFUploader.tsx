"use client";

import React, { useState, useEffect } from "react";
import FinancialCalculations from "./FinancialCalculations";
import { FaCheckCircle } from "react-icons/fa";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";

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

interface FaithfulnessResult {
  calculations_in_json: Calculation[];
}

interface AnalysisResult {
  filename: string;
  type: "pdf" | "image";
  results: Array<{
    faithfulness_result: FaithfulnessResult;
  }>;
}

export default function PDFUploader() {
  const [isCapacitor, setIsCapacitor] = useState(false);
  const [serverStatus, setServerStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setIsCapacitor(Capacitor.isNativePlatform());
    // Test server connection
    fetch("https://python-service-production-19ff.up.railway.app/test/")
      .then((response) => {
        if (response.ok) {
          setServerStatus("online");
        } else {
          setServerStatus("offline");
        }
      })
      .catch(() => {
        setServerStatus("offline");
      });
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      // Simulate progress
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + Math.random() * 10;
        });
      }, 500);
    } else {
      setProgress(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing]);

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsAnalyzing(true);
      const res = await fetch(
        "https://python-service-production-19ff.up.railway.app/analyze/",
        {
          method: "POST",
          body: formData,
        }
      );
      //
      if (!res.ok) throw new Error("File analysis failed");

      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error(
        "Failed to connect to server. Please check your connection."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileUpload(file: File) {
    try {
      setError(null);
      const url = URL.createObjectURL(file);
      setFileUrl(url);

      const data: AnalysisResult = await uploadFile(file);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setFileUrl(null);
      setResult(null);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleFileUpload(file);
  }

  async function takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        correctOrientation: true,
      });

      if (image.webPath) {
        // Convert the webPath to a File object
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        const file = new File([blob], "camera-photo.jpg", {
          type: "image/jpeg",
        });

        await handleFileUpload(file);
      }
    } catch (error) {
      console.error("Error taking picture:", error);
    }
  }

  return (
    <div className="w-full">
      {serverStatus === "checking" && (
        <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-300">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
          <span>Checking server connection...</span>
        </div>
      )}
      {serverStatus === "offline" && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg p-4 mb-6">
          <p className="flex items-center space-x-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>
              Cannot connect to server. Please make sure the server is running
              and you're on the same network.
            </span>
          </p>
        </div>
      )}
      {serverStatus === "online" && (
        <div className="space-y-6">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-12">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent absolute top-0"></div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  Analyzing Document
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This may take a few moments...
                </p>
              </div>
              <div className="w-full max-w-md px-4">
                <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {Math.round(progress)}%
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {progress < 30
                      ? "Scanning document..."
                      : progress < 60
                      ? "Processing data..."
                      : progress < 90
                      ? "Analyzing content..."
                      : "Finalizing results..."}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              </div>
            </div>
          ) : (
            <>
              {isCapacitor ? (
                <button
                  onClick={takePicture}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>Take Photo</span>
                </button>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors duration-200">
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={handleUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center space-y-4"
                  >
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                      <svg
                        className="w-8 h-8 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                        Drop your file here or click to upload
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Supports PDF and image files
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </>
          )}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg p-4">
              <p className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>{error}</span>
              </p>
            </div>
          )}
          {result && !isAnalyzing && (
            <div className="mt-6">
              <FinancialCalculations
                data={result.results.flatMap(
                  (item) => item.faithfulness_result.calculations_in_json
                )}
                pdfUrl={fileUrl}
                fileType={result.type}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
