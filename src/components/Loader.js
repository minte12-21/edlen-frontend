import './Loader.css';

// Full-screen loader: logo orbit, brand name and a sliding bar. Used for the first visit, sign up, login and logout.
export default function Loader({ text, brand = true }) {
  return (
    <div className="ld" role="status" aria-live="polite">
      <div className="ld-stage">
        <span className="ld-ring" />
        <span className="ld-ring r2" />
        <span className="ld-ring r3" />
        <span className="ld-orbit"><span className="ld-ball" style={{ '--c': '#ffc83d' }} /></span>
        <span className="ld-orbit" style={{ animationDuration: '4.1s', transform: 'rotate(120deg)' }}><span className="ld-ball" style={{ '--c': '#ff5d73' }} /></span>
        <span className="ld-orbit" style={{ animationDuration: '2.7s', transform: 'rotate(240deg)', animationDirection: 'reverse' }}><span className="ld-ball" style={{ '--c': '#4cc9f0' }} /></span>
        <span className="ld-core"><img src="/logo.png" alt="Edlen" /></span>
      </div>
      {brand && (
        <div className="ld-brand">
          <div className="ld-name">Edlen</div>
          <div className="ld-sub">እድሌን • Pick • Pay • Win</div>
        </div>
      )}
      <div className="ld-bar"><i /></div>
      <div className="ld-text">{text || ''}</div>
    </div>
  );
}