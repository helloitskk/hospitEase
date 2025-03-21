"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getBedAvailability, getBedEmptyPrediction } from "@/lib/actions/bed.actions";

const AdminHome = async () => {
  const bedData = await getBedAvailability();
  const predictionData = await getBedEmptyPrediction();

  return <AdminHomeClient bedData={bedData} initialPrediction={predictionData.emptyTime} />;
};

const AdminHomeClient = ({ bedData, initialPrediction }) => {
  const [formData, setFormData] = useState({
    arrival_hour: "",
    scheduled_hour: "",
    day_of_week: "",
  });

  const [estimatedTime, setEstimatedTime] = useState(initialPrediction || null);
  const [loading, setLoading] = useState(false);
  const [expectedBedTime, setExpectedBedTime] = useState(null);
  const [bedTimeLoading, setBedTimeLoading] = useState(true);

  // 🔹 Fetch expected bed availability time
  useEffect(() => {
    const fetchExpectedBedTime = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/predict-stay");
        const data = await response.json();
        setExpectedBedTime(data.expected_time || "N/A");
      } catch (error) {
        console.error("Error fetching expected bed time:", error);
        setExpectedBedTime("Unavailable");
      } finally {
        setBedTimeLoading(false);
      }
    };

    fetchExpectedBedTime();
  }, []);

  // 🔹 Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Call API to get estimated wait time
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          arrival_hour: Number(formData.arrival_hour),
          scheduled_hour: Number(formData.scheduled_hour),
          day_of_week: Number(formData.day_of_week),
        }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (data.predicted_wait_time !== undefined) {
        setEstimatedTime(data.predicted_wait_time ?? estimatedTime);
      } else {
        console.error("Unexpected API response:", data);
      }
    } catch (error) {
      console.error("Error fetching estimate:", error);
      alert("Failed to fetch estimated time");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-10 p-6 bg-gray-900 text-white">
      {/* Header */}
      <header className="admin-header flex flex-col items-center">
        <Link href="#" className="cursor-pointer">
          <Image src="/assets/icons/hospiteEase.jpg" height={32} width={162} alt="logo" className="h-14 w-fit" />
        </Link>
        <p className="text-2xl font-semibold mt-2">Admin Home</p>
      </header>

      {/* ✅ Bed Availability Section in a Single Line */}
      <section className="w-full max-w-4xl flex justify-between space-x-6">
        <div className="flex-1 flex flex-col items-center p-6 bg-gray-800 rounded-lg shadow-md">
          <p className="text-lg font-semibold text-gray-300">Total Beds</p>
          <p className="text-2xl font-bold text-blue-400">{bedData.totalBeds}</p>
        </div>
        <div className="flex-1 flex flex-col items-center p-6 bg-gray-800 rounded-lg shadow-md">
          <p className="text-lg font-semibold text-gray-300">Available Beds</p>
          <p className="text-2xl font-bold text-green-400">{bedData.availableBeds}</p>
        </div>
        <div className="flex-1 flex flex-col items-center p-6 bg-gray-800 rounded-lg shadow-md">
          <p className="text-lg font-semibold text-gray-300">Occupied Beds</p>
          <p className="text-2xl font-bold text-red-400">{bedData.occupiedBeds}</p>
        </div>
      </section>

      {/* ✅ Expected Time to Get a Bed */}
      <section className="w-full max-w-3xl p-6 bg-gray-800 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-semibold">Expected Time to Get a Bed</h2>
        <p className="text-lg text-gray-300 mt-2">
          <span className="font-bold text-yellow-400">
            {bedTimeLoading ? "Fetching..." : expectedBedTime}
          </span>
        </p>
      </section>

      {/* ✅ Form for New Estimate */}
      <section className="w-full max-w-3xl p-6 bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-4">Enter Appointment Details</h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="number"
              name="arrival_hour"
              placeholder="Arrival Hour (0-23)"
              value={formData.arrival_hour}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700 text-white rounded-md focus:ring focus:ring-blue-500"
              required
            />
            <input
              type="number"
              name="scheduled_hour"
              placeholder="Scheduled Hour (0-23)"
              value={formData.scheduled_hour}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700 text-white rounded-md focus:ring focus:ring-blue-500"
              required
            />
            <input
              type="number"
              name="day_of_week"
              placeholder="Day of Week (0=Sunday, 6=Saturday)"
              value={formData.day_of_week}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700 text-white rounded-md focus:ring focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full p-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-all"
          >
            {loading ? "Calculating..." : "Predict Wait Time"}
          </button>
        </form>
      </section>

      {/* ✅ Prediction Section - Moved Below the Form */}
      <section className="w-full max-w-3xl p-6 bg-gray-800 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-semibold">Estimated Wait Time</h2>
        <p className="text-lg text-gray-300 mt-2">
          <span className="font-bold text-yellow-400">
            {loading ? "Calculating..." : estimatedTime !== null ? `${estimatedTime} minutes` : "N/A"}
          </span>
        </p>
      </section>

      {/* ✅ Navigation Button */}
      <section className="w-full flex justify-center">
        <Link href="/admin/dashboard">
          <button className="px-6 py-3 bg-blue-500 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-all">
            Go to Admin Dashboard
          </button>
        </Link>
      </section>
    </div>
  );
};

export default AdminHome;
