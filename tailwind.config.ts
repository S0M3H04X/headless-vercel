// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    
    // [修正] 務必確保這行涵蓋了您的 widgets 路徑
    // 如果您的結構是 app/components/widgets，上面的 ./app/** 應該要涵蓋
    // 但為了保險，請明確加入這行：
    "./app/components/**/*.{js,ts,jsx,tsx,mdx}", 
  ],
  // ...
};
export default config;