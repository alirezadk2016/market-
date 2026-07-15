/* ------------------------------------------------------------------
   مدل‌های کیف — نسخه نمونه
   هر مدل یک تصویر SVG برداری دارد که برای دموی لوکس ساخته شده.
   برای استفاده‌ی واقعی، کافی است مقدار «svg» را با یک <img src="عکس.jpg">
   جایگزین کنید یا کل کارت را با عکس محصول عوض کنید.
------------------------------------------------------------------- */

/* سازنده‌ی SVG کیف با رنگ و مدل قابل تنظیم */
function bagSVG({ body, trim, accent, style }) {
  const gid = style + "-" + body.replace("#", "");
  const shadow = `<ellipse cx="140" cy="278" rx="96" ry="14" fill="rgba(0,0,0,.28)"/>`;

  const shapes = {
    // کیف توت بلند
    tote: `
      <path d="M78 96 q62 -58 124 0" fill="none" stroke="${trim}" stroke-width="7" stroke-linecap="round"/>
      <path d="M62 100 h156 l-12 150 q-3 20 -23 20 H97 q-20 0 -23 -20 Z" fill="${body}"/>
      <path d="M62 100 h156 l-3 34 H65 Z" fill="${accent}" opacity=".22"/>
      <rect x="126" y="150" width="28" height="40" rx="5" fill="${trim}"/>`,
    // کیف دوشی با درپوش
    flap: `
      <path d="M96 92 q44 -30 88 0" fill="none" stroke="${trim}" stroke-width="6" stroke-linecap="round"/>
      <rect x="70" y="120" width="140" height="120" rx="16" fill="${body}"/>
      <path d="M70 120 h140 v34 q-70 30 -140 0 Z" fill="${accent}" opacity=".9"/>
      <circle cx="140" cy="168" r="10" fill="${trim}"/>
      <rect x="132" y="150" width="16" height="20" rx="4" fill="${trim}"/>`,
    // کلاچ باریک
    clutch: `
      <rect x="66" y="150" width="148" height="86" rx="14" fill="${body}"/>
      <path d="M66 150 h148 v18 q-74 26 -148 0 Z" fill="${accent}" opacity=".85"/>
      <path d="M120 150 q20 -20 40 0" fill="none" stroke="${trim}" stroke-width="5"/>
      <rect x="128" y="182" width="24" height="10" rx="5" fill="${trim}"/>`,
    // کیف سطلی
    bucket: `
      <path d="M92 96 q48 -20 96 0" fill="none" stroke="${trim}" stroke-width="6" stroke-linecap="round"/>
      <path d="M78 120 h124 l-14 118 q-2 16 -20 16 H112 q-18 0 -20 -16 Z" fill="${body}"/>
      <ellipse cx="140" cy="120" rx="62" ry="14" fill="${accent}" opacity=".85"/>
      <path d="M110 128 q30 14 60 0" fill="none" stroke="${trim}" stroke-width="4" stroke-linecap="round"/>`,
    // کیف باگت
    baguette: `
      <path d="M84 128 q56 -34 112 0" fill="none" stroke="${trim}" stroke-width="6" stroke-linecap="round"/>
      <rect x="72" y="150" width="136" height="72" rx="30" fill="${body}"/>
      <path d="M72 172 h136" stroke="${accent}" stroke-width="10" opacity=".55"/>
      <rect x="130" y="176" width="20" height="20" rx="6" fill="${trim}"/>`,
  };

  return `
  <svg viewBox="0 0 280 300" xmlns="http://www.w3.org/2000/svg" class="bag-svg" role="img">
    <defs>
      <linearGradient id="sheen-${gid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff" stop-opacity=".18"/>
        <stop offset=".5" stop-color="#ffffff" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${shadow}
    ${shapes[style]}
    <rect x="55" y="90" width="170" height="170" rx="16" fill="url(#sheen-${gid})"/>
  </svg>`;
}

const BAGS = [
  {
    name: "کیف توت «سیه‌نا»",
    line: "چرم ساویانو — مشکی شبانه با سگک برنجی",
    tag: "امضاء",
    svg: bagSVG({ body: "#1c1c1e", trim: "#c9a24b", accent: "#3a3a3d", style: "tote" }),
    hue: "#c9a24b",
  },
  {
    name: "کیف دوشی «آملی»",
    line: "درپوش کوئیلت — کرم استخوانی، زنجیر طلایی",
    tag: "پرفروش",
    svg: bagSVG({ body: "#e9e0d1", trim: "#b8963f", accent: "#d8ccb7", style: "flap" }),
    hue: "#b8963f",
  },
  {
    name: "کلاچ «نوآر»",
    line: "مجلسی — مخمل شرابی با قفل جواهرنشان",
    tag: "محدود",
    svg: bagSVG({ body: "#5a1f2b", trim: "#d4af62", accent: "#7a2e3c", style: "clutch" }),
    hue: "#d4af62",
  },
  {
    name: "کیف سطلی «تِرا»",
    line: "چرم دباغی گیاهی — قهوه‌ای کنیاک، بند بافته",
    tag: "روزمره",
    svg: bagSVG({ body: "#8a552b", trim: "#e4c27a", accent: "#a06a38", style: "bucket" }),
    hue: "#e4c27a",
  },
  {
    name: "باگت «ویا»",
    line: "مینیمال — سبز زیتونی مات، پلاک امضاء",
    tag: "جدید",
    svg: bagSVG({ body: "#3f4a35", trim: "#c9a24b", accent: "#55603f", style: "baguette" }),
    hue: "#c9a24b",
  },
  {
    name: "کیف توت «آزور»",
    line: "چرم ساخته — سرمه‌ای عمیق، دوخت متضاد",
    tag: "کلاسیک",
    svg: bagSVG({ body: "#22314d", trim: "#c9a24b", accent: "#33456a", style: "tote" }),
    hue: "#c9a24b",
  },
];
