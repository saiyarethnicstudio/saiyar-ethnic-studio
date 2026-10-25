// Generates tasteful placeholder illustrations (800x1000) until real photos are added.
const dark = (hex, k) => '#' + hex.slice(1).match(/../g).map(h => Math.max(0, Math.round(parseInt(h, 16) * k)).toString(16).padStart(2, '0')).join('');

module.exports = function art(kind, { c, a, bg }) {
  const shade = dark(c, 0.82), deep = dark(c, 0.68);
  const sparkle = [[130,260,5],[670,300,4],[110,560,3],[700,640,5],[640,150,3],[170,120,4]]
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${a}" opacity=".7"/>`).join('');
  let g = '';
  if (kind === 'choli') {
    g = `<path d="M470 235 Q570 340 525 620 Q505 730 548 905" fill="none" stroke="${a}" stroke-width="16" stroke-linecap="round" opacity=".85"/>
    <path d="M335 225 Q400 275 465 225 L492 335 Q482 385 470 412 L330 412 Q318 385 308 335 Z" fill="${c}"/>
    <rect x="330" y="404" width="140" height="22" fill="${a}"/>
    <path d="M330 424 L470 424 L615 905 Q400 950 185 905 Z" fill="${shade}"/>
    <path d="M200 858 Q400 905 600 858 L615 905 Q400 950 185 905 Z" fill="${a}"/>
    <path d="M400 430 L400 880 M350 430 L295 875 M450 430 L505 875" stroke="${a}" stroke-width="2" opacity=".5"/>`;
  } else if (kind === 'saree') {
    g = `<path d="M360 190 Q400 170 440 190 L458 335 Q474 490 506 705 L528 935 L272 935 L294 705 Q326 490 342 335 Z" fill="${c}"/>
    <path d="M350 232 L450 232 L458 335 L342 335 Z" fill="${deep}"/>
    <path d="M352 238 L478 335 Q568 530 548 935 L474 935 Q476 610 404 430 L342 335 Z" fill="${shade}"/>
    <rect x="272" y="900" width="256" height="35" fill="${a}"/>
    <path d="M552 700 L548 935" stroke="${a}" stroke-width="10"/>
    <path d="M340 560 L318 900 M372 520 L360 900 M404 520 L402 900 M436 520 L444 900" stroke="${deep}" stroke-width="2" opacity=".45"/>`;
  } else {
    g = `<path d="M345 205 L360 250 M455 205 L440 250" stroke="${c}" stroke-width="10" stroke-linecap="round"/>
    <path d="M345 245 Q400 285 455 245 L470 415 L330 415 Z" fill="${c}"/>
    <path d="M330 415 L470 415 Q565 700 650 935 Q400 985 150 935 Q235 700 330 415 Z" fill="${shade}"/>
    <rect x="326" y="404" width="148" height="24" fill="${a}"/>
    <path d="M400 430 L400 950 M365 430 L300 940 M435 430 L500 940" stroke="${deep}" stroke-width="2" opacity=".4"/>
    ${[[375,300],[425,300],[400,345],[360,380],[440,380]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${a}"/>`).join('')}`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000" role="img" aria-label="Illustration of a ${kind} outfit">
<rect width="800" height="1000" fill="${bg}"/>
<path d="M110 1000 V430 A290 290 0 0 1 690 430 V1000 Z" fill="#fff" opacity=".45"/>
${sparkle}${g}
<text x="400" y="982" text-anchor="middle" font-family="Georgia,serif" font-size="20" fill="${deep}" opacity=".6">Illustration · studio photo coming soon</text>
</svg>`;
};
