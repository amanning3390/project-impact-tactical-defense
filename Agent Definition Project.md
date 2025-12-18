# Agent Definition: Project Impact - Tactical Defense

## 1. Project Overview
**Title:** Project Impact  
**Platform:** Farcaster Mini-App (v2) / Base Layer 2  
**Theme:** Industrial Retro-Sci-Fi / Planetary Defense  
**Gas Strategy:** 100% Gasless (Base Paymaster Sponsored)  
**Core Objective:** A daily 3D coordinate-mapping game to intercept a planet-killing asteroid.

---

## 2. Gameplay Mechanics: "The Kinetic Strike"
* **Targeting System:** Users select three coordinates $(X, Y, Z)$ ranging from **0 to 10**.
* **Permutations:** 1,331 possible impact points ($11^3$).
* **Daily Schedule (UTC):**
    * **21:00:** Targeting Lock. All entries must be on-chain.
    * **22:00:** The Strike. High-tension reveal animation of the asteroid's path.
    * **22:01:** The Outcome. Success (Jackpot) or Failure (Extinction).
    * **23:00:** Earth Rebirth. New cycle begins.

### Success Tiers
1.  **Direct Hit (3/3):** Asteroid pulverized. Jackpot shared among Battery members.
2.  **Deflection (2/3):** Interceptor grazes the target. Grants a **Free Interceptor Voucher** for the next day.
    * **Social-Lock:** Voucher activates only after the user shares a "Near Miss" Cast to Farcaster.
3.  **Global Failure:** If no 3/3 hit occurs worldwide, Earth is destroyed. UI triggers "Void State" for 60 minutes.

---

## 3. Squad Dynamics: "Automated Batteries"
* **Placement:** Users are automatically pooled into **Batteries of 10** on a first-come, first-served basis.
* **Coordination UI:** A shared 3D wireframe cube displays teammate vectors. Teammates aim to cover 10 unique points to maximize the Battery's 0.75% coverage of the coordinate universe.



---

## 4. Tokenomics ($IMPACT)
**Total Supply:** 1,000,000,000 (1 Billion)  
**Entry Fee:** 1,000 $IMPACT (Gasless)

### Dynamic Orbital Decay (Variable Burn)
Burn rate is calculated at the 21:00 UTC lock based on total participants ($N$):
* **Level 1 (N < 1k):** 5% Burn
* **Level 2 (1k - 5k):** 3% Burn
* **Level 3 (5k - 20k):** 1.5% Burn
* **Level 4 (N > 20k):** 0.5% Burn (Supply Preservation)

### Fund Allocation
* **Global Bounty:** ~87% - 91.5% (Rolling Jackpot)
* **Developer Rake:** 8% (Platform Revenue)
* **Orbital Burn:** 0.5% - 5% (Deflationary)

---

## 5. UI/UX & Visual Suite
### Component Architecture
* **Viewport:** 3D wireframe grid with rotating perspective.
* **Console:** Three oversized mechanical dials for X, Y, Z with haptic/SFX "clacks."
* **Action Button:** Giant neon button (LAUNCH -> LOCKED -> RE-ARM).

### CSS Animation Suite
```css
/* Extinction Glitch (Loss State) */
@keyframes extinction-glitch {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); clip-path: inset(10% 0 30% 0); }
  60% { transform: translate(2px, 2px); filter: hue-rotate(90deg) saturate(2); }
  100% { transform: translate(0); }
}
.extinction-active { animation: extinction-glitch 0.2s infinite; color: #ff3e3e; }

/* Great Symmetry (Win State) */
@keyframes symmetry-bloom {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(2); text-shadow: 0 0 20px #ffd700; }
}
.stable-era { animation: symmetry-bloom 2s ease-in-out infinite; color: #ffd700; }
