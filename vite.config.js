import path from 'path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'

// Visualize and analyze your Rollup bundle to see which modules are taking up space
// [website] https://github.com/btd/rollup-plugin-visualizer
import { visualizer } from 'rollup-plugin-visualizer'

// Use Markdown as Vue components
// Use Vue components in Markdown
// [website] https://github.com/antfu/vite-plugin-md
import Markdown from 'vite-plugin-md'
// Markdown parser done right. Fast and easy to extend
// [website] https://markdown-it.github.io/markdown-it/
import MarkdownIt from 'markdown-it'
// Syntax highlighting for the Web
// [website] https://highlightjs.org/
import hljs from 'highlight.js'

// Provides Vue 3 JSX & TSX support with HMR
// [website] https://github.com/vitejs/vite/tree/main/packages/plugin-vue-jsx
import Jsx from '@vitejs/plugin-vue-jsx'

// On-demand components auto importing for Vue
// [website] https://github.com/antfu/unplugin-vue-components
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'

// File system based routing for Vue 3 applications using Vite
// [website] https://github.com/hannoeru/vite-plugin-pages
import Pages from 'vite-plugin-pages'

// Extend Vite with ability to use SVG files as Vue components
// [website] https://github.com/visualfanatic/vite-svg/tree/vite-plugin-svg
import Svg from 'vite-plugin-vue-svg'

// Used to generate svg sprite map
// [website] https://github.com/anncwb/vite-plugin-svg-icons
import SvgIcons from 'vite-plugin-svg-icons'

// Bundles only the icons you use
// [website] https://github.com/antfu/purge-icons
// [browser] https://icones.netlify.app/ or https://iconify.design/icon-sets/
// [example] <span class="iconify" data-icon="fa:home"/>
import PurgeIcons from 'vite-plugin-purge-icons'

// Access thousands of icons as components on-demand universally
// [website] https://github.com/antfu/unplugin-icons
// [example] <icon-mdi-account-box/>
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

// Inspect the intermediate state of Vite plugins. Useful for debugging and authoring plugins
// [website] https://github.com/antfu/vite-plugin-inspect
import Inspect from 'vite-plugin-inspect'

// Set import.meta.url as the file path at build timed
import MetaUrl from './d2/build/rollup-plugin-meta-url.js'

// path.resolve wrapper
const resolve = p => path.resolve(process.cwd(), p)

// For markdownItOptions
const md = new MarkdownIt()
const pre = h => `<pre class="p-0">${h}</pre>`
const code = (h, l) => `<code class="${l ? `language-${l} ` : ''}hljs">${h}</code>`

export default defineConfig({
  base: '/',
  plugins: [
    Vue({
      include: [/\.vue$/, /\.md$/],
    }),
    Markdown({
      markdownItOptions: {
        highlight (str, lang) {
          if (lang && hljs.getLanguage(lang)) {
            try {
              const html = hljs.highlight(str, {
                language: lang,
                ignoreIllegals: true
              }).value
              return pre(code(html, lang))
            } catch (__) {}
          }
          return pre(code(md.utils.escapeHtml(str)))
        }
      }
    }),
    Jsx(),
    Svg(),
    Components({
      dirs: [
        'd2/components',
        'src/components'
      ],
      extensions: ['vue', 'md', 'svg', 'js', 'jsx'],
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/, /\.js$/, /\.jsx$/],
      dts: true,
      directoryAsNamespace: true,
      importPathTransform: path => path.endsWith('.svg') ? `${path}?component` : undefined,
      deep: true,
      resolvers: [
        AntDesignVueResolver(),
        IconsResolver({
          componentPrefix: 'D2Icon'
        })
      ]
    }),
    Pages({
      pagesDir: [
        { dir: 'src/views', baseRoute: '' },
        { dir: 'd2/views', baseRoute: '' }
      ],
      exclude: ['**/components/*.vue'],
      extensions: ['vue', 'jsx', 'md']
    }),
    visualizer({
      open: false
    }),
    PurgeIcons(),
    SvgIcons({
      iconDirs: [
        resolve('d2/svg/icon')
      ],
      symbolId: 'icon-[dir]-[name]'
    }),
    Icons({
      scale: 1,
      compiler: 'vue3'
    }),
    MetaUrl(),
    Inspect()
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "d2/style/utils/index.scss" as *;'
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src',
      'd2': '/d2'
    }
  },
  server: {
    open: true
  },
  build: {
    sourcemap: true
  }
})
