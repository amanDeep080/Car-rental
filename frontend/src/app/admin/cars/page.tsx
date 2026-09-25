"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { getAdminCars, deactivateCar, deleteCar } from "@/services/adminService";
import type { CarDetail } from "@/types/car";
import { Plus, MoreVertical } from "lucide-react";

export default function AdminCarsPage() {
  const ready = useAdminGuard();
  const [cars, setCars] = useState<CarDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready]);

  function load() {
    setLoading(true);
    getAdminCars()
      .then((data) => setCars(data as CarDetail[]))
      .catch(() => setCars([]))
      .finally(() => setLoading(false));
  }

  async function handleDeactivate(id: string) {
    await deactivateCar(id);
    load();
    setOpenMenu(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this car from the fleet? This can't be undone.")) return;
    await deleteCar(id);
    load();
    setOpenMenu(null);
  }

  if (!ready) return null;

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-display-md font-700 text-ivory">Fleet</h1>
        <Link
          href="/admin/cars/new"
          className="flex items-center gap-1.5 rounded-full bg-brass-sheen px-5 py-2.5 text-sm font-medium text-obsidian transition-transform hover:scale-[1.02]"
        >
          <Plus size={15} /> Add Vehicle
        </Link>
      </div>

      {loading && <p className="mt-6 text-sm text-steel">Loading…</p>}

      {!loading && (
        <div className="mt-8 overflow-x-auto rounded-panel border border-graphite-line">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-graphite-line bg-graphite text-xs text-steel">
                <th className="px-4 py-3 font-normal">Vehicle</th>
                <th className="px-4 py-3 font-normal">Category</th>
                <th className="px-4 py-3 font-normal">Location</th>
                <th className="px-4 py-3 font-normal">Price/Day</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car.id} className="border-b border-graphite-line last:border-0 hover:bg-graphite-raised/30">
                  <td className="px-4 py-3 text-ivory">
                    {car.brand} {car.model} <span className="text-steel">{car.variant}</span>
                  </td>
                  <td className="px-4 py-3 text-steel">{car.category}</td>
                  <td className="px-4 py-3 text-steel">{car.locationCity}</td>
                  <td className="px-4 py-3 text-ivory">₹{car.pricePerDay.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-graphite-raised px-2.5 py-1 font-mono text-[10px] uppercase text-steel">
                      {car.status}
                    </span>
                  </td>
                  <td className="relative px-4 py-3 text-right">
                    <button onClick={() => setOpenMenu(openMenu === car.id ? null : car.id)} className="text-steel hover:text-ivory">
                      <MoreVertical size={16} />
                    </button>
                    {openMenu === car.id && (
                      <div className="absolute right-4 top-10 z-10 w-40 rounded-lg border border-graphite-line bg-graphite-raised py-1 shadow-panel">
                        <Link href={`/admin/cars/${car.id}`} className="block px-3 py-2 text-left text-xs text-ivory hover:bg-graphite">
                          Edit
                        </Link>
                        <button onClick={() => handleDeactivate(car.id)} className="block w-full px-3 py-2 text-left text-xs text-steel hover:bg-graphite">
                          Deactivate
                        </button>
                        <button onClick={() => handleDelete(car.id)} className="block w-full px-3 py-2 text-left text-xs text-signal-booked hover:bg-graphite">
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {cars.length === 0 && <p className="p-8 text-center text-sm text-steel">No vehicles yet.</p>}
        </div>
      )}
    </AdminLayout>
  );
}
