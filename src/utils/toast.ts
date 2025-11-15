import "./toast.css"

export function showToast(message: string) {
   const el = document.createElement('div')
   el.className = 'toast'
   el.textContent = message
   document.body.appendChild(el)

   requestAnimationFrame(() => {
      el.classList.add('show')
   })

   setTimeout(() => {
      el.classList.remove('show')
      setTimeout(() => el.remove(), 300)
   }, 2000)
}
