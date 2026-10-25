import { mintSlackSequence, mintParcelSequence, altCoffeeSequence, altGoodnightSequence } from './extra-sequences.mjs'
import { mintSneakSequence } from './mint-sneak-sequence.mjs'
import { mintRiceSequence } from './mint-rice-sequence.mjs'
import { mintClaudeSequence } from './mint-claude-sequence.mjs'
import { mintHaSequence } from './mint-ha-sequence.mjs'
import { confessSequence } from './confess-sequence.mjs'
import { peekSequence } from './peek-sequence.mjs'
import React from 'react'
import { createRoot } from 'react-dom/client'
const withSources = (sequence, directory) => ({ ...sequence, frames: sequence.frames.map(frame => ({ ...frame, src: new URL(directory + '/' + (frame.art || frame.name) + '.png', window.location.href).href })) })
window.__DSH_PET_ANIMATIONS__ = { mintSlack: withSources(mintSlackSequence, 'mint-slack'), mintParcel: withSources(mintParcelSequence, 'mint-parcel'), altCoffee: withSources(altCoffeeSequence, 'alt-coffee'), altGoodnight: withSources(altGoodnightSequence, 'alt-goodnight'), mintSneak: withSources(mintSneakSequence, 'mint-sneak'), mintRice: withSources(mintRiceSequence, 'mint-rice'), mintClaude: withSources(mintClaudeSequence, 'mint-claude'), mintHa: withSources(mintHaSequence, 'mint-ha'), altPeek: withSources(peekSequence, 'alt-peek'), altConfess: withSources(confessSequence, 'alt-confess') }
const root = createRoot(document.getElementById('root'))
// Adapt the existing DSH client entrypoint without a running DSH server.
window.__ModuleLoader__ = {
  load(spec) {
    const plugin = spec.factory(name => {
      if (name === 'react') return React
      throw new Error('Unsupported desktop module: ' + name)
    })
    plugin.apply({ slots: {
      inject(name, callback) { if (name === 'shell.overlay') callback() },
      register(options, Pet) { root.render(React.createElement(Pet)) },
    } })
  },
}
let interactive = false
function hitTest(event) {
  const pet = document.querySelector('#root > div')
  const rect = (pet?.querySelector('[data-pet-sprite]') || pet?.querySelector('img') || pet)?.getBoundingClientRect()
  const next = !!rect && event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom
  if (next !== interactive) { interactive = next; window.desktopPet?.setInteractive(next) }
}
window.addEventListener('mousemove', hitTest)
window.addEventListener('contextmenu', event => { event.preventDefault(); window.desktopPet?.showMenu() })
window.addEventListener('blur', () => { window.desktopPet?.endDrag(); interactive = false; window.desktopPet?.setInteractive(false) })
