import { useState, useCallback } from "react";
import { useLocationStore } from "@/store/location-store";

interface GeoLocationHook {
  loading: boolean;
  error: string | null;
  detectLocation: () => Promise<void>;
}

export function useGeoLocation(): GeoLocationHook {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setLocation, setPermission } = useLocationStore();

  const detectLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    return new Promise<void>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLoading(false);
          resolve();
        },
        (err) => {
          let errorMessage = "Failed to retrieve location";
          if (err.code === err.PERMISSION_DENIED) {
            errorMessage = "Location permission denied";
            setPermission(false);
          }
          setError(errorMessage);
          setLoading(false);
          resolve(); // Resolve to allow UI to handle error state gracefuly (e.g. show manual input)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    });
  }, [setLocation, setPermission]);

  return { loading, error, detectLocation };
}
