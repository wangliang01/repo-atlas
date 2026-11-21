export const THEME_STORAGE_KEY = "repo-atlas-theme";

// 必须在首帧前同步执行：先读用户选择，没有才跟随系统，避免亮色闪一下再变暗
export const themeScript = `(function(){try{var k="${THEME_STORAGE_KEY}",s=localStorage.getItem(k),d=s?s==="dark":matchMedia("(prefers-color-scheme: dark)").matches,e=document.documentElement;e.classList.toggle("dark",d);e.style.colorScheme=d?"dark":"light"}catch(_){}})()`;
