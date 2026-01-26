"use client";

import { useState, useEffect, use } from "react";
import { useCartStore } from "@/store/cart-store";
import { MenuCategory, MenuItem } from "@/types";
import { ShoppingBag, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocationStore } from "@/store/location-store";

// Mock data for development
const MOCK_CATEGORIES: MenuCategory[] = [
  {
    id: "cat_1",
    name: "Burgers",
    slug: "burgers",
    items: [
      {
        id: "item_1",
        name: "Classic Cheeseburger",
        description: "Angus beef patty, cheddar, lettuce, tomato, house sauce.",
        basePrice: 12.5,
        categoryId: "cat_1",
        isActive: true,
        isAvailable: true,
        imageUrl:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "item_2",
        name: "Double Bacon BBQ",
        description: "Two patties, crispy bacon, onion rings, BBQ sauce.",
        basePrice: 15.0,
        categoryId: "cat_1",
        isActive: true,
        isAvailable: true,
        imageUrl:
          "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "cat_2",
    name: "Sides",
    slug: "sides",
    items: [
      {
        id: "item_3",
        name: "Crispy Fries",
        description: "Golden shoestring fries with sea salt.",
        basePrice: 4.5,
        categoryId: "cat_2",
        isActive: true,
        isAvailable: true,
        imageUrl:
          "https://images.unsplash.com/photo-1573080496987-a2267f0808a3?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
];

export default function MenuPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = use(params);
  const router = useRouter();
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const setBranchContext = useCartStore((state) => state.setBranchContext);
  const { location } = useLocationStore();

  const [activeCategory, setActiveCategory] = useState(MOCK_CATEGORIES[0].id);

  // In a real app, useQuery to fetch menu based on params.companySlug and location (for branch resolution)
  // const { data: menu } = useQuery(...)

  // Initialize context
  useEffect(() => {
    // Mock branch ID resolution
    const mockBranchId = "branch_123";
    setBranchContext(companySlug, mockBranchId);
  }, [companySlug, setBranchContext]);

  const cartTotalItems = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      menuItem: item,
      quantity: 1,
      modifiers: [],
    });
  };

  return (
    <div className="pb-24">
      {/* Category Nav - Sticky */}
      <div className="sticky top-[60px] z-10 bg-white border-b overflow-x-auto no-scrollbar py-2">
        <div className="flex gap-2 px-4 whitespace-nowrap">
          {MOCK_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                document
                  .getElementById(cat.id)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                activeCategory === cat.id
                  ? "bg-[var(--primary-color)] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu List */}
      <div className="container mx-auto px-4 py-6 space-y-8">
        {MOCK_CATEGORIES.map((cat) => (
          <section key={cat.id} id={cat.id} className="scroll-mt-28">
            <h2 className="text-xl font-bold mb-4 text-gray-900">{cat.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-video bg-gray-100">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900 line-clamp-2">
                        {item.name}
                      </h3>
                      <span className="font-bold text-[var(--primary-color)]">
                        ${item.basePrice.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                      {item.description}
                    </p>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-full py-2 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-black transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={16} /> Add to Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Floating Cart Button (Mobile/Desktop) */}
      {cartTotalItems > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 md:px-0 flex justify-center z-50">
          <button
            onClick={() => router.push("/checkout")}
            className="bg-[var(--primary-color)] text-white shadow-xl rounded-full px-6 py-3 flex items-center gap-3 font-bold text-lg hover:scale-105 transition-transform"
          >
            <div className="bg-white/20 px-2 py-0.5 rounded text-sm min-w-[24px] text-center">
              {cartTotalItems}
            </div>
            <span>View Order</span>
            <span className="bg-white/20 h-4 w-px mx-1"></span>
            <span>${useCartStore.getState().subtotal().toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  );
}
