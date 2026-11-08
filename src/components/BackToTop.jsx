import { useEffect, useState } from 'react'

/*
 * 返回顶部 — Wiki 长文与自部署清单滚动超过一屏后才出现，落点避开移动端
 * 底部导航（bottom-20 vs sm:bottom-16）。44px 是触控目标下限；sm 断点抬高
 * 一档，让按钮在页面底部悬停时不盖住页脚右下角的 GitHub 链接。
 * 用 passive 监听：滚动事件高频，不需要 preventDefault，让浏览器不必等待
 * 本组件。
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 640)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      aria-label="返回顶部"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={[
        'fixed bottom-20 right-4 z-40 grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] bg-[var(--ink-raised)] text-[var(--text-dim)] shadow-[0_6px_20px_rgba(0,0,0,0.12)] transition-[opacity,transform,border-color,color] duration-150 hover:border-[var(--accent)]/60 hover:text-[var(--accent-text)] sm:bottom-16 sm:right-6',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
      ].join(' ')}
    >
      <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
        <path d="M8 3.5 3 8.5h3v4h4v-4h3z" fill="currentColor" />
      </svg>
    </button>
  )
}
