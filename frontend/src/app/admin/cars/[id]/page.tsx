"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import CarForm from "@/components/admin/CarForm";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { getAdminCars, updateCar, type AdminCarUpsertInput } from "@/services/adminService";
import { getLocations } from "@/services/bookingService";
import type { LocationOption } from "@/types/booking";
import type { CarDetail } from "@/types/car";

export default function EditCarPage() {
  const ready = useAdminGuard();
  const params = useParams<{ id: string }>();
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [car, setCar] = useState<CarDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    Promise.all([getLocations(), getAdminCars()]).then(([locs, cars]) => {
      setLocations(locs);
      setCar((cars as CarDetail[]).find((c) => c.id === params.id) ?? null);
      setLoading(false);
    });
  }, [ready, params.id]);

  if (!ready) return null;

  return (
    <AdminLayout>
      <h1 className="font-display text-display-md font-700 text-ivory">Edit Vehicle</h1>
      <div className="mt-8">
        {loading && <p className="text-sm text-steel">Loading…</p>}
        {!loading && !car && <p className="text-sm text-steel">Vehicle not found.</p>}
        {car && (
          <CarForm
            locations={locations}
            initial={{
              slug: car.slug,
              brand: car.brand,
              model: car.model,
              variant: car.variant,
              year: car.year,
              category: car.category,
              fuel: car.fuel,
              transmission: car.transmission,
              seats: car.seats,
              doors: car.doors ?? undefined,
              engine: car.engine ?? undefined,
              power: car.power ?? undefined,
              mileagePolicy: car.mileagePolicy ?? undefined,
              pricePerDay: car.pricePerDay,
              pricePerSixHours: car.pricePerSixHours ?? undefined,
              pricePerTwelveHours: car.pricePerTwelveHours ?? undefined,
              pricePerTwentyFourHours: car.pricePerTwentyFourHours ?? undefined,
              pricePerWeek: car.pricePerWeek ?? undefined,
              pricePerMonth: car.pricePerMonth ?? undefined,
              securityDeposit: car.securityDeposit,
              locationId: car.locationId,
              status: car.status,
              description: car.description ?? undefined,
              rentalPolicy: car.rentalPolicy ?? undefined,
              features: car.features,
              imageUrls: car.imageUrls,
            }}
            onSubmit={(input: AdminCarUpsertInput) => updateCar(car.id, input)}
          />
        )}
      </div>
    </AdminLayout>
  );
}
