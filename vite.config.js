import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "https://mdn.github.io/todo-react/",
  test: {
    // テストコードで describe / it / expect を import なしで使う
    globals: true,
    // Node 上に DOM を用意し、React コンポーネントを実際にレンダリングできるようにする
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
  },
})
