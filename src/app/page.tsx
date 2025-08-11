
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Landing_Page() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-black/40 bg-black/30 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo_main.png"
              alt="Stock Labs logo"
              width={40}
              height={40}
              priority
            />
            <span className="font-semibold tracking-tight text-lg">Stock Labs</span>
          </Link>

          <nav className="ml-auto hidden md:flex items-center gap-6 text-sm text-white/80">
            <Link href="#features" className="hover:text-white transition">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition">How it works</Link>
            <Link href="#faq" className="hover:text-white transition">FAQ</Link>
          </nav>

          <div className="ml-auto md:ml-6">
            <Link href="/app/home">
              <Button className="bg-white text-black hover:bg-white/90">Open App</Button>
            </Link>
          </div>
        </div>
      </header>

   
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-56 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-indigo-500/40 via-cyan-400/30 to-emerald-400/20" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.12),rgba(0,0,0,0))]" />
      </div>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-28 grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">Paper Trading Platform</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight">
              Practice Pro-Level
              <span className="block bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">Crypto Trades</span>
            </h1>
            <p className="text-white/80 max-w-prose">
              Learn, Trade, Win – Without the Risk.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/signup">
                <Button size="lg" className="h-11 px-6 bg-white text-black hover:bg-white/90">Get Started</Button>
              </Link>
              {/* <Link href="/docs">
                <Button size="lg" variant="outline" className="h-11 px-6 border-white/20 text-white hover:bg-white/10">View Docs</Button>
              </Link> */}
            </div>

            <ul className="mt-6 grid grid-cols-2 gap-3 text-sm text-white/80">
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/> Real-time ticks</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-cyan-400"/> Zero capital risk</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-indigo-400"/> Strategy backtests</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400"/> Leaderboards</li>
            </ul>
          </div>

          <div className="relative">
            <div className="relative mx-auto max-w-lg">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-indigo-500/20 via-cyan-400/10 to-emerald-400/20 blur-2xl" aria-hidden />
              <div className="relative rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl">
                <div className="grid grid-cols-1 gap-3">
                  <Image
                    src="/logo_main.png"
                    alt="Stock Labs mark"
                    width={1200}
                    height={800}
                    className="rounded-2xl w-full object-contain bg-black/40 p-8"
                    priority
                  />
                  <Image
                    src="/L1.jpg"
                    alt="Trading dashboard preview"
                    width={1200}
                    height={800}
                    className="rounded-2xl w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Live Market Feeds",
              desc: "Paper trade with real-time price updates so your practice mirrors reality.",
            },
            {
              title: "Risk-Free Learning",
              desc: "Test strategies without capital exposure and build confidence step-by-step.",
            },
            {
              title: "Insights & Analytics",
              desc: "Track P&L, win rate, and drawdowns to refine your edge.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-medium">{f.title}</h3>
              <p className="mt-2 text-white/80 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-8 md:p-12 flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-semibold">Ready to trade smarter?</h2>
              <p className="mt-2 text-white/80">Create a free account and start practicing today.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/signup">
                <Button size="lg" className="h-11 px-6 bg-white text-black hover:bg-white/90">Sign Up Free</Button>
              </Link>
              <Link href="/app/home">
                <Button size="lg" variant="outline" className="h-11 px-6 border-white/20 text-black hover:bg-white/10">Open App</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} Stock Labs. All rights reserved. Developed By Aryan Seth
        </div>
      </footer>
    </div>
  );
}
