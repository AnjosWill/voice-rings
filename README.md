# Voice Rings

Ferramenta web para **gerar sprites** e **GIFs** de anéis orgânicos animados (voice-active indicator), com controles finos de diâmetro, espessura, oscilação, amplitude, frequência, rotação e gradientes de cor. Feito em **Next.js (App Router)** + **Tailwind**.

> 🔗 **Demo:** https://voice-rings.vercel.app/

---

## ✨ Destaques

- 🎛️ **Controles em tempo real** (preview ao vivo)
- 🧩 **Múltiplas camadas (rings)** com visibilidade por camada
- 🖼️ **Sprite sheet** centrado e escalado corretamente
- 🌀 **GIF export** (com transparência e delay configurável)
- 🧭 **PiP (picture-in-picture)** para preview persistente no mobile

---

## 🚀 Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (estado global)
- Utilitários próprios para **GIF** (LZW), paleta e desenho em canvas

---

## 📦 Instalação

> **Requisitos**: Node 18+ (recomendado 20+), npm ou pnpm.

```bash
# clonar
git clone https://github.com/AnjosWill/voice-rings
cd voice-rings

# instalar dependências
npm i

# rodar em dev
npm run dev
# http://localhost:3000
