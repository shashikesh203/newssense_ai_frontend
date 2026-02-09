import { useState } from "react";
import axiosClient from "../lib/axiosClient";
export const NewsIngestionPopup = ({
  onClose,
}: {
  onClose: () => void;
}) => {
  const [file, setFile] = useState<File | null>(null);

  const handleIngest = async() => {
    if (!file) {
      alert("Please upload a file first!");
      return;
    }

    try {
    const formData = new FormData();

    formData.append("file", file);

    const response = await axiosClient.post("/ingest", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Ingest Success:", response.data);

    alert("News ingestion started successfully!");
    onClose();
  } catch (error: any) {
    console.log("Ingest Error:", error);
    alert("Upload failed!");
  }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Modal Box */}
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-500">
          <h2 className="text-lg font-semibold text-white">
            📰 News Ingestion
          </h2>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          <p className="text-gray-600 text-sm">
            Upload a news file (PDF / DOCX / TXT /JSON) and click ingest to process it
            into the AI system.
          </p>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-500 transition cursor-pointer">
            <input
              type="file"
              accept=".pdf,.txt,.docx"
              className="hidden"
              id="newsFile"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                }
              }}
            />

            <label htmlFor="newsFile" className="cursor-pointer">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 text-2xl">
                  ⬆
                </div>

                <p className="text-gray-700 font-medium">
                  Click to upload file
                </p>

                <p className="text-xs text-gray-400">
                  Supported: PDF, DOCX, TXT
                </p>

                {file && (
                  <p className="text-sm text-green-600 font-semibold mt-2">
                     Selected: {file.name}
                  </p>
                )}
              </div>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">

            {/* Cancel */}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>

            {/* Ingest */}
            <button
              onClick={handleIngest}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold hover:opacity-90 transition shadow-md"
            >
               Ingest News
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
