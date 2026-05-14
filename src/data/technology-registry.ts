export type Technology = {
  id: string;
  label: string;
  icon: string;
  url?: string;
  color?: string;
};

export const technologies = {
  astro: {
    id: "astro",
    label: "Astro",
    icon: "simple-icons:astro"
  },
  typescript: {
    id: "typescript",
    label: "TypeScript",
    icon: "devicon:typescript"
  },
  javascript: {
    id: "javascript",
    label: "JavaScript",
    icon: "devicon:javascript"
  },
  html5: {
    id: "html5",
    label: "HTML5",
    icon: "devicon:html5"
  },
  webgl: {
    id: "webgl",
    label: "WebGL",
    icon: "simple-icons:webgl"
  },
  webgpu: {
    id: "webgpu",
    label: "WebGPU",
    icon: "simple-icons:webgpu"
  },
  css3: {
    id: "css3",
    label: "CSS3",
    icon: "devicon:css3"
  },
  react: {
    id: "react",
    label: "React",
    icon: "devicon:react"
  },
  tailwindcss: {
    id: "tailwindcss",
    label: "Tailwind CSS",
    icon: "devicon:tailwindcss"
  },
  figma: {
    id: "figma",
    label: "Figma",
    icon: "devicon:figma"
  },
  firebase: {
    id: "firebase",
    label: "Firebase",
    icon: "devicon:firebase"
  },
  flutter: {
    id: "flutter",
    label: "Flutter",
    icon: "devicon:flutter"
  },
  dart: {
    id: "dart",
    label: "Dart",
    icon: "devicon:dart"
  },
  nextjs: {
    id: "nextjs",
    label: "Next.js",
    icon: "devicon:nextjs"
  },
  sanity: {
    id: "sanity",
    label: "Sanity",
    icon: "simple-icons:sanity"
  },
  vercel: {
    id: "vercel",
    label: "Vercel",
    icon: "simple-icons:vercel"
  },
  vscode: {
    id: "vscode",
    label: "Visual Studio Code",
    icon: "devicon:vscode"
  }
} satisfies Record<string, Technology>;
