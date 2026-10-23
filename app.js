/**
 * NIAWLOU — Mini App Orange Max It
 * Architecture SPA réactive & Machine d'États Synchronisée
 */

// État centralisé de la commande pilote NIA-0248
const STATE = {
  currentRole: 'client', // 'client' ou 'couturier'
  currentView: 'view-decouvrir',
  order: {
    id: "NIA-0248",
    garment: "Robe Nala",
    client: "Awa Diop",
    atelier: "Maison Aïssatou",
    deliveryAddress: "Mermoz, Dakar",
    priceFabric: 35000,
    deliveryFee: 1500,
    total: 36500,
    deposit: 15000,
    balance: 21500,
    status: "EN_ATTENTE_DEVIS", // EN_ATTENTE_DEVIS, DEVIS_RECU, ACOMPTE_PAYE, EN_CONFECTION, LIVRE, SOLDE_PAYE
    progressStep: 2 // 1: Coupe, 2: Assemblage, 3: Finitions, 4: Remise
  },
  autoPlayActive: false,
  autoPlayTimer: null
};

// Horloge temps réel pour la status bar iPhone
function updateClock() {
  const el = document.getElementById('phoneClock');
  if (!el) return;
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  el.innerText = `${h}:${m}`;
}
setInterval(updateClock, 1000);
updateClock();

// Gestion des vues mobiles
function showView(viewId) {
  document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add('active');
    STATE.currentView = viewId;
    
    // Remonter le scroll
    const content = document.getElementById('phoneContent');
    if (content) content.scrollTop = 0;
  }
}

// Toast de synchronisation multi-rôle
function showLiveToast(title, desc, actionLabel = 'Voir', onAction = null) {
  const toast = document.getElementById('liveToast');
  const tTitle = document.getElementById('toastTitle');
  const tDesc = document.getElementById('toastDesc');
  const tBtn = document.getElementById('toastActionBtn');
  
  if (!toast || !tTitle || !tDesc) return;
  
  tTitle.innerText = title;
  tDesc.innerText = desc;
  tBtn.innerText = actionLabel;
  tBtn.onclick = () => {
    toast.classList.remove('show');
    if (onAction) onAction();
  };
  
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}

// Bascule de Rôle (Cliente Awa Diop ⇄ Atelier Maison Aïssatou)
function setRole(role, notify = true) {
  STATE.currentRole = role;
  
  const btnClient = document.getElementById('btnRoleClient');
  const btnCouturier = document.getElementById('btnRoleCouturier');
  const userHeaderChip = document.getElementById('userHeaderChip');
  const userHeaderName = document.getElementById('userHeaderName');
  
  if (role === 'client') {
    btnClient.classList.add('active');
    btnCouturier.classList.remove('active');
    userHeaderName.innerText = 'Awa Diop';
    userHeaderChip.querySelector('img').src = 'assets/img_35.jpg';
    
    // Naviguer selon l'état de la commande
    if (STATE.order.status === 'DEVIS_RECU') {
      showView('view-devis');
    } else if (STATE.order.status === 'ACOMPTE_PAYE' || STATE.order.status === 'EN_CONFECTION') {
      showView('view-suivi');
    } else if (STATE.order.status === 'SOLDE_PAYE') {
      showView('view-recu');
    } else {
      showView('view-decouvrir');
    }
  } else {
    btnCouturier.classList.add('active');
    btnClient.classList.remove('active');
    userHeaderName.innerText = 'Maison Aïssatou';
    userHeaderChip.querySelector('img').src = 'assets/img_03.jpg';
    
    showView('view-atelier-dashboard');
  }

  if (notify) {
    showLiveToast(
      role === 'client' ? 'Espace Cliente · Awa Diop' : 'Espace Atelier · Maison Aïssatou',
      role === 'client' ? 'Navigation dans votre carnet de mesures et commandes' : 'Gestion des commandes et transmission des devis'
    );
  }
}

// Modale de Paiement Orange Money
function openOrangeMoney(amount, purpose, onCompleted) {
  const overlay = document.getElementById('omOverlay');
  const amountText = document.getElementById('omAmountText');
  const payBtn = document.getElementById('omPayBtn');
  
  amountText.innerText = `${amount.toLocaleString('fr-FR')} FCFA`;
  overlay.style.display = 'flex';
  
  payBtn.onclick = () => {
    payBtn.innerText = 'Validation Orange Money...';
    payBtn.style.opacity = '0.7';
    
    setTimeout(() => {
      overlay.style.display = 'none';
      payBtn.innerText = 'Confirmer le paiement';
      payBtn.style.opacity = '1';
      
      showLiveToast(
        'Paiement Orange Money Réussi',
        `${amount.toLocaleString('fr-FR')} FCFA débités avec succès. Réf: OM-DKR-8924`
      );
      
      if (onCompleted) onCompleted();
    }, 1200);
  };
}

// Écouteurs d'Événements et Logique Applicative
document.addEventListener('DOMContentLoaded', () => {

  // 1. Boutons Rôles
  document.getElementById('btnRoleClient').onclick = () => setRole('client');
  document.getElementById('btnRoleCouturier').onclick = () => setRole('couturier');

  // 2. Découvrir -> Choix Robe Nala
  document.getElementById('btnSelectNala').onclick = () => {
    showView('view-mensurations');
    showLiveToast('Robe Nala Sélectionnée', 'Vérifiez vos mensurations et l’adresse de livraison');
  };

  // 3. Retour vers Découvrir
  document.getElementById('btnBackToDecouvrir').onclick = () => showView('view-decouvrir');

  // 4. Soumettre la Demande
  document.getElementById('btnSubmitDemande').onclick = () => {
    STATE.order.status = 'EN_ATTENTE_DEVIS';
    showLiveToast(
      'Demande transmise à Maison Aïssatou',
      'L’atelier examine vos mesures. Basculez côté Couturier pour le chiffrage !',
      'Atelier',
      () => setRole('couturier')
    );
    // Bascule automatique côté atelier après 1.2s pour montrer l'interaction au jury
    setTimeout(() => {
      setRole('couturier');
    }, 1200);
  };

  // 5. Atelier : Préparer et Envoyer le Devis
  document.getElementById('btnPrepareDevis').onclick = () => {
    STATE.order.status = 'DEVIS_RECU';
    showLiveToast(
      'Devis Officiel Émis (36 500 FCFA)',
      'Devis transmis à Awa Diop. Basculez côté Cliente pour validation !',
      'Cliente',
      () => setRole('client')
    );
    // Bascule automatique vers Awa Diop
    setTimeout(() => {
      setRole('client');
      showView('view-devis');
    }, 1200);
  };

  // 6. Cliente : Accepter Devis & Payer Acompte OM
  document.getElementById('btnAcceptDevis').onclick = () => {
    openOrangeMoney(15000, "Acompte Commande NIA-0248", () => {
      STATE.order.status = 'ACOMPTE_PAYE';
      showView('view-suivi');
      showLiveToast('Confection Lancée', 'Maison Aïssatou a reçu l’acompte et entame la coupe.');
    });
  };

  // 7. Simuler la Livraison & Règlement du Solde
  document.getElementById('btnSimulateDelivery').onclick = () => {
    openOrangeMoney(21500, "Solde Commande NIA-0248", () => {
      STATE.order.status = 'SOLDE_PAYE';
      showView('view-recu');
    });
  };

  // 8. Recommencer la Démo
  document.getElementById('btnRestartDemo').onclick = () => {
    STATE.order.status = 'EN_ATTENTE_DEVIS';
    setRole('client', false);
    showView('view-decouvrir');
    showLiveToast('Démonstration Réinitialisée', 'Prêt pour une nouvelle présentation jury.');
  };

  // 9. Navigation par Onglets
  document.getElementById('tabDecouvrir').onclick = (e) => {
    e.preventDefault();
    setActiveTab('tabDecouvrir');
    showView('view-decouvrir');
  };
  document.getElementById('tabCommandes').onclick = (e) => {
    e.preventDefault();
    setActiveTab('tabCommandes');
    showView(STATE.order.status === 'SOLDE_PAYE' ? 'view-recu' : 'view-suivi');
  };
  document.getElementById('tabMessages').onclick = (e) => {
    e.preventDefault();
    setActiveTab('tabMessages');
    showLiveToast('Messagerie Atelier', 'Fil direct et sécurisé avec Maison Aïssatou');
  };
  document.getElementById('tabProfil').onclick = (e) => {
    e.preventDefault();
    setActiveTab('tabProfil');
    showLiveToast('Profil Awa Diop', 'Carnet de mesures validé · Perspectives Atelier du Futur');
  };

  function setActiveTab(id) {
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  // 10. Mode Démo Automatique Guidée (Pour le pitch oral du concours)
  const autoPlaySteps = [
    { fn: () => { setRole('client', false); showView('view-decouvrir'); }, note: "1. Découverte de la Robe Nala (35 000 FCFA)", wait: 3500 },
    { fn: () => { showView('view-mensurations'); }, note: "2. Mesures d'Awa Diop & Course à Mermoz", wait: 3000 },
    { fn: () => { setRole('couturier', false); }, note: "3. Tableau de bord Maison Aïssatou (3 demandes)", wait: 3200 },
    { fn: () => { setRole('client', false); showView('view-devis'); }, note: "4. Devis officiel : 36 500 F (Acompte : 15 000 F)", wait: 3200 },
    { fn: () => { showView('view-suivi'); }, note: "5. Suivi direct : Coupe & photo du bustier", wait: 3500 },
    { fn: () => { showView('view-recu'); }, note: "6. Remise constatée & Reçu certifié Orange Money", wait: 3500 }
  ];

  let currentStepIdx = 0;
  const btnAutoPlay = document.getElementById('btnAutoPlay');

  btnAutoPlay.onclick = () => {
    if (STATE.autoPlayActive) {
      clearTimeout(STATE.autoPlayTimer);
      STATE.autoPlayActive = false;
      btnAutoPlay.classList.remove('running');
      btnAutoPlay.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">play_arrow</span><span>Mode Démo Guidée</span>';
      showLiveToast('Mode Guidé Suspendu', 'Contrôle manuel réactivé.');
    } else {
      STATE.autoPlayActive = true;
      btnAutoPlay.classList.add('running');
      btnAutoPlay.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">pause</span><span>Arrêter le Mode Guidé</span>';
      currentStepIdx = 0;
      runNextAutoPlay();
    }
  };

  function runNextAutoPlay() {
    if (!STATE.autoPlayActive) return;
    if (currentStepIdx >= autoPlaySteps.length) {
      btnAutoPlay.click(); // Stop
      return;
    }
    const step = autoPlaySteps[currentStepIdx];
    step.fn();
    showLiveToast('Présentation Guidée', step.note);
    currentStepIdx++;
    STATE.autoPlayTimer = setTimeout(runNextAutoPlay, step.wait);
  }

  // 11. Enregistrement du Service Worker PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(() => {
      console.log('NIAWLOU PWA Service Worker actif');
    }).catch(err => console.log('SW error:', err));
  }
});
