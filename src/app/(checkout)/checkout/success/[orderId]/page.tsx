"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { OrderStatus } from "@/types";
import { useCartStore } from "@/store/cart-store";
import {
  CheckCircle2,
  Clock,
  ChefHat,
  PackageCheck,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function OrderTrackingPage({
  params,
}: {
  params: { orderId: string };
}) {
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);

  const [status, setStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [queuePosition, setQueuePosition] = useState<number | null>(4); // Mock initial pos
  const [eta, setEta] = useState<number>(15); // Minutes

  // Clear cart on mount (since order is placed)
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  // Connect WebSocket
  useEffect(() => {
    // In production, use env var for websocket URL
    const socketInstance = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
      {
        path: "/socket.io",
        // auth: { token: '...' } // Add auth token if needed
        query: {
          // branchId: ...
        },
      },
    );

    socketInstance.on("connect", () => {
      console.log("Connected to order tracking");
      // Subscribe to specific order channel
      // backend expects: client.join(`order:${payload.orderId}`);
      socketInstance.emit("subscribe:queue", {
        branchId: "mock_branch",
        orderId: params.orderId,
      });
    });

    socketInstance.on("order:status:changed", (data: any) => {
      if (data.orderId === params.orderId) {
        setStatus(data.status);
      }
    });

    socketInstance.on("queue:position:updated", (data: any) => {
      if (data.orderId === params.orderId) {
        setQueuePosition(data.queuePosition);
      }
    });

    socketInstance.on("queue:eta:updated", (data: any) => {
      if (data.orderId === params.orderId) {
        // Calculate minutes difference
        const date = new Date(data.estimatedReadyAt);
        const diff = Math.max(
          0,
          Math.floor((date.getTime() - Date.now()) / 60000),
        );
        setEta(diff);
      }
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [params.orderId]);

  // Status Stepper Data
  const STEPS = [
    { id: OrderStatus.PENDING, label: "Confirmed", icon: CheckCircle2 },
    { id: OrderStatus.PREPARING, label: "Preparing", icon: ChefHat },
    { id: OrderStatus.READY, label: "Ready", icon: PackageCheck },
    { id: OrderStatus.COMPLETED, label: "Picked Up", icon: MapPin },
  ];

  const currentStepIndex = STEPS.findIndex((s) => s.id === status);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 p-8 text-center text-white">
          <div className="mx-auto bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <CheckCircle2 size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Order Received!</h1>
          <p className="opacity-90">Order #{params.orderId}</p>
        </div>

        {/* ETA & Queue */}
        <div className="grid grid-cols-2 border-b divide-x">
          <div className="p-6 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Queue Position
            </p>
            <p className="text-3xl font-black text-gray-900">
              #{queuePosition ?? "-"}
            </p>
          </div>
          <div className="p-6 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Est. Pickup
            </p>
            <div className="flex items-center justify-center gap-1 text-3xl font-black text-gray-900">
              <span>{eta}</span>
              <span className="text-sm font-medium text-gray-500 mt-2">
                min
              </span>
            </div>
          </div>
        </div>

        {/* Status Stepper */}
        <div className="p-8">
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100" />

            <div className="space-y-8 relative">
              {STEPS.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step.id} className="flex items-center gap-4">
                    <div
                      className={`
                                      w-12 h-12 rounded-full flex items-center justify-center border-4 z-10 transition-colors
                                      ${isCompleted ? "bg-green-600 border-green-100 text-white" : "bg-white border-gray-100 text-gray-300"}
                                  `}
                    >
                      <step.icon size={20} />
                    </div>
                    <div>
                      <p
                        className={`font-bold ${isCompleted ? "text-gray-900" : "text-gray-400"}`}
                      >
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-green-600 font-medium animate-pulse">
                          In Progress...
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-gray-50">
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
