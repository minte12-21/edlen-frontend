'use client';
import Image from 'next/image';
import { useApp } from '@/context/Providers';

// Your hero image: put the file in frontend/public/images/ and set its name here.
const HERO_SRC = '/images/hero.webp';

export default function Hero() {
  const { lang } = useApp();
  const am = lang === 'am';

  return (
    <section
      aria-label="Edlen"
      className="relative mb-4 w-full aspect-[4/5] overflow-hidden rounded-[28px] border border-white/15 bg-[#062b14]"
    >
      <style>{`
        .hero-in{opacity:0;transform:translateY(14px);animation:hero-rise .7s cubic-bezier(.2,.8,.2,1) forwards}
        .hero-img{opacity:0;animation:hero-fade .8s ease .05s forwards}
        .hero-kicker{margin:0;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#b6ffc8;text-shadow:0 1px 8px rgba(0,0,0,.45)}
        .hero-title{display:flex;flex-direction:column;margin:0;line-height:1.02;font-weight:900;letter-spacing:-.02em}
        .hero-t1,.hero-t2{font-size:clamp(32px,10.5vw,46px)}
        .hero-t1{color:#fff;text-shadow:0 2px 14px rgba(0,0,0,.45)}
        .hero-t2 em{font-style:normal;background:linear-gradient(100deg,#ffd45c 0%,#fff3b0 40%,#ffb11a 60%,#ffd45c 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;animation:hero-shine 3.2s linear infinite;filter:drop-shadow(0 2px 8px rgba(0,0,0,.35))}
        .hero-am .hero-t1,.hero-am .hero-t2{font-size:clamp(26px,8vw,36px);line-height:1.12}
        .hero-brand{display:flex;align-items:center;gap:7px;margin:8px 0 0;font-size:13px;font-weight:800;letter-spacing:.05em;color:#fff;text-shadow:0 1px 8px rgba(0,0,0,.5)}
        .hero-brand i{width:8px;height:8px;border-radius:50%;background:#4ade80;animation:hero-ping 1.8s ease-out infinite}
        .hero-brand b{font-weight:700;color:#b6ffc8}
        @keyframes hero-rise{to{opacity:1;transform:none}}
        @keyframes hero-fade{to{opacity:1}}
        @keyframes hero-shine{from{background-position:0% 0}to{background-position:-200% 0}}
        @keyframes hero-ping{0%{box-shadow:0 0 0 0 rgba(74,222,128,.6)}100%{box-shadow:0 0 0 9px rgba(74,222,128,0)}}
        @media (prefers-reduced-motion:reduce){
          .hero-in,.hero-img{animation:none;opacity:1;transform:none}
          .hero-t2 em,.hero-brand i{animation:none}
        }
      `}</style>

      {/* your original image, shown exactly as it is (no recompression) */}
      <div className="hero-img absolute inset-0">
        <Image
          src={HERO_SRC}
          alt="Edlen"
          fill
          priority
          unoptimized
          sizes="(max-width: 480px) 100vw, 480px"
          className="object-cover object-[82%_50%]"
        />
      </div>

      {/* the texts, on the left side of the image */}
      <div className={`relative z-10 flex h-full max-w-[54%] flex-col justify-center gap-2 pl-5 ${am ? 'hero-am' : ''}`}>
        <p className="hero-kicker hero-in" style={{ animationDelay: '.1s' }}>
          {am ? 'እድልዎን ይሞክሩ' : 'Try your chance'}
        </p>
        <h1 className="hero-title">
          <span className="hero-t1 hero-in" style={{ animationDelay: '.25s' }}>{am ? 'ዛሬ' : 'Today'}</span>
          <span className="hero-t2 hero-in" style={{ animationDelay: '.4s' }}><em>{am ? 'የእርስዎ ነው' : 'is yours'}</em></span>
        </h1>
        <p className="hero-brand hero-in" style={{ animationDelay: '.6s' }}>
          <i /> Edlen <b>· እድሌን</b>
        </p>
      </div>
    </section>
  );
}