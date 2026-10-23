# 👗 NIAWLOU — La Couture à vos Mesures
### Mini-Application FashionTech Sénégalaise · Défi Orange Max It 2026

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-103F35?style=flat&logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![Ecosystem](https://img.shields.io/badge/Orange-Max%20It-FF7900?style=flat)](https://www.orange.sn)
[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=flat&logo=vercel)](https://vercel.com)

**NIAWLOU** connecte les amatrices et amateurs de mode contemporaine africaine avec des ateliers de couture vérifiés au Sénégal.

---

## 🌟 Fonctionnalités de la Démo PWA

- **Double Expérience Synchronisée en Temps Réel :**
  - **Espace Cliente (Awa Diop) :** Découverte de la *Robe Nala* (35 000 FCFA), carnet de mensurations vérifié, course à domicile à Mermoz (1 500 FCFA), accord sur le devis, validation Orange Money et suivi en direct.
  - **Espace Atelier (Maison Aïssatou aux Almadies) :** Tableau de bord professionnel (3 demandes, 7 en confection, 2 remises), contrôle de faisabilité, émission du devis officiel et mise à jour des étapes de patronage/assemblage avec photos réelles.
- **Sécurisation Financière Idempotente (Orange Money) :**
  - Acompte de départ : **15 000 FCFA** (payé uniquement après acceptation explicite du devis).
  - Solde après constat physique de remise : **21 500 FCFA**.
  - Total garanti : **36 500 FCFA**.
- **Architecture PWA Mobile Native :**
  - 100% autonome et hors-ligne grâce au Service Worker (`sw.js`).
  - Viewport responsive Apple 390px sur desktop, plein écran standalone sur smartphone.
  - Mode **▶ Démo Guidée** intégré pour le pitch oral devant le jury.

---

## 🚀 Déploiement Rapide sur Vercel

### Option 1 : Déploiement en ligne de commande (CLI)
```bash
# 1. Se placer dans le dossier demo
cd demo

# 2. Déployer en production
npx --yes vercel --prod
```

### Option 2 : Import automatique via GitHub
1. Poussez ce dépôt sur votre compte GitHub.
2. Allez sur [vercel.com/new](https://vercel.com/new) et importez le repository.
3. Vercel détecte automatiquement la PWA statique et génère votre URL publique HTTPS sécurisée !

---

## 💻 Test en Local
```bash
# Lancer un serveur local léger
npx serve demo
# Ou avec python
python3 -m http.server 8080 --directory demo
```
Puis ouvrez `http://localhost:8080` dans votre navigateur.
