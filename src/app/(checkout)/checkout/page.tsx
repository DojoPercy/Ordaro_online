"use client";

import { useCartStore } from "@/store/cart-store";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft, CreditCard } from "lucide-react";
import { useLocationStore } from "@/store/location-store";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, subtotal, removeItem } = useCartStore();
  const { location } = useLocationStore();

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const cartTotal = subtotal();
  const tax = cartTotal * 0.05; // Mock tax 5%
  const total = cartTotal + tax;

  // Redirect if empty cart
  useEffect(() => {
    if (items.length === 0) {
      // router.push('/'); // Uncomment in production
    }
  }, [items, router]);

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    // Simulate API call to ordaro_api
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Navigate to success page (which will handle the Order ID)
    const mockOrderId = "ORD-2024-0099";
    router.push(`/checkout/success/${mockOrderId}`);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center space-y-6">
          <h1 className="text-2xl font-bold">Sign in to Checkout</h1>
          <p className="text-gray-500">
            You need to be logged in to place an order so you can track its
            status.
          </p>
          <button
            onClick={() => signIn("google")}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
          >
            Sign in with Google
          </button>
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-500 hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b p-4 sticky top-0 z-10">
        <div className="container mx-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">Checkout</h1>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-3xl space-y-6 mt-4">
        {/* Order Items */}
        <section className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50 font-medium text-gray-700">
            Order Summary
          </div>
          <div className="p-4 space-y-4">
            {items.map((item) => (
              <div key={item.tempId} className="flex gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                  {item.menuItem.imageUrl && (
                    <img
                      src={item.menuItem.imageUrl}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900">
                      {item.menuItem.name}
                    </h3>
                    <span className="font-medium">
                      ${(item.menuItem.basePrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  <button
                    onClick={() => removeItem(item.tempId)}
                    className="text-red-500 text-xs mt-1 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Delivery Details */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 text-gray-500" />
            Delivery Location
          </h3>
          {location ? (
            <div>
              <div className="h-32 bg-gray-100 rounded-lg mb-2 flex items-center justify-center text-gray-400">
                Map View Placeholder
              </div>
              <p className="text-sm text-gray-600">
                Lat: {location.latitude.toFixed(4)}, Long:{" "}
                {location.longitude.toFixed(4)}
                <br />
                <span className="text-xs text-orange-600">
                  Note: Actual address resolution requires Google Maps API key
                </span>
              </p>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
              Location not detected. Please enable location or enter address.
            </div>
          )}
        </section>

        {/* Total & Pay */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Tax (5%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-xl pt-2 border-t mt-2">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </main>

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-10">
        <div className="container mx-auto max-w-3xl">
          <button
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder || items.length === 0}
            className="w-full bg-green-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            {isPlacingOrder ? (
              <>
                <Loader2 className="animate-spin" /> Processing...
              </>
            ) : (
              <>
                <CreditCard size={20} /> Place Order • ${total.toFixed(2)}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

// Wrap in SessionProvider in layout, but here we assume it's available
