import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [baseUrl, setBaseUrl] = useState("");
  const [pageCount, setPageCount] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [shouldGenerate, setShouldGenerate] = useState(false); // Control when to send API request

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  console.log("Backend URL:", backendUrl);

  useEffect(() => {
    const generatePDF = async () => {
      if (!shouldGenerate) return; // Only run when shouldGenerate is true

      if (!baseUrl.trim()) {
        setMessage("❌ Please enter a valid Base URL");
        setShouldGenerate(false);
        return;
      }

      try {
        setLoading(true);
        let formattedBaseUrl = baseUrl.trim();
        const urlWithoutFile = formattedBaseUrl.replace(/-\d+\.jpg$/, "-");

        console.log("Formatted Base URL:", urlWithoutFile);

        const response = await axios.post(`${backendUrl}/generate-pdf`, {
          baseUrl: urlWithoutFile,
          pageCount,
        });

        setMessage(response.data.message);
      } catch (error) {
        setMessage("❌ Error generating PDF: " + (error.response?.data?.error || error.message));
      } finally {
        setLoading(false);
        setShouldGenerate(false); // Reset trigger after request completes
      }
    };

    generatePDF();
  }, [shouldGenerate]); // useEffect runs only when shouldGenerate changes

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96">
        <h1 className="text-2xl font-bold text-center text-gray-200 mb-4">
          📄 Generate Gujarat PDF
        </h1>

        <label className="block text-gray-400 font-medium">Base URL:</label>
        <input
          type="text"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="Enter Base URL"
          className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-white mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <label className="block text-gray-400 font-medium">Page Count:</label>
        <input
          type="number"
          value={pageCount}
          onChange={(e) => setPageCount(parseInt(e.target.value, 10))}
          min="1"
          className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={() => setShouldGenerate(true)} // Set state to trigger useEffect
          className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition duration-200"
          disabled={loading}
        >
          {loading ? "⏳ Generating..." : "🚀 Generate PDF"}
        </button>

        {message && <p className="mt-4 text-center text-gray-300 font-medium">{message}</p>}
      </div>
    </div>
  );
};

export default App;
