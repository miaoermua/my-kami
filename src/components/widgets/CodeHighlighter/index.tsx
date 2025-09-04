import type { FC } from 'react'
import React, { useCallback, useInsertionEffect, useRef } from 'react'
import { message } from 'react-message-popup'
import { shallow } from 'zustand/shallow'

import { useAppStore } from '~/atoms/app'
import { loadScript, loadStyleSheet } from '~/utils/load-script'

import styles from './index.module.css'

interface Props {
  lang: string | undefined
  content: string
}

export const HighLighter: FC<Props> = (props) => {
  const { lang: language, content: value } = props

  const { colorMode, isPrintMode } = useAppStore<{
    colorMode: string
    isPrintMode: boolean
  }>(
    (state) => ({
      colorMode: state.colorMode,
      isPrintMode: state.mediaType === 'print',
    }),
    shallow,
  )
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value)
    message.success('COPIED!')
  }, [value])

  const prevThemeCSS = useRef<ReturnType<typeof loadStyleSheet>>()

  useInsertionEffect(() => {
    const css = loadStyleSheet(
      `https://static.miaoer.net/static/prism-themes/prism-one-${
        isPrintMode ? 'light' : colorMode
      }.css`,
    )

    if (prevThemeCSS.current) {
      const $prev = prevThemeCSS.current
      css.$link.onload = () => {
        $prev.remove()
      }
    }

    prevThemeCSS.current = css
  }, [colorMode, isPrintMode])
  useInsertionEffect(() => {
    loadStyleSheet(
      'https://static.miaoer.net/static/prism-themes/prism-line-numbers.min.css',
    )

    Promise.all([
      loadScript(
        'https://static.miaoer.net/static/prism-themes/prism-core.min.js',
      ),
    ])
      .then(() =>
        Promise.all([
          loadScript(
            'https://static.miaoer.net/static/prism-themes/prism-autoloader.min.js',
          ),
          loadScript(
            'https://static.miaoer.net/static/prism-themes/prism-line-numbers.min.js',
          ),
        ]),
      )
      .then(() => {
        if (ref.current) {
          requestAnimationFrame(() => {
            window.Prism?.highlightElement(ref.current)

            requestAnimationFrame(() => {
              window.Prism?.highlightElement(ref.current)
            })
          })
        } else {
          requestAnimationFrame(() => {
            window.Prism?.highlightAll()
            // highlightAll twice

            requestAnimationFrame(() => {
              window.Prism?.highlightAll()
            })
          })
        }
      })
  }, [])

  const ref = useRef<HTMLElement>(null)
  return (
    <div className={styles['code-wrap']}>
      <span className={styles['language-tip']} aria-hidden>
        {language?.toUpperCase()}
      </span>

      <pre className="line-numbers !bg-transparent" data-start="1">
        <code className={`language-${language ?? 'markup'}`} ref={ref}>
          {value}
        </code>
      </pre>

      <div className={styles['copy-tip']} onClick={handleCopy} aria-hidden>
        Copy
      </div>
    </div>
  )
}
