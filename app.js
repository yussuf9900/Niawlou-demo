/**
 * NIAWLOU — Mini App Orange Max It & PWA
 * Architecture SPA réactive & Synchronisation Multi-Rôle (Cliente et Atelier)
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

// Horloge pour la fausse status bar sur Desktop
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

// Détection Mobile & PWA Native
function checkMobileMode() {
  const isMobile = window.innerWidth <= 820 ||
                   window.matchMedia('(display-mode: standalone)').matches ||
                   /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    document.body.classList.add('is-mobile-app');
  } else {
    document.body.classList.remove('is-mobile-app');
  }
}
window.addEventListener('resize', checkMobileMode);
checkMobileMode();

// Navigation entre les vues mobiles
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

// Mise en surbrillance de l'onglet actif
function setActiveTab(id) {
  document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
  const tab = document.getElementById(id);
  if (tab) tab.classList.add('active');
}

// Toast de synchronisation temps réel
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
  }, 4200);
}

// Bascule de Rôle (Cliente Awa Diop et Atelier Maison Aïssatou)
function setRole(role, notify = true) {
  STATE.currentRole = role;
  
  // Boutons Desktop (barre supérieure jury)
  const btnClient = document.getElementById('btnRoleClient');
  const btnCouturier = document.getElementById('btnRoleCouturier');
  
  // Boutons Header In-App (Mobile & PWA)
  const btnHClient = document.getElementById('btnHeaderClient');
  const btnHCouturier = document.getElementById('btnHeaderCouturier');

  // Boutons Profil
  const btnPClient = document.getElementById('profilSwitchClient');
  const btnPCouturier = document.getElementById('profilSwitchAtelier');

  // Sous-titre Header
  const headerSubtitle = document.getElementById('headerSubtitle');
  const userHeaderName = document.getElementById('userHeaderName');
  
  if (role === 'client') {
    if (btnClient) btnClient.classList.add('active');
    if (btnCouturier) btnCouturier.classList.remove('active');
    if (btnHClient) btnHClient.classList.add('active');
    if (btnHCouturier) btnHCouturier.classList.remove('active');
    if (btnPClient) {
      btnPClient.classList.add('border-primary-dark', 'bg-emerald-50');
      btnPClient.classList.remove('border-gray-200', 'bg-white');
    }
    if (btnPCouturier) {
      btnPCouturier.classList.remove('border-primary-dark', 'bg-emerald-50');
      btnPCouturier.classList.add('border-gray-200', 'bg-white');
    }

    if (headerSubtitle) headerSubtitle.innerText = 'Haute Couture Dakar';
    if (userHeaderName) userHeaderName.innerText = 'Awa Diop';
    
    // Mettre à jour l'onglet actif
    if (STATE.order.status === 'DEVIS_RECU') {
      showView('view-devis');
      setActiveTab('tabCommandes');
    } else if (STATE.order.status === 'ACOMPTE_PAYE' || STATE.order.status === 'EN_CONFECTION') {
      showView('view-suivi');
      setActiveTab('tabCommandes');
    } else if (STATE.order.status === 'SOLDE_PAYE') {
      showView('view-recu');
      setActiveTab('tabCommandes');
    } else {
      showView('view-decouvrir');
      setActiveTab('tabDecouvrir');
    }
  } else {
    if (btnCouturier) btnCouturier.classList.add('active');
    if (btnClient) btnClient.classList.remove('active');
    if (btnHCouturier) btnHCouturier.classList.add('active');
    if (btnHClient) btnHClient.classList.remove('active');
    if (btnPCouturier) {
      btnPCouturier.classList.add('border-primary-dark', 'bg-emerald-50');
      btnPCouturier.classList.remove('border-gray-200', 'bg-white');
    }
    if (btnPClient) {
      btnPClient.classList.remove('border-primary-dark', 'bg-emerald-50');
      btnPClient.classList.add('border-gray-200', 'bg-white');
    }

    if (headerSubtitle) headerSubtitle.innerText = 'Espace Artisan Dakar';
    if (userHeaderName) userHeaderName.innerText = 'Maison Aïssatou';
    
    showView('view-atelier-dashboard');
    setActiveTab('tabCommandes');
  }

  if (notify) {
    showLiveToast(
      role === 'client' ? 'Espace Cliente · Awa Diop' : 'Espace Atelier · Maison Aïssatou',
      role === 'client' ? 'Catalogue, carnet de mesures et commandes' : 'Gestion des commandes reçues et transmission des devis'
    );
  }
}

// Modale de Paiement Orange Money
function openOrangeMoney(amount, purpose, onCompleted) {
  const overlay = document.getElementById('omOverlay');
  const amountText = document.getElementById('omAmountText');
  const payBtn = document.getElementById('omPayBtn');
  
  if (amountText) amountText.innerText = `${amount.toLocaleString('fr-FR')} FCFA`;
  if (overlay) overlay.style.display = 'flex';
  
  if (payBtn) {
    payBtn.onclick = () => {
      payBtn.innerText = 'Validation Orange Money...';
      payBtn.style.opacity = '0.7';
      
      setTimeout(() => {
        if (overlay) overlay.style.display = 'none';
        payBtn.innerText = 'Confirmer le paiement';
        payBtn.style.opacity = '1';
        
        showLiveToast(
          'Paiement Orange Money Réussi',
          `${amount.toLocaleString('fr-FR')} FCFA débités avec succès. Réf: OM-DKR-8924`
        );
        
        if (onCompleted) onCompleted();
      }, 1000);
    };
  }
}

// Gestionnaire d'installation PWA
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  console.log('NIAWLOU PWA disponible pour installation');
});

function triggerPwaInstall() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        showLiveToast('Installation confirmée', 'L\'application NIAWLOU a été ajoutée à votre appareil.');
      }
      deferredInstallPrompt = null;
    });
  } else {
    showLiveToast(
      'Installation PWA Max It',
      'Sur iPhone : appuyez sur le bouton Partager puis "Sur l\'écran d\'accueil". Sur Android : sélectionnez "Installer l\'application".'
    );
  }
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {

  // 1. Boutons Rôles (Desktop Header)
  const btnRoleClient = document.getElementById('btnRoleClient');
  const btnRoleCouturier = document.getElementById('btnRoleCouturier');
  if (btnRoleClient) btnRoleClient.onclick = () => setRole('client');
  if (btnRoleCouturier) btnRoleCouturier.onclick = () => setRole('couturier');

  // 2. Boutons Rôles (In-App Mobile & PWA Header)
  const btnHeaderClient = document.getElementById('btnHeaderClient');
  const btnHeaderCouturier = document.getElementById('btnHeaderCouturier');
  if (btnHeaderClient) btnHeaderClient.onclick = () => setRole('client');
  if (btnHeaderCouturier) btnHeaderCouturier.onclick = () => setRole('couturier');

  // 3. Boutons Rôles (Vue Profil)
  const profilSwitchClient = document.getElementById('profilSwitchClient');
  const profilSwitchAtelier = document.getElementById('profilSwitchAtelier');
  if (profilSwitchClient) profilSwitchClient.onclick = () => setRole('client');
  if (profilSwitchAtelier) profilSwitchAtelier.onclick = () => setRole('couturier');

  // 4. Découvrir -> Choix Robe Nala
  const btnSelectNala = document.getElementById('btnSelectNala');
  if (btnSelectNala) {
    btnSelectNala.onclick = () => {
      showView('view-mensurations');
      showLiveToast('Robe Nala Sélectionnée', 'Vérifiez vos mensurations et l’adresse de réception');
    };
  }

  // 5. Retour vers Découvrir
  const btnBackToDecouvrir = document.getElementById('btnBackToDecouvrir');
  if (btnBackToDecouvrir) {
    btnBackToDecouvrir.onclick = () => {
      showView('view-decouvrir');
      setActiveTab('tabDecouvrir');
    };
  }

  // 6. Soumettre la Demande à l'Atelier
  const btnSubmitDemande = document.getElementById('btnSubmitDemande');
  if (btnSubmitDemande) {
    btnSubmitDemande.onclick = () => {
      STATE.order.status = 'EN_ATTENTE_DEVIS';
      showLiveToast(
        'Demande transmise à Maison Aïssatou',
        'L’atelier examine vos mesures. Basculez côté Couturier pour le chiffrage !',
        'Atelier',
        () => setRole('couturier')
      );
      // Bascule automatique côté atelier après 1.2s pour tester le flux
      setTimeout(() => {
        setRole('couturier');
      }, 1200);
    };
  }

  // 7. Atelier : Préparer et Envoyer le Devis
  const btnPrepareDevis = document.getElementById('btnPrepareDevis');
  if (btnPrepareDevis) {
    btnPrepareDevis.onclick = () => {
      STATE.order.status = 'DEVIS_RECU';
      showLiveToast(
        'Devis Officiel Émis (36 500 FCFA)',
        'Devis transmis à Awa Diop. Basculez côté Cliente pour validation !',
        'Cliente',
        () => setRole('client')
      );
      setTimeout(() => {
        setRole('client');
        showView('view-devis');
        setActiveTab('tabCommandes');
      }, 1200);
    };
  }

  // 8. Cliente : Accepter Devis & Payer Acompte OM
  const btnAcceptDevis = document.getElementById('btnAcceptDevis');
  if (btnAcceptDevis) {
    btnAcceptDevis.onclick = () => {
      openOrangeMoney(15000, "Acompte Commande NIA-0248", () => {
        STATE.order.status = 'ACOMPTE_PAYE';
        showView('view-suivi');
        setActiveTab('tabCommandes');
        showLiveToast('Confection Lancée', 'Maison Aïssatou a reçu l’acompte et entame la coupe.');
      });
    };
  }

  // 9. Simuler la Livraison & Règlement du Solde
  const btnSimulateDelivery = document.getElementById('btnSimulateDelivery');
  if (btnSimulateDelivery) {
    btnSimulateDelivery.onclick = () => {
      openOrangeMoney(21500, "Solde Commande NIA-0248", () => {
        STATE.order.status = 'SOLDE_PAYE';
        showView('view-recu');
        setActiveTab('tabCommandes');
      });
    };
  }

  // 10. Recommencer la Démo / Réinitialiser
  function resetOrderDemo() {
    STATE.order.status = 'EN_ATTENTE_DEVIS';
    setRole('client', false);
    showView('view-decouvrir');
    setActiveTab('tabDecouvrir');
    showLiveToast('Démonstration Réinitialisée', 'Prêt pour un nouveau parcours de test.');
  }

  const btnRestartDemo = document.getElementById('btnRestartDemo');
  if (btnRestartDemo) btnRestartDemo.onclick = resetOrderDemo;

  const btnResetTestMobile = document.getElementById('btnResetTestMobile');
  if (btnResetTestMobile) btnResetTestMobile.onclick = resetOrderDemo;

  // 11. Navigation par Onglets Principaux
  const tabDecouvrir = document.getElementById('tabDecouvrir');
  if (tabDecouvrir) {
    tabDecouvrir.onclick = (e) => {
      e.preventDefault();
      setActiveTab('tabDecouvrir');
      showView('view-decouvrir');
    };
  }

  const tabCommandes = document.getElementById('tabCommandes');
  if (tabCommandes) {
    tabCommandes.onclick = (e) => {
      e.preventDefault();
      setActiveTab('tabCommandes');
      if (STATE.currentRole === 'couturier') {
        showView('view-atelier-dashboard');
      } else {
        if (STATE.order.status === 'SOLDE_PAYE') {
          showView('view-recu');
        } else if (STATE.order.status === 'DEVIS_RECU') {
          showView('view-devis');
        } else {
          showView('view-suivi');
        }
      }
    };
  }

  const tabMessages = document.getElementById('tabMessages');
  if (tabMessages) {
    tabMessages.onclick = (e) => {
      e.preventDefault();
      setActiveTab('tabMessages');
      showView('view-messages');
    };
  }

  const tabProfil = document.getElementById('tabProfil');
  if (tabProfil) {
    tabProfil.onclick = (e) => {
      e.preventDefault();
      setActiveTab('tabProfil');
      showView('view-profil');
    };
  }

  // 12. Boutons d'installation PWA
  const btnInstallPwa = document.getElementById('btnInstallPwa');
  if (btnInstallPwa) btnInstallPwa.onclick = triggerPwaInstall;

  const btnInstallPwaMobile = document.getElementById('btnInstallPwaMobile');
  if (btnInstallPwaMobile) btnInstallPwaMobile.onclick = triggerPwaInstall;

  // 13. Mode Démo Automatique Guidée (Pitch Bureau Jury)
  const autoPlaySteps = [
    { fn: () => { setRole('client', false); showView('view-decouvrir'); setActiveTab('tabDecouvrir'); }, note: "1. Découverte de la Robe Nala (35 000 FCFA)", wait: 3500 },
    { fn: () => { showView('view-mensurations'); }, note: "2. Mesures d'Awa Diop & Course à Mermoz", wait: 3000 },
    { fn: () => { setRole('couturier', false); }, note: "3. Tableau de bord Maison Aïssatou (3 demandes)", wait: 3200 },
    { fn: () => { setRole('client', false); showView('view-devis'); setActiveTab('tabCommandes'); }, note: "4. Devis officiel : 36 500 F (Acompte : 15 000 F)", wait: 3200 },
    { fn: () => { showView('view-suivi'); setActiveTab('tabCommandes'); }, note: "5. Suivi direct : Coupe & photo du bustier", wait: 3500 },
    { fn: () => { showView('view-recu'); setActiveTab('tabCommandes'); }, note: "6. Remise constatée & Reçu certifié Orange Money", wait: 3500 }
  ];

  let currentStepIdx = 0;
  const btnAutoPlay = document.getElementById('btnAutoPlay');

  if (btnAutoPlay) {
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
  }

  function runNextAutoPlay() {
    if (!STATE.autoPlayActive) return;
    if (currentStepIdx >= autoPlaySteps.length) {
      if (btnAutoPlay) btnAutoPlay.click();
      return;
    }
    const step = autoPlaySteps[currentStepIdx];
    step.fn();
    showLiveToast('Présentation Guidée', step.note);
    currentStepIdx++;
    STATE.autoPlayTimer = setTimeout(runNextAutoPlay, step.wait);
  }

  // 14. Enregistrement du Service Worker PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(() => {
      console.log('NIAWLOU PWA Service Worker actif');
    }).catch(err => console.log('SW error:', err));
  }
});
