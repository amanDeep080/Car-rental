"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import CarForm from "@/components/admin/CarForm";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { createCar, type AdminCarUpsertInput } from "@/services/adminService";
import { getLocations } from "@/services/bookingService";
import type { LocationOption } from "@/types/booking";

export default function NewCarPage() {
  const ready = useAdminGuard();
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    getLocations()
      .then(data => {
        console.log("Admin New Car - Loaded locations:", data);
        setLocations(data);
      })
      .finally(() => setLoading(false));
  }, [ready]);

  if (!ready) return null;

  return (
    <AdminLayout>
      <h1 className="font-display text-display-md font-700 text-ivory">Add Vehicle</h1>
      <div className="mt-8">
        {loading ? (
          <p className="text-sm text-steel">Loading…</p>
        ) : (
          <CarForm locations={locations} onSubmit={(input: AdminCarUpsertInput) => createCar(input)} />
        )}
      </div>
    </AdminLayout>
  );
}
