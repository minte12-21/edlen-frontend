'use client';
import { useEffect, useState } from 'react';
import './page.css';
import Icon from '@/components/Icon';
import { api, img } from '@/lib/api';
import { useApp } from '@/context/Providers';

const handle = (v) => String(v).replace(/^@/, '').trim();
const tgUrl = (v) => (/^https?:/.test(v) ? v : `https://t.me/${handle(v)}`);
const ttUrl = (v) => (/^https?:/.test(v) ? v : `https://www.tiktok.com/@${handle(v)}`);

// Every piece is optional: whatever the admin leaves empty is simply not shown
export default function About() {
  const { t, lang } = useApp();
  const [a, setA] = useState(null);
  useEffect(() => { api('/about').then((d) => setA(d.about)).catch(() => setA({})); }, []);
  if (!a) return <p className="ed-sub">{t('loading')}</p>;

  const bio = lang === 'am' ? a.bioAm || a.bioEn : a.bioEn || a.bioAm;
  const title = a.ownerTitle ? (lang === 'am' ? t('owner_dev') : a.ownerTitle) : '';
  const hasProfile = a.photoUrl || a.ownerName || title || bio;

  const links = [
    a.telegram && { cls: 'tg', icon: 'send', label: t('c_telegram'), href: tgUrl(a.telegram) },
    a.phone && { cls: 'ph', icon: 'phone', label: t('c_call'), href: `tel:${a.phone}` },
    a.tiktok && { cls: 'tt', icon: 'music', label: t('c_tiktok'), href: ttUrl(a.tiktok) },
    a.email && { cls: 'em', icon: 'mail', label: t('c_email'), href: `mailto:${a.email}` },
  ].filter(Boolean);

  return (
    <div className="ed-page">
      {hasProfile && (
        <div className="ab-head">
          {(a.photoUrl || a.ownerName) && (
            <div className="ab-photo">{a.photoUrl ? <img src={img(a.photoUrl)} alt={a.ownerName || 'Owner'} /> : <span>{a.ownerName.charAt(0)}</span>}</div>
          )}
          {a.ownerName && <h1 className="ed-title">{a.ownerName}</h1>}
          {title && <div className="ab-title">{title}</div>}
          {bio && <p className="ab-bio">{bio}</p>}
        </div>
      )}

      {(links.length > 0 || a.location) && (
        <section className="ab-contact" id="contact">
          <h2>{t('contact_title')}</h2>
          <p>{t('contact_sub')}</p>
          {links.length > 0 && (
            <div className="ab-grid">
              {links.map((l) => (
                <a key={l.cls} className={`ab-link ${l.cls}`} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                  <i><Icon name={l.icon} size={22} /></i>{l.label}
                </a>
              ))}
            </div>
          )}
          {a.location && <div className="ab-place"><Icon name="pin" size={18} /> {a.location}</div>}
        </section>
      )}
      <p className="ab-foot">Edlen · እድሌን</p>
    </div>
  );
}