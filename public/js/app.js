/* ============================================
   GiftShuffle — Client
   ============================================ */

const socket = io();

// ---- State ----
const state = {
  view: 'home',
  session: null,
  participantId: null,
  isOrganizer: false,
  assignment: null,
  manualQueue: [],
  manualIndex: 0,
  currentReveal: null,
};

// ---- SVG Icons ----
const ICONS = {
  gift: `<svg width="32" height="32" viewBox="0 0 28 28" fill="none"><rect x="4" y="13" width="20" height="13" rx="2.5" stroke="#FFFDF7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><rect x="2.5" y="9.5" width="23" height="6" rx="2" stroke="#FFFDF7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="14" y1="9.5" x2="14" y2="26" stroke="#FFFDF7" stroke-width="2.2" stroke-linecap="round"/><path d="M14 9.5C14 9.5 14 4 9.5 4C7.5 4 6.5 5.5 7.5 7C8.5 8.5 11 9.5 14 9.5Z" stroke="#C5952B" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 9.5C14 9.5 14 4 18.5 4C20.5 4 21.5 5.5 20.5 7C19.5 8.5 17 9.5 14 9.5Z" stroke="#C5952B" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  giftGold: `<svg width="34" height="34" viewBox="0 0 28 28" fill="none"><rect x="4" y="13" width="20" height="13" rx="2.5" stroke="#C5952B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><rect x="2.5" y="9.5" width="23" height="6" rx="2" stroke="#C5952B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="14" y1="9.5" x2="14" y2="26" stroke="#C5952B" stroke-width="2.2" stroke-linecap="round"/><path d="M14 9.5C14 9.5 14 4 9.5 4C7.5 4 6.5 5.5 7.5 7C8.5 8.5 11 9.5 14 9.5Z" stroke="#FFFDF7" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 9.5C14 9.5 14 4 18.5 4C20.5 4 21.5 5.5 20.5 7C19.5 8.5 17 9.5 14 9.5Z" stroke="#FFFDF7" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  giftSmall: `<svg width="14" height="14" viewBox="0 0 28 28" fill="none"><rect x="4" y="13" width="20" height="13" rx="2.5" stroke="#C5952B" stroke-width="2.5" fill="none"/><line x1="14" y1="13" x2="14" y2="26" stroke="#C5952B" stroke-width="2.5"/></svg>`,
  back: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 4L6 9l5 5" stroke="#1C1C1C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  share: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M12 6.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM4.5 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM12 16.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M6.7 10.2l4.6 3.1M11.3 4.7L6.7 7.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  info: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#1D4E3E" stroke-width="1.5" fill="none"/><path d="M10 9v4M10 7h.01" stroke="#1D4E3E" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  clock: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#1D4E3E" stroke-width="1.5" fill="none"/><path d="M10 6v4l3 2" stroke="#1D4E3E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  warning: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 7v3M10 13h.01" stroke="#D94040" stroke-width="1.5" stroke-linecap="round"/><circle cx="10" cy="10" r="8" stroke="#D94040" stroke-width="1.5" fill="none"/></svg>`,
  check: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 6l2 2 4-4" stroke="#FFFDF7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  remove: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8h8" stroke="#D94040" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  phone: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="5" y="2" width="8" height="14" rx="1.5" stroke="#C5952B" stroke-width="1.3" fill="none"/></svg>`,
  lock: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="9" width="12" height="9" rx="2" stroke="#1D4E3E" stroke-width="1.5" fill="none"/><path d="M7 9V6a3 3 0 016 0v3" stroke="#1D4E3E" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  phoneLarge: `<svg width="44" height="44" viewBox="0 0 44 44" fill="none"><rect x="12" y="5" width="20" height="34" rx="3.5" stroke="#1D4E3E" stroke-width="2.2" fill="none"/><line x1="19" y1="33" x2="25" y2="33" stroke="#1D4E3E" stroke-width="1.8" stroke-linecap="round"/><path d="M6 18l-3 4 3 4" stroke="#C5952B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 18l3 4-3 4" stroke="#C5952B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  giftLarge: `<svg width="42" height="42" viewBox="0 0 28 28" fill="none"><rect x="4" y="13" width="20" height="13" rx="2.5" stroke="#FFFDF7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><rect x="2.5" y="9.5" width="23" height="6" rx="2" stroke="#FFFDF7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="14" y1="9.5" x2="14" y2="26" stroke="#FFFDF7" stroke-width="2.2" stroke-linecap="round"/><path d="M14 9.5C14 9.5 14 4 9.5 4C7.5 4 6.5 5.5 7.5 7C8.5 8.5 11 9.5 14 9.5Z" stroke="#C5952B" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 9.5C14 9.5 14 4 18.5 4C20.5 4 21.5 5.5 20.5 7C19.5 8.5 17 9.5 14 9.5Z" stroke="#C5952B" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

function logoHTML(size = 60) {
  const iconSize = size === 60 ? 32 : 28;
  const radius = size === 60 ? 16 : 14;
  return `<div class="logo__icon" style="width:${size}px;height:${size}px;border-radius:${radius}px">
    <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 28 28" fill="none"><rect x="4" y="13" width="20" height="13" rx="2.5" stroke="#FFFDF7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><rect x="2.5" y="9.5" width="23" height="6" rx="2" stroke="#FFFDF7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="14" y1="9.5" x2="14" y2="26" stroke="#FFFDF7" stroke-width="2.2" stroke-linecap="round"/><path d="M14 9.5C14 9.5 14 4 9.5 4C7.5 4 6.5 5.5 7.5 7C8.5 8.5 11 9.5 14 9.5Z" stroke="#C5952B" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 9.5C14 9.5 14 4 18.5 4C20.5 4 21.5 5.5 20.5 7C19.5 8.5 17 9.5 14 9.5Z" stroke="#C5952B" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </div>`;
}

// ---- Views ----

function viewHome() {
  return `<div class="screen fade-in">
    <div class="screen__spacer"></div>
    <div class="logo mb-44">${logoHTML()}
      <div class="logo__text">
        <div class="logo__name">GiftShuffle</div>
        <div class="logo__tagline">Le hasard fait bien les cadeaux</div>
      </div>
    </div>
    <div class="mb-28">
      <div class="heading-lg mb-8">Organise ton Secret Santa en 2 minutes</div>
      <div class="text-body">Crée une session, invite tes amis, et laisse le hasard faire le reste.</div>
    </div>
    <div class="btn-stack mb-24">
      <button class="btn btn--primary" data-action="go-create">Créer une session</button>
      <button class="btn btn--secondary" data-action="go-join">Rejoindre avec un code</button>
    </div>
    <div class="info-box">
      <div class="info-box__icon">${ICONS.info}</div>
      <div class="info-box__text">Aucun compte requis. Tout fonctionne par session éphémère.</div>
    </div>
    <div class="screen__grow"></div>
    <div class="home-indicator"><div class="home-indicator__bar"></div></div>
  </div>`;
}

function viewCreate() {
  return `<div class="screen fade-in">
    <div class="screen__spacer"></div>
    <div class="logo mb-44">${logoHTML()}
      <div class="logo__text">
        <div class="logo__name">GiftShuffle</div>
        <div class="logo__tagline">Le hasard fait bien les cadeaux</div>
      </div>
    </div>
    <div class="mb-28">
      <div class="heading-lg mb-8">Nouvelle session</div>
      <div class="text-body">Remplis les infos pour démarrer.</div>
    </div>
    <div class="form-group mb-24">
      <div class="field">
        <label class="field__label" for="org-name">Ton prénom</label>
        <input class="field__input" id="org-name" type="text" placeholder="Ex : Marie" autocomplete="off">
      </div>
      <div class="field">
        <label class="field__label" for="session-name">Nom de la session</label>
        <input class="field__input" id="session-name" type="text" placeholder="Ex : Noël en famille" autocomplete="off">
      </div>
      <div class="field">
        <div class="field__label-row">
          <span class="field__label">Budget suggéré</span>
          <span class="field__optional">Optionnel</span>
        </div>
        <div class="budget-chips">
          <button class="chip" data-budget="10-20">10–20 €</button>
          <button class="chip" data-budget="20-30">20–30 €</button>
          <button class="chip" data-budget="30+">30+ €</button>
        </div>
      </div>
    </div>
    <div class="info-box mb-24">
      <div class="info-box__icon">${ICONS.info}</div>
      <div class="info-box__text">Les participants rejoindront via un lien ou un QR code. Aucun compte requis.</div>
    </div>
    <div class="screen__grow"></div>
    <div class="pb-32">
      <button class="btn btn--primary" data-action="create-session">Créer la session</button>
    </div>
    <div class="home-indicator"><div class="home-indicator__bar"></div></div>
  </div>`;
}

function viewQRCode() {
  const s = state.session;
  return `<div class="screen fade-in">
    <div class="screen__spacer"></div>
    <div class="topbar">
      <button class="topbar__back" data-action="go-lobby">${ICONS.back}</button>
      <div class="topbar__title">Inviter des participants</div>
      <div class="topbar__spacer"></div>
    </div>
    <div class="text-center mb-28">
      <div class="session-badge">
        <span class="session-badge__label">Session </span>
        <span class="session-badge__code">${s.name}</span>
      </div>
    </div>
    <div class="qr-wrapper mb-24" id="qr-container"></div>
    <div class="text-center text-body mb-8">ou entre le code</div>
    <div class="code-display mb-32">
      ${s.code.split('').map(c => `<div class="code-char">${c}</div>`).join('')}
    </div>
    <div class="btn-stack">
      <button class="btn btn--primary" data-action="share-link">${ICONS.share} Partager le lien</button>
      <button class="btn btn--secondary" data-action="copy-code">Copier le code</button>
    </div>
    <div class="screen__grow"></div>
    <div class="text-center pb-32">
      <button class="btn btn--ghost" data-action="go-manual-add" style="color:var(--forest);font-weight:600">Ajouter manuellement un participant</button>
    </div>
    <div class="home-indicator"><div class="home-indicator__bar"></div></div>
  </div>`;
}

function viewLobby() {
  const s = state.session;
  const connected = s.participants.filter(p => p.mode === 'connected').length;
  const manual = s.participants.filter(p => p.mode === 'manual').length;
  return `<div class="screen fade-in">
    <div class="screen__spacer"></div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
      <div>
        <div class="heading-md">${s.name}</div>
        <div class="text-small" style="margin-top:4px">Code : <span style="font-weight:600;color:var(--forest)">${s.code}</span></div>
      </div>
      <button class="topbar__back" data-action="go-qr">${ICONS.share}</button>
    </div>
    <div class="count-bar mb-20">
      <div class="count-bar__label">Participants</div>
      <div class="count-bar__value">${s.participants.length}</div>
    </div>
    <div class="participant-list mb-20" id="participant-list">
      ${s.participants.map(p => participantCardHTML(p)).join('')}
    </div>
    <div class="screen__grow"></div>
    <div class="btn-stack pb-32">
      <button class="btn btn--primary" data-action="go-launch" ${s.participants.length < 3 ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ''}>Lancer le tirage</button>
      <div class="btn-row">
        <button class="btn btn--secondary btn--small" data-action="go-qr">Inviter</button>
        <button class="btn btn--secondary btn--small" data-action="go-manual-add">Ajouter</button>
      </div>
    </div>
    <div class="home-indicator"><div class="home-indicator__bar"></div></div>
  </div>`;
}

function participantCardHTML(p) {
  const initial = p.name.charAt(0).toUpperCase();
  const isMe = p.id === state.participantId;
  const statusClass = p.mode === 'connected' ? 'participant-card__status--connected' : 'participant-card__status--manual';
  const statusText = p.isOrganizer ? 'Organisatrice' : (p.mode === 'connected' ? 'Connecté(e)' : 'Passe-le-téléphone');
  const badge = p.mode === 'connected'
    ? `<div class="participant-card__check">${ICONS.check}</div>`
    : ICONS.phone;
  const removable = !p.isOrganizer && state.isOrganizer;
  return `<div class="participant-card">
    <div class="participant-card__avatar" style="background:${p.color}">${initial}</div>
    <div class="participant-card__info">
      <div class="participant-card__name">${p.name}${isMe ? ' <span>(toi)</span>' : ''}</div>
      <div class="participant-card__status ${statusClass}">${statusText}</div>
    </div>
    ${badge}
    ${removable ? `<button class="participant-card__remove" data-action="remove-participant" data-id="${p.id}">${ICONS.remove}</button>` : ''}
  </div>`;
}

function viewManualAdd() {
  return `<div class="screen fade-in">
    <div class="screen__spacer"></div>
    <div class="topbar">
      <button class="topbar__back" data-action="go-lobby">${ICONS.back}</button>
      <div class="topbar__title">Ajout manuel</div>
      <div class="topbar__spacer"></div>
    </div>
    <div class="mb-28">
      <div class="heading-md mb-8">Ajouter quelqu'un qui n'a pas de téléphone</div>
      <div class="text-body">Cette personne découvrira son tirage en mode passe-le-téléphone.</div>
    </div>
    <div class="form-group mb-24">
      <div class="field">
        <label class="field__label" for="manual-name">Prénom du participant</label>
        <input class="field__input" id="manual-name" type="text" placeholder="Ex : Papy Jean" autocomplete="off">
      </div>
      <div class="field">
        <div class="field__label-row">
          <span class="field__label">Idée cadeau</span>
          <span class="field__optional">Optionnel</span>
        </div>
        <input class="field__input" id="manual-gift" type="text" placeholder="Ex : Des chaussettes bien chaudes" autocomplete="off">
      </div>
    </div>
    <div class="info-box mb-20">
      <div class="info-box__icon">${ICONS.phone}</div>
      <div class="info-box__text"><strong>Mode passe-le-téléphone</strong> — Après le tirage, chacun découvrira son résultat tour à tour sur ton téléphone.</div>
    </div>
    ${manualListHTML()}
    <div class="screen__grow"></div>
    <div class="btn-stack pb-32">
      <button class="btn btn--primary" data-action="add-manual">Ajouter ce participant</button>
      <button class="btn btn--ghost" data-action="go-lobby">Retour à la salle d'attente</button>
    </div>
    <div class="home-indicator"><div class="home-indicator__bar"></div></div>
  </div>`;
}

function manualListHTML() {
  const manuals = state.session.participants.filter(p => p.mode === 'manual');
  if (!manuals.length) return '';
  return `<div class="mb-16">
    <div class="field__label mb-8">Déjà ajoutés manuellement</div>
    <div class="participant-list">
      ${manuals.map(p => `<div class="participant-card">
        <div class="participant-card__avatar" style="background:${p.color}">${p.name.charAt(0).toUpperCase()}</div>
        <div class="participant-card__info">
          <div class="participant-card__name">${p.name}</div>
          <div class="participant-card__status participant-card__status--manual">Ajouté manuellement</div>
        </div>
        <button class="participant-card__remove" data-action="remove-participant" data-id="${p.id}">${ICONS.remove}</button>
      </div>`).join('')}
    </div>
  </div>`;
}

function viewLaunch() {
  const s = state.session;
  const connected = s.participants.filter(p => p.mode === 'connected').length;
  const manual = s.participants.filter(p => p.mode === 'manual').length;
  return `<div class="screen fade-in">
    <div class="screen__spacer"></div>
    <div class="text-center" style="margin-top:40px;margin-bottom:28px">
      <div class="icon-large icon-large--dark" style="margin:0 auto">${ICONS.giftLarge}</div>
    </div>
    <div class="heading-xl text-center mb-12">Prêt à lancer le tirage ?</div>
    <div class="text-body text-center mb-36" style="max-width:300px;margin-left:auto;margin-right:auto">Le tirage est définitif. Chaque participant découvrira ensuite à qui offrir un cadeau.</div>
    <div class="summary-card mb-32">
      <div class="summary-card__title">Récapitulatif</div>
      <div class="summary-row"><div class="summary-row__label">Session</div><div class="summary-row__value">${s.name}</div></div>
      <div class="summary-divider"></div>
      <div class="summary-row"><div class="summary-row__label">Participants</div><div class="summary-row__value">${s.participants.length} personnes</div></div>
      <div class="summary-divider"></div>
      <div class="summary-row"><div class="summary-row__label">Connectés</div><div class="summary-row__value summary-row__value--green">${connected} en ligne</div></div>
      ${manual > 0 ? `<div class="summary-divider"></div>
      <div class="summary-row"><div class="summary-row__label">Passe-le-téléphone</div><div class="summary-row__value summary-row__value--gold">${manual} personnes</div></div>` : ''}
      ${s.budget ? `<div class="summary-divider"></div>
      <div class="summary-row"><div class="summary-row__label">Budget</div><div class="summary-row__value">${s.budget.replace('-', '–')} €</div></div>` : ''}
    </div>
    <div class="info-box info-box--warning w-full mb-24">
      <div class="info-box__icon">${ICONS.warning}</div>
      <div class="info-box__text">Le tirage est irréversible. Vérifie que tout le monde est bien inscrit.</div>
    </div>
    <div class="screen__grow"></div>
    <div class="btn-stack pb-32">
      <button class="btn btn--primary" data-action="launch-draw">Lancer le tirage au sort</button>
      <button class="btn btn--ghost" data-action="go-lobby">Revenir en arrière</button>
    </div>
    <div class="home-indicator"><div class="home-indicator__bar"></div></div>
  </div>`;
}

function viewJoin(code) {
  return `<div class="screen fade-in">
    <div class="screen__spacer"></div>
    <div class="logo mb-36">${logoHTML(52)}
      <div class="heading-lg text-center">Rejoins le Secret Santa</div>
      ${code ? `<div class="session-badge"><span class="session-badge__label">Session </span><span class="session-badge__code">${code}</span></div>` : ''}
    </div>
    <div class="form-group mb-24">
      ${!code ? `<div class="field">
        <label class="field__label" for="join-code">Code de la session</label>
        <input class="field__input" id="join-code" type="text" placeholder="Ex : GS47K" autocomplete="off" style="text-transform:uppercase;letter-spacing:2px;font-weight:600" maxlength="5">
      </div>` : ''}
      <div class="field">
        <label class="field__label" for="join-name">Comment tu t'appelles ?</label>
        <input class="field__input" id="join-name" type="text" placeholder="Ex : Camille" autocomplete="off">
      </div>
      <div class="field">
        <div class="field__label-row">
          <span class="field__label">Une idée de cadeau ?</span>
          <span class="field__optional">Optionnel</span>
        </div>
        <input class="field__input" id="join-gift" type="text" placeholder="Ex : Un bouquin ou du chocolat" autocomplete="off">
      </div>
    </div>
    <div class="info-box">
      <div class="info-box__icon">${ICONS.clock}</div>
      <div class="info-box__text">L'organisateur lancera le tirage quand tout le monde sera prêt</div>
    </div>
    <div class="screen__grow"></div>
    <div class="pb-32">
      <button class="btn btn--primary" data-action="join-session" ${code ? `data-code="${code}"` : ''}>C'est parti !</button>
    </div>
    <div class="home-indicator"><div class="home-indicator__bar"></div></div>
  </div>`;
}

function viewWaiting() {
  const s = state.session;
  return `<div class="screen fade-in">
    <div class="screen__spacer"></div>
    <div class="text-center" style="margin-top:60px">
      <div class="logo mb-36">${logoHTML(52)}
        <div class="logo__text">
          <div class="logo__name">GiftShuffle</div>
        </div>
      </div>
      <div class="heading-md mb-12">En attente du tirage<span class="waiting-dots"><span>.</span><span>.</span><span>.</span></span></div>
      <div class="text-body mb-32">L'organisateur n'a pas encore lancé le tirage. Reste sur cette page.</div>
      <div class="session-badge mb-32">
        <span class="session-badge__label">Session </span>
        <span class="session-badge__code">${s.name}</span>
      </div>
      <div class="count-bar" style="max-width:200px;margin:0 auto">
        <div class="count-bar__label">En ligne</div>
        <div class="count-bar__value">${s.participants.length}</div>
      </div>
      <div style="margin-top:24px"><span class="pulse-dot"></span></div>
    </div>
    <div class="screen__grow"></div>
    <div class="home-indicator"><div class="home-indicator__bar"></div></div>
  </div>`;
}

function viewReveal() {
  const a = state.assignment;
  return `<div class="screen screen--dark fade-in" style="background:var(--forest)">
    <div class="screen__spacer"></div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:28px;margin-top:32px;position:relative;z-index:1">
      <div class="icon-large icon-large--gold-subtle">${ICONS.giftGold}</div>
      <div class="heading-lg heading--light text-center">Tu offres un cadeau à...</div>
      <div class="reveal-card scale-in">
        <div class="reveal-card__avatar">${a.name.charAt(0).toUpperCase()}</div>
        <div class="reveal-card__name">${a.name}</div>
        <div class="reveal-card__divider"></div>
        ${a.giftIdea ? `<div class="reveal-card__gift-label">Son idée cadeau</div>
        <div class="reveal-card__gift-text">${a.giftIdea}</div>` : `<div class="reveal-card__gift-label">Pas d'idée cadeau spécifiée</div>`}
        ${a.budget ? `<div class="reveal-card__budget">
          <div class="reveal-card__budget-label">Budget</div>
          <div class="reveal-card__budget-value">${a.budget.replace('-', '–')} €</div>
        </div>` : ''}
      </div>
    </div>
    <div class="screen__grow"></div>
    <div class="dark-footer">
      <div class="dark-footer__hint">Garde le secret !</div>
      <div class="dark-footer__brand">
        <div class="dark-footer__brand-icon">${ICONS.giftSmall}</div>
        <div class="dark-footer__brand-text">GiftShuffle</div>
      </div>
    </div>
    <div class="home-indicator home-indicator--dark"><div class="home-indicator__bar"></div></div>
  </div>`;
}

function viewPassPhone(participant) {
  const total = state.manualQueue.length;
  const current = state.manualIndex;
  return `<div class="screen fade-in">
    <div class="screen__spacer"></div>
    <div class="progress-dots mb-40" style="margin-top:16px">
      ${state.manualQueue.map((_, i) => {
        const cls = i < current ? 'progress-dot--active' : (i === current ? 'progress-dot--current' : '');
        return `<div class="progress-dot ${cls}"></div>`;
      }).join('')}
    </div>
    <div class="text-center">
      <div class="icon-large mb-36" style="margin:0 auto">${ICONS.phoneLarge}</div>
      <div class="heading-xl text-center mb-12">Passe le téléphone<br>à ${participant.name}</div>
      <div class="text-body text-center mb-40" style="max-width:280px;margin-left:auto;margin-right:auto">C'est à son tour de découvrir à qui il offre un cadeau</div>
    </div>
    <div class="pass-card mb-32">
      <div class="pass-card__avatar">${participant.name.charAt(0).toUpperCase()}</div>
      <div>
        <div class="pass-card__name">${participant.name}</div>
        <div class="pass-card__sub">Passe-le-téléphone</div>
      </div>
    </div>
    <div class="info-box">
      <div class="info-box__icon">${ICONS.lock}</div>
      <div class="info-box__text">Personne d'autre ne verra son résultat</div>
    </div>
    <div class="screen__grow"></div>
    <div class="pb-32 w-full">
      <button class="btn btn--primary" data-action="confirm-has-phone">C'est bon, ${participant.name} a le téléphone</button>
    </div>
    <div class="home-indicator"><div class="home-indicator__bar"></div></div>
  </div>`;
}

function viewRevealTap(participant, assignment) {
  return `<div class="screen screen--dark fade-in" style="background:var(--forest)">
    <div class="screen__spacer"></div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:24px;margin-top:32px;position:relative;z-index:1">
      <div>
        <div style="font-size:14px;color:rgba(255,253,247,0.5);font-weight:500;text-align:center">Passe-le-téléphone</div>
        <div class="heading-lg heading--light text-center" style="margin-top:6px">${participant.name}, tu offres<br>un cadeau à...</div>
      </div>
      <div class="reveal-card scale-in">
        <div class="reveal-card__avatar">${assignment.name.charAt(0).toUpperCase()}</div>
        <div class="reveal-card__name">${assignment.name}</div>
        <div class="reveal-card__divider"></div>
        ${assignment.giftIdea ? `<div class="reveal-card__gift-label">Son idée cadeau</div>
        <div class="reveal-card__gift-text">${assignment.giftIdea}</div>` : `<div class="reveal-card__gift-label">Pas d'idée cadeau spécifiée</div>`}
        ${assignment.budget ? `<div class="reveal-card__budget">
          <div class="reveal-card__budget-label">Budget</div>
          <div class="reveal-card__budget-value">${assignment.budget.replace('-', '–')} €</div>
        </div>` : ''}
      </div>
      <div class="autohide" id="autohide">
        <div class="autohide__label">Masquage automatique dans <span id="countdown">30</span>s</div>
        <div class="autohide__track"><div class="autohide__bar" id="autohide-bar" style="width:100%"></div></div>
      </div>
    </div>
    <div class="screen__grow"></div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding-bottom:32px;width:100%">
      <button class="btn btn--dark-ghost" data-action="hide-reveal">J'ai mémorisé, masquer</button>
      <div class="dark-footer__brand">
        <div class="dark-footer__brand-icon">${ICONS.giftSmall}</div>
        <div class="dark-footer__brand-text">GiftShuffle</div>
      </div>
    </div>
    <div class="home-indicator home-indicator--dark"><div class="home-indicator__bar"></div></div>
  </div>`;
}

function viewAllDone() {
  return `<div class="screen screen--dark fade-in" style="background:var(--forest)">
    <div class="screen__spacer"></div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:24px;margin-top:80px;position:relative;z-index:1">
      <div class="icon-large icon-large--gold-subtle" style="width:80px;height:80px;border-radius:22px">${ICONS.giftGold}</div>
      <div class="heading-xl heading--light text-center">Tirage terminé !</div>
      <div style="font-size:15px;color:rgba(255,253,247,0.6);text-align:center;line-height:1.5;max-width:280px">
        Tout le monde connaît sa personne. Joyeux Noël et bons cadeaux !
      </div>
    </div>
    <div class="screen__grow"></div>
    <div class="dark-footer">
      <button class="btn btn--dark-ghost" data-action="go-home">Retour à l'accueil</button>
      <div class="dark-footer__brand">
        <div class="dark-footer__brand-icon">${ICONS.giftSmall}</div>
        <div class="dark-footer__brand-text">GiftShuffle</div>
      </div>
    </div>
    <div class="home-indicator home-indicator--dark"><div class="home-indicator__bar"></div></div>
  </div>`;
}

// ---- Render ----
function render() {
  const app = document.getElementById('app');
  window.scrollTo(0, 0);
  let html = '';

  switch (state.view) {
    case 'home': html = viewHome(); break;
    case 'create': html = viewCreate(); break;
    case 'qr': html = viewQRCode(); break;
    case 'lobby': html = viewLobby(); break;
    case 'manual-add': html = viewManualAdd(); break;
    case 'launch': html = viewLaunch(); break;
    case 'join': html = viewJoin(state.joinCode || null); break;
    case 'waiting': html = viewWaiting(); break;
    case 'reveal': html = viewReveal(); break;
    case 'pass-phone': html = viewPassPhone(state.manualQueue[state.manualIndex]); break;
    case 'reveal-tap': html = viewRevealTap(state.manualQueue[state.manualIndex], state.currentReveal); break;
    case 'all-done': html = viewAllDone(); break;
  }

  app.innerHTML = html;

  if (state.view === 'qr') generateQR();
  if (state.view === 'reveal') launchConfetti();
  if (state.view === 'reveal-tap') startAutoHide();
  if (state.view === 'reveal') launchConfetti();

  document.body.style.background = (state.view === 'reveal' || state.view === 'reveal-tap' || state.view === 'all-done')
    ? 'var(--forest)' : 'var(--ivory)';
}

// ---- QR Code ----
function generateQR() {
  const container = document.getElementById('qr-container');
  if (!container) return;
  const url = `${window.location.origin}/#join/${state.session.code}`;
  container.innerHTML = '';
  new QRCode(container, {
    text: url,
    width: 180,
    height: 180,
    colorDark: '#1C1C1C',
    colorLight: '#FFFFFF',
    correctLevel: QRCode.CorrectLevel.M,
  });
}

// ---- Confetti ----
function launchConfetti() {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);
  const colors = ['#C5952B', '#D94040', '#1D4E3E', '#FFFDF7'];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 1.5 + 's';
    piece.style.animationDuration = (2 + Math.random() * 2) + 's';
    piece.style.width = (5 + Math.random() * 6) + 'px';
    piece.style.height = (8 + Math.random() * 8) + 'px';
    container.appendChild(piece);
  }
  setTimeout(() => container.remove(), 5000);
}

// ---- Auto-hide timer ----
let autoHideTimer = null;
function startAutoHide() {
  let seconds = 30;
  const bar = document.getElementById('autohide-bar');
  const countdown = document.getElementById('countdown');
  clearInterval(autoHideTimer);
  autoHideTimer = setInterval(() => {
    seconds--;
    if (countdown) countdown.textContent = seconds;
    if (bar) bar.style.width = (seconds / 30 * 100) + '%';
    if (seconds <= 0) {
      clearInterval(autoHideTimer);
      nextManualReveal();
    }
  }, 1000);
}

function nextManualReveal() {
  clearInterval(autoHideTimer);
  state.manualIndex++;
  if (state.manualIndex >= state.manualQueue.length) {
    state.view = 'all-done';
    render();
    launchConfetti();
  } else {
    state.view = 'pass-phone';
    render();
  }
}

// ---- Event delegation ----
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;

  switch (action) {
    case 'go-home':
      state.view = 'home';
      state.session = null;
      state.isOrganizer = false;
      window.location.hash = '';
      render();
      break;

    case 'go-create':
      state.view = 'create';
      render();
      break;

    case 'go-join':
      state.view = 'join';
      state.joinCode = null;
      render();
      break;

    case 'go-qr':
      state.view = 'qr';
      render();
      break;

    case 'go-lobby':
      state.view = 'lobby';
      render();
      break;

    case 'go-manual-add':
      state.view = 'manual-add';
      render();
      break;

    case 'go-launch':
      state.view = 'launch';
      render();
      break;

    case 'create-session': {
      const name = document.getElementById('org-name').value.trim();
      const sessionName = document.getElementById('session-name').value.trim();
      const activeChip = document.querySelector('.chip--active');
      const budget = activeChip ? activeChip.dataset.budget : null;
      if (!name) return alert('Entre ton prénom');
      if (!sessionName) return alert('Donne un nom à la session');
      socket.emit('create-session', { organizerName: name, sessionName, budget }, (res) => {
        if (!res.ok) return alert(res.error);
        state.session = res.session;
        state.participantId = res.participantId;
        state.isOrganizer = true;
        state.view = 'qr';
        window.location.hash = `session/${res.code}`;
        render();
      });
      break;
    }

    case 'join-session': {
      const code = btn.dataset.code || document.getElementById('join-code')?.value.trim().toUpperCase();
      const name = document.getElementById('join-name').value.trim();
      const giftIdea = document.getElementById('join-gift')?.value.trim() || null;
      if (!code) return alert('Entre le code de la session');
      if (!name) return alert('Entre ton prénom');
      socket.emit('join-session', { code, name, giftIdea }, (res) => {
        if (!res.ok) return alert(res.error);
        state.session = res.session;
        state.participantId = res.participantId;
        state.isOrganizer = false;
        state.view = 'waiting';
        window.location.hash = `waiting/${code}`;
        render();
      });
      break;
    }

    case 'add-manual': {
      const name = document.getElementById('manual-name').value.trim();
      const giftIdea = document.getElementById('manual-gift')?.value.trim() || null;
      if (!name) return alert('Entre le prénom du participant');
      socket.emit('add-manual', { code: state.session.code, name, giftIdea }, (res) => {
        if (!res.ok) return alert(res.error);
        document.getElementById('manual-name').value = '';
        document.getElementById('manual-gift').value = '';
      });
      break;
    }

    case 'remove-participant': {
      const id = btn.dataset.id;
      socket.emit('remove-participant', { code: state.session.code, participantId: id });
      break;
    }

    case 'launch-draw': {
      socket.emit('launch-draw', { code: state.session.code }, (res) => {
        if (!res.ok) return alert(res.error);
        if (res.manualParticipants && res.manualParticipants.length > 0) {
          state.manualQueue = res.manualParticipants;
          state.manualIndex = 0;
          state.view = 'pass-phone';
          render();
          launchConfetti();
        } else {
          state.view = 'all-done';
          render();
          launchConfetti();
        }
      });
      break;
    }

    case 'confirm-has-phone': {
      const participant = state.manualQueue[state.manualIndex];
      socket.emit('get-manual-assignment', { code: state.session.code, participantId: participant.id }, (res) => {
        if (!res.ok) return;
        state.currentReveal = res.assignment;
        state.view = 'reveal-tap';
        render();
      });
      break;
    }

    case 'hide-reveal':
      nextManualReveal();
      break;

    case 'share-link': {
      const url = `${window.location.origin}/#join/${state.session.code}`;
      if (navigator.share) {
        navigator.share({ title: 'GiftShuffle', text: `Rejoins le Secret Santa "${state.session.name}" !`, url });
      } else {
        navigator.clipboard.writeText(url).then(() => alert('Lien copié !'));
      }
      break;
    }

    case 'copy-code': {
      navigator.clipboard.writeText(state.session.code).then(() => alert('Code copié !'));
      break;
    }
  }
});

// Budget chip toggle
document.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('chip--active'));
  chip.classList.add('chip--active');
});

// ---- Socket events ----
socket.on('participants-updated', ({ participants }) => {
  if (state.session) {
    state.session.participants = participants;
    if (state.view === 'lobby' || state.view === 'waiting' || state.view === 'manual-add') {
      render();
    }
  }
});

socket.on('draw-result', ({ assignment }) => {
  state.assignment = assignment;
  state.view = 'reveal';
  render();
});

// ---- Router (hash-based) ----
function handleRoute() {
  const hash = window.location.hash.replace('#', '');
  const parts = hash.split('/');

  if (parts[0] === 'join' && parts[1]) {
    state.joinCode = parts[1].toUpperCase();
    state.view = 'join';
    render();
  } else if (!state.session) {
    state.view = 'home';
    render();
  }
}

window.addEventListener('hashchange', handleRoute);

// ---- Init ----
handleRoute();
