"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="text-gray-600 hover:text-gray-900 mb-6 inline-block"
    >
      ← Volver a Colección
    </button>
  );
}
