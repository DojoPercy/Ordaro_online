import { ReactNode } from "react";
import { notFound } from "next/navigation";

// Mock function to simulate fetching company branding
async function getCompanyBranding(slug: string) {
  // In real app, fetch from API
  if (slug === "demo") {
    return {
      name: "Demo Burger",
      colors: {
        primary: "#FF5733",
        secondary: "#C70039",
      },
    };
  }
  return null;
}

export default async function CompanyLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;
  const branding = await getCompanyBranding(companySlug);

  // If we had a real API, we'd validate slug here
  // if (!branding) return notFound();

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col"
      style={
        {
          // @ts-ignore
          "--primary-color": branding?.colors.primary || "#000",
          "--secondary-color": branding?.colors.secondary || "#333",
        } as React.CSSProperties
      }
    >
      {/* Company Header Placeholder */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-[var(--primary-color)]">
            {branding?.name || companySlug}
          </h1>
          {/* Cart Icon / Auth would go here */}
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4">{children}</main>
    </div>
  );
}
