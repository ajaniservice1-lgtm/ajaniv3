// src/hooks/useVendorData.js
import { useState, useEffect } from "react";

export const useVendorData = () => {
  const [vendorData, setVendorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
        const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
        
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A1:Z1000?key=${API_KEY}`;
        const res = await fetch(url);
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const json = await res.json();
        let result = [];
        
        if (json.values && Array.isArray(json.values) && json.values.length > 1) {
          const headers = json.values[0];
          const rows = json.values.slice(1);
          
          result = rows
            .filter((row) => Array.isArray(row) && row.length > 0)
            .map((row) => {
              const obj = {};
              headers.forEach((h, i) => {
                obj[h?.toString().trim() || `col_${i}`] = (row[i] || "")
                  .toString()
                  .trim();
              });
              return obj;
            });
        }
        
        setVendorData(result);
      } catch (err) {
        console.error("Google Sheets fetch error:", err);
        setError("⚠️ Failed to load vendor data");
        setVendorData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, []);

  return { vendorData, loading, error };
};