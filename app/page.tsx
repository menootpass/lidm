"use client"
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <Image
        src="/images/start-bg.jpg"
        alt="Background Game"
        fill
        className="object-cover z-0"
        priority
      />
      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/40 z-10" />
      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center w-full px-4">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white drop-shadow-lg text-center mb-8">
          Selamat Datang di Game Seru Anak SD!
        </h1>
        <button
          className="mt-4 px-10 py-4 rounded-full bg-yellow-400 hover:bg-yellow-300 text-2xl sm:text-3xl font-bold text-gray-900 shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-yellow-200"
          onClick={() => router.push("/in-game")}
        >
          Mulai Game
        </button>
      </div>
    </div>
  );
}
