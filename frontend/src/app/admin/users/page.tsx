"use client";

import { useEffect, useState } from "react";
import { getUsersWithProfiles } from "@/lib/adminApi";
import { AdminUserWithProfile } from "@/types/admin";
import { useAuth } from "@/hooks/useAuth";

export default function AdminUsersPage() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const [users, setUsers] = useState<AdminUserWithProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const res = await getUsersWithProfiles({ limit: 100 });
      if (!mounted) return;
      if (res.error || !res.data) {
        setError(res.error || "No se pudieron cargar los usuarios");
      } else {
        setUsers(res.data);
      }
      setLoading(false);
    }
    if (isAdmin) load();
    return () => {
      mounted = false;
    };
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Solo administradores</h1>
        <p>No tienes acceso a esta página.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Usuarios</h1>
      {loading ? (
        <p>Cargando…</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : users.length === 0 ? (
        <p>No se encontraron usuarios.</p>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correo
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de viajero
                </th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-2 text-xs text-gray-500">{u.id}</td>
                  <td className="px-4 py-2">
                    {u.display_name || u.username || "—"}
                  </td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.traveler_type?.name || "—"}</td>
                  <td className="px-4 py-2 text-right"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
