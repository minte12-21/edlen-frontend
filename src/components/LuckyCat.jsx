export default function LuckyCat({ text = 'Good luck! 🍀' }) {
  return (
    <div className="lc-wrap">
      <style>{`
        .lc-wrap{position:relative;display:flex;flex-direction:column;align-items:center;gap:8px;padding:24px}
        .lc-cat{animation:lc-bob 1.6s ease-in-out infinite}
        .lc-paw{transform-origin:150px 150px;animation:lc-wave .7s ease-in-out infinite alternate}
        .lc-tail{transform-origin:62px 170px;animation:lc-wag 1.2s ease-in-out infinite alternate}
        .lc-text{font-weight:800;font-size:1.3rem;animation:lc-pulse 1.2s ease-in-out infinite}
        .lc-s{position:absolute;font-size:1.4rem;animation:lc-float 2.4s ease-in-out infinite}
        .lc-s.a{left:12%;top:14%}
        .lc-s.b{right:12%;top:10%;animation-delay:.6s}
        .lc-s.c{left:18%;bottom:30%;animation-delay:1.2s}
        .lc-s.d{right:16%;bottom:34%;animation-delay:1.8s}
        @keyframes lc-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes lc-wave{from{transform:rotate(-14deg)}to{transform:rotate(24deg)}}
        @keyframes lc-wag{from{transform:rotate(-10deg)}to{transform:rotate(12deg)}}
        @keyframes lc-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
        @keyframes lc-float{0%{opacity:0;transform:translateY(12px) scale(.7)}50%{opacity:1}100%{opacity:0;transform:translateY(-18px) scale(1.1)}}
      `}</style>

      <span className="lc-s a">✨</span>
      <span className="lc-s b">⭐</span>
      <span className="lc-s c">💚</span>
      <span className="lc-s d">🍀</span>

      <svg className="lc-cat" viewBox="0 0 200 200" width="190" height="190" role="img" aria-label="Smiling cat">
        {/* tail */}
        <path className="lc-tail" d="M62 170 Q22 170 28 130" stroke="#f5b971" strokeWidth="12" strokeLinecap="round" fill="none" />
        {/* body */}
        <ellipse cx="100" cy="162" rx="46" ry="34" fill="#f5b971" />
        <ellipse cx="100" cy="170" rx="26" ry="22" fill="#fde3bd" />
        {/* waving paw */}
        <g className="lc-paw">
          <ellipse cx="152" cy="128" rx="11" ry="22" fill="#f5b971" />
          <ellipse cx="152" cy="112" rx="6" ry="5" fill="#fde3bd" />
        </g>
        {/* ears */}
        <polygon points="56,74 64,36 94,60" fill="#f5b971" />
        <polygon points="144,74 136,36 106,60" fill="#f5b971" />
        <polygon points="65,62 68,47 82,58" fill="#ff9aa2" />
        <polygon points="135,62 132,47 118,58" fill="#ff9aa2" />
        {/* head */}
        <ellipse cx="100" cy="102" rx="54" ry="46" fill="#f5b971" />
        {/* happy eyes */}
        <path d="M76 98 Q85 86 94 98" stroke="#3b2a1a" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <path d="M106 98 Q115 86 124 98" stroke="#3b2a1a" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        {/* blush */}
        <ellipse cx="70" cy="114" rx="8" ry="5" fill="#ff7a8a" opacity=".55" />
        <ellipse cx="130" cy="114" rx="8" ry="5" fill="#ff7a8a" opacity=".55" />
        {/* nose + smile */}
        <path d="M96 108 L104 108 L100 114 Z" fill="#ff6b81" />
        <path d="M100 114 Q93 124 86 118" stroke="#3b2a1a" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M100 114 Q107 124 114 118" stroke="#3b2a1a" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* whiskers */}
        <path d="M60 108 L38 104 M60 116 L38 120 M140 108 L162 104 M140 116 L162 120" stroke="#3b2a1a" strokeWidth="2" strokeLinecap="round" />
      </svg>

      <div className="lc-text">{text}</div>
    </div>
  );
}