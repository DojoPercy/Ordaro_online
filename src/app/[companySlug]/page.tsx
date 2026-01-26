"use client";

import { useEffect, useState } from "react";
import { useGeoLocation } from "@/hooks/use-geo-location";
import { useLocationStore } from "@/store/location-store";
import { MapPin, Loader2 } from "lucide-react";
// import { Button } from "@/components/ui/button"; // Assuming we'll generate this next or use HTML for now
import { useRouter } from "next/navigation";

import { use } from "react";

export default function CompanyPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = use(params);
  const { detectLocation, loading, error } = useGeoLocation();
  const location = useLocationStore((state) => state.location);
  const router = useRouter();

  const [manualAddress, setManualAddress] = useState("");

  // Auto-detect on mount if no location
  useEffect(() => {
    if (!location) {
      // Optional: Trigger immediately or wait for user interaction
    }
  }, [location]);

  const handleUseCurrentLocation = async () => {
    await detectLocation();
    // After location is set, resolve nearest branch (mock logic here)
    router.push(`/${companySlug}/menu`);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg text-center space-y-6">
      <div className="bg-blue-50 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
        <MapPin className="text-blue-600 w-8 h-8" />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Find Nearest Branch</h2>
        <p className="text-gray-500">
          We need your location to show you the correct menu and pricing.
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleUseCurrentLocation}
          disabled={loading}
          className="w-full py-3 px-4 bg-[var(--primary-color)] text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            <MapPin className="w-5 h-5" />
          )}
          Use My Current Location
        </button>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground text-gray-400">
              Or enter address
            </span>
          </div>
        </div>

        <input
          type="text"
          placeholder="Enter street address or ZIP"
          className="w-full border p-3 rounded-lg"
          value={manualAddress}
          onChange={(e) => setManualAddress(e.target.value)}
        />

        {manualAddress && (
          <button
            className="w-full py-3 px-4 border border-gray-200 font-bold rounded-lg hover:bg-gray-50"
            onClick={() => router.push(`/${companySlug}/menu`)}
          >
            Find Branch manually
          </button>
        )}
      </div>
    </div>
  );
}
