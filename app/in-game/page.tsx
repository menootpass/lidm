"use client"
import Image from "next/image";
import { useState, useRef } from "react";
import { motion } from "framer-motion";

const items = [
  {
    key: "ember",
    image: "/images/ember.png",
    alt: "Ember",
    width: 100,
    height: 100,
  },
  {
    key: "air",
    image: "/images/air.png", // Ganti jika ada gambar air
    alt: "Air",
    width: 100,
    height: 100,
  },
  {
    key: "sabun",
    image: "/images/sabun.png",
    alt: "Sabun",
    width: 100,
    height: 100,
  },
  {
    key: "baju",
    image: "/images/baju-bersih.png", // Ganti jika ada gambar baju kotor
    alt: "Baju Kotor",
    width: 100,
    height: 100,
  },
];

const steps = [
  {
    label: "Siapkan ember",
    target: "ember",
    info: "Drag ember ke tengah!",
  },
  {
    label: "Tambahkan air",
    target: "air",
    info: "Drag air ke ember!",
  },
  {
    label: "Tambahkan sabun",
    target: "sabun",
    info: "Drag sabun ke ember!",
  },
  {
    label: "Masukkan baju kotor",
    target: "baju",
    info: "Drag baju kotor ke ember!",
  },
  {
    label: "Baju bersih!",
    target: null,
    info: null,
  },
];

const quizList = [
  { q: "Apa yang pertama kali harus disiapkan untuk mencuci baju?", a: "ember" },
  { q: "Apa yang ditambahkan setelah ember?", a: "air" },
  { q: "Setelah air, apa yang ditambahkan?", a: "sabun" },
  { q: "Apa yang dimasukkan setelah sabun?", a: "baju kotor" },
  { q: "Setelah dicuci, baju menjadi?", a: "bersih" },
  // Tambah hingga 10 soal
];

function getRandomNodaPositions(count: number) {
  // Area baju: width 320, height 320
  const positions: {x: number, y: number}[] = [];
  while (positions.length < count) {
    const x = Math.random() * 220 + 50; // avoid edge
    const y = Math.random() * 220 + 50;
    // Hindari overlap berat
    if (positions.every((p) => Math.hypot(p.x - x, p.y - y) > 40)) {
      positions.push({ x, y });
    }
  }
  return positions;
}

export default function InGame() {
  const [step, setStep] = useState(0);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizInput, setQuizInput] = useState("");
  const [quizTries, setQuizTries] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [finished, setFinished] = useState(false);
  const [shake, setShake] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const [noda, setNoda] = useState(
    Array.from({ length: 7 }, (_, i) => ({
      id: i,
      x: 0,
      y: 0,
      visible: true,
      quizIdx: i % quizList.length,
      showQuiz: false,
      shake: false,
    }))
  );
  const [nodaInit, setNodaInit] = useState(false);
  const [activeNoda, setActiveNoda] = useState<number | null>(null);
  const sikatRef = useRef<HTMLDivElement>(null);
  const bajuRef = useRef<HTMLDivElement>(null);
  const [availableItems, setAvailableItems] = useState(items);

  // Drag and drop logic
  const handleDragEnd = (event: MouseEvent | TouchEvent, itemKey: string) => {
    if (!dropRef.current) return;
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const dropRect = dropRef.current.getBoundingClientRect();
    const dragRect = target.getBoundingClientRect();
    const isOver =
      dragRect.left < dropRect.right &&
      dragRect.right > dropRect.left &&
      dragRect.top < dropRect.bottom &&
      dragRect.bottom > dropRect.top;
    if (isOver) {
      if (itemKey === steps[step].target) {
        setAvailableItems((prev) => prev.filter((item) => item.key !== itemKey));
        if (step === 3) {
          setShowQuiz(true);
        } else {
          setStep((s) => s + 1);
        }
        setShake(false);
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    }
  };

  const handleQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      quizInput.trim().toLowerCase() ===
      quizList[quizIdx].a.toLowerCase()
    ) {
      if (quizIdx === quizList.length - 1) {
        setShowQuiz(false);
        setStep(4);
        setFinished(true);
      } else {
        setQuizIdx((idx) => idx + 1);
        setQuizInput("");
        setQuizTries(0);
      }
    } else {
      setQuizTries((t) => t + 1);
      setQuizInput("");
    }
  };

  // Saat step ke-3 (masukkan baju kotor), inisialisasi posisi noda
  if (step === 3 && !nodaInit) {
    const pos = getRandomNodaPositions(7);
    setNoda((noda) => noda.map((n, i) => ({ ...n, x: pos[i].x, y: pos[i].y, visible: true, showQuiz: false, shake: false })));
    setNodaInit(true);
  }
  if (step !== 3 && nodaInit) {
    setNodaInit(false);
  }

  // Drag sikat ke noda
  const handleSikatDragEnd = (event: MouseEvent | TouchEvent) => {
    if (!bajuRef.current) return;
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const sikatRect = target.getBoundingClientRect();
    for (let i = 0; i < noda.length; i++) {
      if (!noda[i].visible) continue;
      const nodaEl = document.getElementById(`noda-${i}`);
      if (!nodaEl) continue;
      const nodaRect = nodaEl.getBoundingClientRect();
      const isOver =
        sikatRect.left < nodaRect.right &&
        sikatRect.right > nodaRect.left &&
        sikatRect.top < nodaRect.bottom &&
        sikatRect.bottom > nodaRect.top;
      if (isOver) {
        setActiveNoda(i);
        setNoda((noda) => noda.map((n, idx) => idx === i ? { ...n, showQuiz: true } : n));
        break;
      }
    }
  };

  // Jawab quiz noda
  const handleNodaQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeNoda === null) return;
    const idx = noda[activeNoda].quizIdx;
    if (quizInput.trim().toLowerCase() === quizList[idx].a.toLowerCase()) {
      setNoda((noda) => noda.map((n, i) => i === activeNoda ? { ...n, visible: false, showQuiz: false } : n));
      setActiveNoda(null);
      setQuizInput("");
      // Jika semua noda hilang, lanjut step
      setTimeout(() => {
        if (noda.filter((n) => n.visible).length === 1) {
          setStep((s) => s + 1);
        }
      }, 300);
    } else {
      setNoda((noda) => noda.map((n, i) => i === activeNoda ? { ...n, shake: true } : n));
      setTimeout(() => {
        setNoda((noda) => noda.map((n, i) => i === activeNoda ? { ...n, shake: false } : n));
      }, 500);
      setQuizInput("");
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      {/* Background image */}
      <Image
        src="/images/bg-ingame.jpg"
        alt="Background In Game"
        fill
        className="object-cover z-0"
        priority
      />
      <div className="absolute inset-0 bg-black/30 z-10" />
      <div className="relative z-20 flex flex-col items-center justify-center w-full px-4 py-8 flex-1">
        <h1 className="text-2xl sm:text-4xl font-bold text-white drop-shadow-lg text-center mb-4">
          Game Mencuci Baju
        </h1>
        {!showQuiz && !finished && (
          <>
            <div className="flex flex-col items-center mb-4">
              <motion.div
                ref={dropRef}
                className={`mx-auto ${shake ? "ring-4 ring-red-400" : "ring-4 ring-yellow-300"} bg-white/80 rounded-full flex items-center justify-center mb-2`}
                style={{ width: 220, height: 220 }}
                animate={shake ? { x: [0, -20, 20, -20, 20, 0] } : { x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src="/images/ember.png"
                  alt="Ember"
                  width={200}
                  height={200}
                />
              </motion.div>
              <div className="text-lg sm:text-2xl text-white font-semibold mb-2 text-center">
                {steps[step].label}
              </div>
              {steps[step].info && (
                <div className="text-base text-yellow-200 mb-2 text-center animate-pulse">{steps[step].info}</div>
              )}
            </div>
            {/* Tools bar */}
            <div className="flex flex-row items-center justify-center gap-6 mt-4 w-full max-w-lg">
              {availableItems.map((item) => (
                <motion.div
                  key={item.key}
                  drag
                  dragConstraints={{ top: -150, bottom: 150, left: -150, right: 150 }}
                  onDragEnd={(e) => handleDragEnd(e, item.key)}
                  className="cursor-grab bg-white/80 rounded-xl p-2 shadow-lg"
                  whileDrag={{ scale: 1.2, rotate: 10, zIndex: 10 }}
                  style={{ touchAction: "none" }}
                >
                  <Image
                    src={item.image}
                    alt={item.alt}
                    width={item.width}
                    height={item.height}
                    style={{ pointerEvents: "none" }}
                  />
                </motion.div>
              ))}
            </div>
          </>
        )}
        {/* Step 3: Gosok noda di baju kotor */}
        {step === 3 && !showQuiz && !finished && (
          <>
            <div className="flex flex-col items-center mb-4">
              <div ref={bajuRef} className="relative mx-auto bg-white/80 rounded-xl flex items-center justify-center mb-2" style={{ width: 320, height: 320 }}>
                <Image src="/images/baju-kotor.png" alt="Baju Kotor" width={320} height={320} />
                {/* Noda */}
                {noda.map((n, i) => n.visible && (
                  <motion.div
                    key={i}
                    id={`noda-${i}`}
                    className="absolute"
                    style={{ left: n.x, top: n.y, width: 32, height: 32, pointerEvents: n.showQuiz ? "none" : "auto" }}
                    animate={n.shake ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-black/80 opacity-80 border-2 border-white" />
                  </motion.div>
                ))}
              </div>
              <div className="text-lg sm:text-2xl text-white font-semibold mb-2 text-center">
                Gosok semua noda dengan sikat!
              </div>
              <div className="text-base text-yellow-200 mb-2 text-center animate-pulse">Drag sikat ke noda untuk membersihkan</div>
            </div>
            {/* Sikat draggable */}
            <div className="flex flex-row items-center justify-center gap-6 mt-4 w-full max-w-lg">
              <motion.div
                drag
                dragConstraints={{ top: -200, bottom: 200, left: -200, right: 200 }}
                onDragEnd={handleSikatDragEnd}
                className="cursor-grab bg-white/80 rounded-xl p-2 shadow-lg"
                whileDrag={{ scale: 1.2, rotate: 10, zIndex: 10 }}
                style={{ touchAction: "none" }}
                ref={sikatRef}
              >
                <Image src="/images/sikat.png" alt="Sikat" width={80} height={80} />
              </motion.div>
            </div>
            {/* Quiz noda */}
            {noda.map((n, i) => n.showQuiz && (
              <form key={i} onSubmit={handleNodaQuiz} className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
                <div className="bg-white rounded-xl p-6 shadow-lg max-w-md w-full flex flex-col items-center">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 text-center">
                    {quizList[n.quizIdx].q}
                  </div>
                  <input
                    type="text"
                    value={quizInput}
                    onChange={(e) => setQuizInput(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-2 text-lg"
                    placeholder="Jawaban..."
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="w-full px-4 py-2 rounded-full bg-yellow-400 hover:bg-yellow-300 text-lg font-bold text-gray-900 shadow transition-all"
                  >
                    Jawab
                  </button>
                </div>
              </form>
            ))}
          </>
        )}
        {showQuiz && !finished && (
          <form onSubmit={handleQuiz} className="flex flex-col items-center w-full max-w-md bg-white/80 rounded-xl p-6 shadow-lg mt-6">
            <div className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 text-center">
              {quizList[quizIdx].q}
            </div>
            <input
              type="text"
              value={quizInput}
              onChange={(e) => setQuizInput(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-2 text-lg"
              placeholder="Jawaban..."
              autoFocus
            />
            <button
              type="submit"
              className="w-full px-4 py-2 rounded-full bg-yellow-400 hover:bg-yellow-300 text-lg font-bold text-gray-900 shadow transition-all"
            >
              Jawab
            </button>
            {quizTries > 0 && (
              <div className="text-red-600 mt-2">Jawaban salah, coba lagi!</div>
            )}
          </form>
        )}
        {finished && (
          <div className="flex flex-col items-center bg-white/90 rounded-xl p-6 shadow-lg mt-6 max-w-lg">
            <Image
              src="/images/baju-bersih.png"
              alt="Baju Bersih"
              width={240}
              height={240}
              className="mb-4"
            />
            <div className="text-2xl font-bold text-green-700 mb-2 text-center">Selamat! Baju sudah bersih!</div>
            <div className="text-gray-800 text-center mb-4 text-lg">
              <b>Proses mencuci baju</b> melibatkan perubahan fisika dan kimia:
              <ul className="list-disc list-inside text-left mt-2 mb-2">
                <li><b>Air</b> melarutkan kotoran pada serat kain.</li>
                <li><b>Sabun</b> membantu mengangkat dan memecah noda membandel.</li>
                <li><b>Gesekan</b> saat menggosok membantu melepaskan kotoran dari kain.</li>
              </ul>
              <b>Zat yang terlibat:</b> air, sabun, kotoran pada baju.<br/>
              <b>Perubahan yang terjadi:</b> kotoran terangkat, baju menjadi bersih, dan siap dijemur.
            </div>
            <div className="text-sm text-gray-600 text-center">Cuci tangan setelah mencuci baju ya! Menjaga kebersihan itu penting!</div>
          </div>
        )}
      </div>
    </div>
  );
} 