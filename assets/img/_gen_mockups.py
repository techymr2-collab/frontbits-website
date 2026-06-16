#!/usr/bin/env python3
"""Generate clean marketing-website mockups (browser-framed landing pages) as SVG."""
import os, html, base64

OUT = os.path.dirname(os.path.abspath(__file__))
FONT = "Inter, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"
SERIF = "'Instrument Serif', Georgia, serif"

W, H = 1600, 1200          # 4:3 grid mockups
CHROME = 92                # browser chrome height
PY = CHROME                # page top


def esc(s): return html.escape(s, quote=True)


def datauri(fname):
    """Read a real photo from photos/ and return a base64 data URI.
    Embedding is required because these SVGs are loaded via <img>, which
    blocks external resource refs (secure static mode)."""
    with open(os.path.join(OUT, "photos", fname), "rb") as f:
        return "data:image/jpeg;base64," + base64.b64encode(f.read()).decode("ascii")


def photo(uri, x, y, w, h, clip_id, rx=14):
    """Place a cover-cropped real photo inside a rounded region."""
    return (f'<clipPath id="{clip_id}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}"/></clipPath>'
            f'<image href="{uri}" x="{x}" y="{y}" width="{w}" height="{h}" '
            f'preserveAspectRatio="xMidYMid slice" clip-path="url(#{clip_id})"/>')


def chrome_bar(url, accent="#d7d7e0", bar="#f1f1f5"):
    return f'''
  <rect x="0" y="0" width="{W}" height="{CHROME}" fill="{bar}"/>
  <circle cx="46" cy="46" r="11" fill="#ff5f57"/>
  <circle cx="84" cy="46" r="11" fill="#febc2e"/>
  <circle cx="122" cy="46" r="11" fill="#28c840"/>
  <rect x="190" y="26" width="{W-380}" height="40" rx="20" fill="#ffffff"/>
  <text x="{W//2}" y="52" font-family="{FONT}" font-size="22" fill="#9a9aa8" text-anchor="middle">{esc(url)}</text>
'''


def frame(inner, page_bg="#ffffff"):
    return f'''<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" font-family="{FONT}">
  <defs>
    <clipPath id="round"><rect x="0" y="0" width="{W}" height="{H}" rx="26"/></clipPath>
  </defs>
  <g clip-path="url(#round)">
    <rect x="0" y="0" width="{W}" height="{H}" fill="{page_bg}"/>
    <rect x="0" y="{PY}" width="{W}" height="{H-PY}" fill="{page_bg}"/>
    {inner}
  </g>
  <rect x="1" y="1" width="{W-2}" height="{H-2}" rx="26" fill="none" stroke="#e6e6ee" stroke-width="2"/>
</svg>'''


def nav(logo, links, btn, color="#16161d", btn_bg="#16161d", btn_fg="#fff", logo_serif=False, link_color=None):
    lc = link_color or "#6b6b78"
    lf = SERIF if logo_serif else FONT
    lx = W - 70
    out = [f'<text x="70" y="{PY+58}" font-family="{lf}" font-size="34" font-weight="700" fill="{color}">{esc(logo)}</text>']
    # button
    bw = 150
    out.append(f'<rect x="{lx-bw}" y="{PY+30}" width="{bw}" height="52" rx="26" fill="{btn_bg}"/>')
    out.append(f'<text x="{lx-bw//2}" y="{PY+63}" font-family="{FONT}" font-size="21" font-weight="600" fill="{btn_fg}" text-anchor="middle">{esc(btn)}</text>')
    # links right-to-left before button
    cx = lx - bw - 50
    for t in reversed(links):
        w = 13 * len(t)
        out.append(f'<text x="{cx}" y="{PY+62}" font-family="{FONT}" font-size="21" fill="{lc}" text-anchor="end">{esc(t)}</text>')
        cx -= (w + 44)
    return "\n  ".join(out)


def pill(x, y, w, h, fill, r=None):
    r = r if r is not None else h/2
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"/>'


# ---------------------------------------------------------------- 1. Northpeak (SaaS, purple)
def northpeak():
    P = "#635BFF"; ink = "#16161d"
    top = PY + 130
    inner = f'''
  {chrome_bar("northpeak.io")}
  {nav("Northpeak", ["Product","Pricing","Customers","Docs"], "Start free", color=ink, btn_bg=P)}
  <!-- hero left -->
  {pill(70, top, 250, 40, "#efeeff")}
  <text x="92" y="{top+27}" font-family="{FONT}" font-size="19" font-weight="600" fill="{P}">★ Loved by 4,000+ teams</text>
  <text x="68" y="{top+135}" font-family="{FONT}" font-size="76" font-weight="800" fill="{ink}" letter-spacing="-2">Run every project</text>
  <text x="68" y="{top+220}" font-family="{FONT}" font-size="76" font-weight="800" fill="{ink}" letter-spacing="-2">in one <tspan fill="{P}">calm</tspan> place.</text>
  <text x="70" y="{top+285}" font-family="{FONT}" font-size="25" fill="#6b6b78">Plan, track, and ship work without the chaos of</text>
  <text x="70" y="{top+320}" font-family="{FONT}" font-size="25" fill="#6b6b78">a dozen disconnected tools.</text>
  {pill(70, top+360, 215, 62, P)}
  <text x="177" y="{top+399}" font-family="{FONT}" font-size="23" font-weight="600" fill="#fff" text-anchor="middle">Start for free</text>
  {pill(300, top+360, 200, 62, "#fff", 31)}
  <rect x="300" y="{top+360}" width="200" height="62" rx="31" fill="none" stroke="#e0e0ea" stroke-width="2"/>
  <text x="400" y="{top+399}" font-family="{FONT}" font-size="23" font-weight="600" fill="{ink}" text-anchor="middle">Book a demo</text>
  <!-- hero right app card -->
  <rect x="820" y="{top-10}" width="710" height="560" rx="24" fill="#f7f7fb" stroke="#ececf3" stroke-width="2"/>
  <rect x="820" y="{top-10}" width="710" height="70" rx="24" fill="#ffffff"/>
  <rect x="820" y="{top+30}" width="710" height="22" fill="#ffffff"/>
  <circle cx="855" cy="{top+25}" r="8" fill="{P}"/>
  <text x="878" y="{top+33}" font-family="{FONT}" font-size="20" font-weight="700" fill="{ink}">Sprint board</text>
  {pill(860, {top+90}, 290, 130, "#fff")}{pill(1190, {top+90}, 290, 130, "#fff")}
  {pill(880, {top+112}, 130, 18, "#e7e6ff")}{pill(880, {top+150}, 230, 14, "#ececf1")}{pill(880, {top+175}, 180, 14, "#ececf1")}
  {pill(1210, {top+112}, 130, 18, "#ffe9d8")}{pill(1210, {top+150}, 230, 14, "#ececf1")}{pill(1210, {top+175}, 180, 14, "#ececf1")}
  {pill(860, {top+250}, 620, 100, "#fff")}
  <circle cx="905" cy="{top+300}" r="22" fill="{P}"/>
  {pill(945, {top+280}, 300, 16, "#ececf1")}{pill(945, {top+312}, 420, 14, "#f1f1f6")}
  {pill(860, {top+370}, 620, 100, "#fff")}
  <circle cx="905" cy="{top+420}" r="22" fill="#ffb27a"/>
  {pill(945, {top+400}, 260, 16, "#ececf1")}{pill(945, {top+432}, 380, 14, "#f1f1f6")}
  <!-- logos strip -->
  <text x="70" y="{PY+820}" font-family="{FONT}" font-size="18" font-weight="600" fill="#a3a3b0" letter-spacing="2">TRUSTED BY MODERN TEAMS</text>
  {''.join(pill(70+ i*250, PY+850, 170, 34, "#e9e9f0") for i in range(5))}
  <rect x="0" y="{PY+930}" width="{W}" height="2" fill="#f0f0f5"/>
  {''.join(f'{pill(70+i*375, PY+975, 56, 56, "#efeeff", 16)}' + f'<text x="{98+i*375}" y="{PY+1012}" font-family="{FONT}" font-size="22" font-weight="700" fill="{P}" text-anchor="middle">{ic}</text>' for i,ic in enumerate(["⚡","◎","✦","↻"]))}
  {''.join(pill(140+i*375, PY+985, 210, 16, "#1d1d27") for i in range(4))}
  {''.join(pill(140+i*375, PY+1015, 230, 13, "#e6e6ee") for i in range(4))}
'''
    return frame(inner)


# ---------------------------------------------------------------- 2. Verdé (ecommerce skincare)
def verde():
    G = "#5f7d63"; cream = "#f6f3ec"; ink = "#26302a"
    top = PY + 120
    cards = []
    names = ["Daily Glow Serum","Calm Cream","Renew Oil","Velvet Cleanser"]
    prices = ["$38","$42","$54","$29"]
    tints = ["#e7ede3","#eee7da","#e3e9ea","#efe6e2"]
    bottle = ["#cdb98f","#b9c7a8","#9fb7bb","#d8c3b6"]
    for i in range(4):
        x = 70 + i*375
        cards.append(f'''
  <rect x="{x}" y="{PY+560}" width="335" height="430" rx="20" fill="{tints[i]}"/>
  <rect x="{x+120}" y="{PY+600}" width="95" height="200" rx="14" fill="{bottle[i]}"/>
  <rect x="{x+143}" y="{PY+595}" width="49" height="22" rx="8" fill="{bottle[i]}"/>
  <text x="{x+28}" y="{PY+865}" font-family="{FONT}" font-size="24" font-weight="700" fill="{ink}">{esc(names[i])}</text>
  <text x="{x+28}" y="{PY+905}" font-family="{FONT}" font-size="20" fill="#7c8a7e">Hydrating · 50ml</text>
  <text x="{x+28}" y="{PY+955}" font-family="{FONT}" font-size="26" font-weight="700" fill="{G}">{prices[i]}</text>
  {pill(x+250, PY+925, 56, 40, G, 14)}<text x="{x+278}" y="{PY+951}" font-family="{FONT}" font-size="24" fill="#fff" text-anchor="middle">+</text>''')
    inner = f'''
  {chrome_bar("shop.verde.co", bar="#efece4")}
  <rect x="0" y="{PY}" width="{W}" height="{H-PY}" fill="{cream}"/>
  {nav("Verdé", ["Shop","Ingredients","About","Journal"], "Cart (2)", color=ink, btn_bg=G, logo_serif=True, link_color="#5d6b60")}
  <text x="70" y="{top+70}" font-family="{SERIF}" font-size="92" fill="{ink}">Skincare,</text>
  <text x="70" y="{top+165}" font-family="{SERIF}" font-size="92" fill="{G}">simplified.</text>
  <text x="72" y="{top+225}" font-family="{FONT}" font-size="24" fill="#6b7a6e">Clean, plant-based essentials made for</text>
  <text x="72" y="{top+258}" font-family="{FONT}" font-size="24" fill="#6b7a6e">real, everyday skin. Nothing you can't pronounce.</text>
  {pill(72, top+295, 235, 62, ink)}
  <text x="189" y="{top+334}" font-family="{FONT}" font-size="22" font-weight="600" fill="#fff" text-anchor="middle">Shop the range</text>
  <!-- hero product (real photo) -->
  {photo(datauri("verde.jpg"), 900, top-40, 630, 430, "verdeHero", rx=24)}
  <text x="70" y="{PY+520}" font-family="{SERIF}" font-size="44" fill="{ink}">Best sellers</text>
  {''.join(cards)}
'''
    return frame(inner, cream)


# ---------------------------------------------------------------- 3. Atelier Nord (architecture, dark)
def atelier():
    bg = "#17181c"; ink = "#f3f1ec"; muted="#9a9aa2"; accent="#c9a36a"
    top = PY + 150
    grid = []
    photos = ["atelier-a.jpg", "atelier-b.jpg", "atelier-c.jpg"]
    titles = ["Birch House", "Glass Pavilion", "Loft Nineteen"]
    subs = ["Architecture · 2026", "Interior · 2025", "Renovation · 2026"]
    for i in range(3):
        x = 70 + i*490
        grid.append(f'''
  {photo(datauri(photos[i]), x, PY+560, 450, 470, f"atile{i}", rx=14)}
  <rect x="{x}" y="{PY+560}" width="450" height="470" rx="14" fill="url(#archg{i})"/>
  <text x="{x+28}" y="{PY+985}" font-family="{FONT}" font-size="24" font-weight="700" fill="{ink}">{esc(titles[i])}</text>
  <text x="{x+28}" y="{PY+1015}" font-family="{FONT}" font-size="18" fill="{muted}">{esc(subs[i])}</text>''')
    defs = "".join(f'<linearGradient id="archg{i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0.42" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0c0d10" stop-opacity="0.78"/></linearGradient>' for i in range(3))
    inner = f'''
  <defs>{defs}</defs>
  {chrome_bar("ateliernord.studio", bar="#101114")}
  <rect x="0" y="{PY}" width="{W}" height="{H-PY}" fill="{bg}"/>
  {nav("ATELIER NORD", ["Work","Studio","Process","Contact"], "Enquire", color=ink, btn_bg=accent, btn_fg="#17181c", link_color=muted)}
  <text x="70" y="{top+60}" font-family="{SERIF}" font-size="100" fill="{ink}">We design spaces</text>
  <text x="70" y="{top+170}" font-family="{SERIF}" font-size="100" fill="{ink}">that <tspan fill="{accent}" font-style="italic">breathe.</tspan></text>
  <text x="72" y="{top+235}" font-family="{FONT}" font-size="24" fill="{muted}">An architecture and interior studio crafting calm,</text>
  <text x="72" y="{top+268}" font-family="{FONT}" font-size="24" fill="{muted}">considered places to live and work.</text>
  <text x="1530" y="{top+268}" font-family="{FONT}" font-size="20" fill="{muted}" text-anchor="end">Selected work ↓</text>
  {"".join(grid)}
'''
    return frame(inner, bg)


# ---------------------------------------------------------------- 4. Maison Olivier (restaurant)
def maison():
    bg = "#fbf6f0"; terra="#bf6336"; ink="#2b211b"; muted="#8a7a6e"
    top = PY+150
    inner = f'''
  {chrome_bar("maisonolivier.com", bar="#f3ebe2")}
  <rect x="0" y="{PY}" width="{W}" height="{H-PY}" fill="{bg}"/>
  {nav("Maison Olivier", ["Menu","Story","Private dining","Visit"], "Reserve", color=ink, btn_bg=terra, logo_serif=True, link_color=muted)}
  <text x="70" y="{top+30}" font-family="{FONT}" font-size="20" font-weight="600" fill="{terra}" letter-spacing="3">SEASONAL · FRENCH · SINCE 2014</text>
  <text x="68" y="{top+130}" font-family="{SERIF}" font-size="88" fill="{ink}">A seasonal table</text>
  <text x="68" y="{top+225}" font-family="{SERIF}" font-size="88" fill="{ink}">in the <tspan font-style="italic" fill="{terra}">heart</tspan> of town.</text>
  <text x="72" y="{top+292}" font-family="{FONT}" font-size="24" fill="{muted}">A daily-changing menu built from the</text>
  <text x="72" y="{top+325}" font-family="{FONT}" font-size="24" fill="{muted}">morning market.</text>
  {pill(72, top+365, 250, 64, terra)}
  <text x="197" y="{top+405}" font-family="{FONT}" font-size="22" font-weight="600" fill="#fff" text-anchor="middle">Book a table</text>
  {pill(340, top+365, 235, 64, "transparent", 32)}
  <rect x="340" y="{top+365}" width="235" height="64" rx="32" fill="none" stroke="{terra}" stroke-width="2"/>
  <text x="457" y="{top+405}" font-family="{FONT}" font-size="22" font-weight="600" fill="{terra}" text-anchor="middle">View the menu</text>
  <!-- plate visual (real photo) -->
  {photo(datauri("maison.jpg"), 975, top-30, 555, 540, "maisonHero", rx=22)}
  <!-- bottom info row -->
  <rect x="0" y="{PY+860}" width="{W}" height="2" fill="#eaddd0"/>
  {''.join(f'<text x="{90+i*510}" y="{PY+930}" font-family="{SERIF}" font-size="34" fill="{ink}">{t}</text><text x="{90+i*510}" y="{PY+975}" font-family="{FONT}" font-size="20" fill="{muted}">{s}</text>' for i,(t,s) in enumerate([("Lunch","Tue–Sat · 12–3pm"),("Dinner","Tue–Sat · 6–11pm"),("Find us","14 Rue des Lilas")]))}
'''
    return frame(inner, bg)


# ---------------------------------------------------------------- 5. Harbor & Vine (hotel)
def harbor():
    teal="#15604f"; bg="#f3f6f3"; ink="#142420"; muted="#5f7068"; sand="#e8c9a0"
    top = PY+150
    inner = f'''
  <defs><linearGradient id="seaov" x1="0" y1="0" x2="1" y2="0.4"><stop offset="0" stop-color="#0a2c24" stop-opacity="0.74"/><stop offset="0.55" stop-color="#0a2c24" stop-opacity="0.30"/><stop offset="1" stop-color="#0a2c24" stop-opacity="0.05"/></linearGradient></defs>
  {chrome_bar("harborandvine.com", bar="#e9efe9")}
  <rect x="0" y="{PY}" width="{W}" height="{H-PY}" fill="{bg}"/>
  {nav("Harbor & Vine", ["Rooms","Dining","Spa","Offers"], "Book stay", color=ink, btn_bg=teal, logo_serif=True, link_color=muted)}
  <!-- full hero image (real photo) -->
  {photo(datauri("harbor.jpg"), 70, top-30, W-140, 520, "harborHero", rx=22)}
  <rect x="70" y="{top-30}" width="{W-140}" height="520" rx="22" fill="url(#seaov)"/>
  <text x="120" y="{top+120}" font-family="{FONT}" font-size="20" font-weight="600" fill="#eaf6f0" letter-spacing="3">A COASTAL ESCAPE · MAINE</text>
  <text x="118" y="{top+220}" font-family="{SERIF}" font-size="96" fill="#ffffff">Slow mornings by</text>
  <text x="118" y="{top+310}" font-family="{SERIF}" font-size="96" fill="#ffffff">the <tspan font-style="italic" fill="{sand}">water.</tspan></text>
  {pill(120, top+345, 230, 60, "#ffffff")}
  <text x="235" y="{top+383}" font-family="{FONT}" font-size="21" font-weight="600" fill="{teal}" text-anchor="middle">Check availability</text>
  <!-- booking bar -->
  <rect x="70" y="{PY+700}" width="{W-140}" height="120" rx="18" fill="#ffffff" stroke="#e2e9e3" stroke-width="2"/>
  {''.join(f'<text x="{110+i*360}" y="{PY+748}" font-family="{FONT}" font-size="18" fill="{muted}" letter-spacing="1">{l}</text><text x="{110+i*360}" y="{PY+788}" font-family="{FONT}" font-size="26" font-weight="700" fill="{ink}">{v}</text>' for i,(l,v) in enumerate([("CHECK IN","Fri, 14 Aug"),("CHECK OUT","Sun, 16 Aug"),("GUESTS","2 adults")]))}
  {pill(1230, PY+725, 270, 70, teal)}
  <text x="1365" y="{PY+768}" font-family="{FONT}" font-size="23" font-weight="600" fill="#fff" text-anchor="middle">Search rooms</text>
  <text x="70" y="{PY+910}" font-family="{SERIF}" font-size="40" fill="{ink}">From $240 / night · ocean-view suites</text>
'''
    return frame(inner, bg)


# ---------------------------------------------------------------- 6. Atlas Wealth (finance)
def atlas():
    navy="#15315c"; bg="#ffffff"; ink="#11203a"; muted="#5d6a80"; gold="#c79a4b"; soft="#eef2f8"
    top = PY+130
    inner = f'''
  <defs><linearGradient id="grow" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="{navy}"/><stop offset="1" stop-color="#2b5fa0"/></linearGradient></defs>
  {chrome_bar("atlaswealth.com")}
  {nav("ATLAS WEALTH", ["Services","Approach","Insights","Team"], "Get advice", color=ink, btn_bg=navy, link_color=muted)}
  {pill(70, top, 290, 40, soft)}
  <text x="92" y="{top+27}" font-family="{FONT}" font-size="19" font-weight="600" fill="{navy}">Independent · Fee-only advisors</text>
  <text x="68" y="{top+130}" font-family="{FONT}" font-size="78" font-weight="800" fill="{ink}" letter-spacing="-2">Wealth, managed</text>
  <text x="68" y="{top+218}" font-family="{FONT}" font-size="78" font-weight="800" fill="{ink}" letter-spacing="-2">with <tspan fill="{gold}">clarity.</tspan></text>
  <text x="70" y="{top+283}" font-family="{FONT}" font-size="24" fill="{muted}">Planning, investing, and guidance built around</text>
  <text x="70" y="{top+316}" font-family="{FONT}" font-size="24" fill="{muted}">your goals — not the markets'.</text>
  {pill(70, top+356, 260, 62, navy)}
  <text x="200" y="{top+395}" font-family="{FONT}" font-size="22" font-weight="600" fill="#fff" text-anchor="middle">Book a consultation</text>
  <!-- chart card -->
  <rect x="860" y="{top-20}" width="670" height="520" rx="22" fill="url(#grow)"/>
  <text x="900" y="{top+50}" font-family="{FONT}" font-size="22" fill="#bcd0ec">Portfolio growth</text>
  <text x="900" y="{top+110}" font-family="{FONT}" font-size="56" font-weight="800" fill="#fff">+18.4%</text>
  <text x="900" y="{top+145}" font-family="{FONT}" font-size="20" fill="#9fc6a0">▲ outperforming benchmark</text>
  <polyline points="900,{top+430} 990,{top+400} 1080,{top+410} 1170,{top+350} 1260,{top+360} 1350,{top+290} 1470,{top+230}" fill="none" stroke="{gold}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <polyline points="900,{top+460} 990,{top+450} 1080,{top+455} 1170,{top+430} 1260,{top+435} 1350,{top+410} 1470,{top+390}" fill="none" stroke="#7fa8da" stroke-width="4" stroke-dasharray="2 10" stroke-linecap="round"/>
  {''.join(f'<line x1="{900+i*95}" y1="{top+480}" x2="{900+i*95}" y2="{top+490}" stroke="#5f86bd" stroke-width="3"/>' for i in range(7))}
  <!-- stat row -->
  <rect x="0" y="{PY+820}" width="{W}" height="2" fill="#eef0f4"/>
  {''.join(f'<text x="{90+i*380}" y="{PY+905}" font-family="{FONT}" font-size="52" font-weight="800" fill="{navy}">{v}</text><text x="{90+i*380}" y="{PY+945}" font-family="{FONT}" font-size="20" fill="{muted}">{l}</text>' for i,(v,l) in enumerate([("$2.4B","Assets advised"),("1,200+","Households"),("22 yrs","Average tenure"),("4.9★","Client rating")]))}
'''
    return frame(inner)


# ---------------------------------------------------------------- Hero (full-bleed, no chrome)
def hero():
    """Premium studio showcase: a flagship website in a browser, with floating proof cards."""
    P = "#635BFF"; ink = "#16161d"; muted = "#6b6b78"
    W2, H2 = 1640, 800
    # main browser window box
    wx, wy, ww, wh = 470, 96, 760, 608
    py = wy + 48   # page content top (below chrome)
    return f'''<svg viewBox="0 0 {W2} {H2}" xmlns="http://www.w3.org/2000/svg" font-family="{FONT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#efedff"/><stop offset="0.55" stop-color="#f6f5ff"/><stop offset="1" stop-color="#fbfaff"/>
    </linearGradient>
    <radialGradient id="glowA" cx="22%" cy="12%" r="55%">
      <stop offset="0" stop-color="#635BFF" stop-opacity="0.30"/><stop offset="1" stop-color="#635BFF" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowB" cx="88%" cy="92%" r="55%">
      <stop offset="0" stop-color="#9b8cff" stop-opacity="0.28"/><stop offset="1" stop-color="#9b8cff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="shot" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7b73ff"/><stop offset="0.5" stop-color="#635BFF"/><stop offset="1" stop-color="#4b43d6"/>
    </linearGradient>
    <linearGradient id="spark" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#9b8cff"/><stop offset="1" stop-color="#635BFF"/>
    </linearGradient>
    <pattern id="dots" width="34" height="34" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="2" fill="#635BFF" opacity="0.10"/>
    </pattern>
    <filter id="winShadow" x="-25%" y="-25%" width="150%" height="160%">
      <feDropShadow dx="0" dy="30" stdDeviation="34" flood-color="#1a1450" flood-opacity="0.20"/>
    </filter>
    <filter id="cardShadow" x="-60%" y="-60%" width="220%" height="240%">
      <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#1a1450" flood-opacity="0.16"/>
    </filter>
    <clipPath id="winClip"><rect x="{wx}" y="{wy}" width="{ww}" height="{wh}" rx="20"/></clipPath>
  </defs>

  <rect width="{W2}" height="{H2}" fill="url(#bg)"/>
  <rect width="{W2}" height="{H2}" fill="url(#dots)"/>
  <rect width="{W2}" height="{H2}" fill="url(#glowA)"/>
  <rect width="{W2}" height="{H2}" fill="url(#glowB)"/>
  <!-- decorative sparkles -->
  <circle cx="250" cy="640" r="6" fill="#635BFF" opacity="0.5"/>
  <circle cx="1410" cy="180" r="8" fill="#9b8cff" opacity="0.55"/>
  <circle cx="1360" cy="640" r="5" fill="#635BFF" opacity="0.4"/>
  <path d="M210 250 l8 0 M214 246 l0 8" stroke="#635BFF" stroke-width="3" stroke-linecap="round" opacity="0.6"/>

  <!-- ===== Main browser window (flagship site) ===== -->
  <g filter="url(#winShadow)"><rect x="{wx}" y="{wy}" width="{ww}" height="{wh}" rx="20" fill="#ffffff"/></g>
  <g clip-path="url(#winClip)">
    <rect x="{wx}" y="{wy}" width="{ww}" height="48" fill="#f5f5fa"/>
    <circle cx="{wx+30}" cy="{wy+24}" r="6.5" fill="#ff5f57"/>
    <circle cx="{wx+52}" cy="{wy+24}" r="6.5" fill="#febc2e"/>
    <circle cx="{wx+74}" cy="{wy+24}" r="6.5" fill="#28c840"/>
    <rect x="{wx+150}" y="{wy+12}" width="460" height="26" rx="13" fill="#ffffff"/>
    <text x="{wx+380}" y="{wy+30}" font-size="14" fill="#a3a3b0" text-anchor="middle">studioluxe.com</text>

    <!-- site nav -->
    <text x="{wx+40}" y="{py+44}" font-size="22" font-weight="800" fill="{ink}" letter-spacing="0.5">STUDIO LUXE</text>
    {"".join(f'<text x="{wx+430+i*78}" y="{py+44}" font-size="15" fill="{muted}">{t}</text>' for i,t in enumerate(["Work","Studio","Journal"]))}
    <rect x="{wx+660}" y="{py+22}" width="100" height="36" rx="18" fill="{ink}"/>
    <text x="{wx+710}" y="{py+45}" font-size="14" font-weight="600" fill="#fff" text-anchor="middle">Contact</text>

    <!-- hero copy -->
    <text x="{wx+40}" y="{py+118}" font-size="13" font-weight="700" fill="{P}" letter-spacing="2">INTERIOR &amp; ARCHITECTURE</text>
    <text x="{wx+38}" y="{py+182}" font-family="{FONT}" font-size="54" font-weight="800" fill="{ink}" letter-spacing="-1.5">Spaces that</text>
    <text x="{wx+38}" y="{py+244}" font-size="54" font-weight="800" fill="{ink}" letter-spacing="-1.5">feel like <tspan font-family="{SERIF}" font-weight="400" font-style="italic" fill="{P}">home.</tspan></text>
    <text x="{wx+40}" y="{py+292}" font-size="16" fill="{muted}">Award-winning design for modern living,</text>
    <text x="{wx+40}" y="{py+316}" font-size="16" fill="{muted}">crafted around how you actually live.</text>
    <rect x="{wx+40}" y="{py+346}" width="186" height="50" rx="25" fill="{P}"/>
    <text x="{wx+133}" y="{py+377}" font-size="16" font-weight="600" fill="#fff" text-anchor="middle">View projects</text>
    <rect x="{wx+238}" y="{py+346}" width="120" height="50" rx="25" fill="none" stroke="#e0e0ea" stroke-width="2"/>
    <text x="{wx+298}" y="{py+377}" font-size="16" font-weight="600" fill="{ink}" text-anchor="middle">About</text>

    <!-- hero image block (real photo) -->
    {photo(datauri("hero-interior.jpg"), wx+450, py+88, 270, 320, "heroShot", rx=16)}

    <!-- footer logo strip -->
    <rect x="{wx+40}" y="{py+452}" width="{ww-80}" height="1.5" fill="#eeedf4"/>
    {"".join(pill(wx+40+i*120, py+480, 84, 22, "#edecf4") for i in range(4))}
  </g>

  <!-- ===== Floating proof cards ===== -->
  <!-- performance, top-left (overlaps only the window's left padding) -->
  <g filter="url(#cardShadow)"><rect x="296" y="206" width="206" height="120" rx="18" fill="#ffffff"/></g>
  <circle cx="350" cy="266" r="30" fill="none" stroke="#ececf3" stroke-width="8"/>
  <circle cx="350" cy="266" r="30" fill="none" stroke="{P}" stroke-width="8" stroke-linecap="round"
          stroke-dasharray="179 188" transform="rotate(-90 350 266)"/>
  <text x="350" y="272" font-size="20" font-weight="800" fill="{ink}" text-anchor="middle">99</text>
  <text x="398" y="258" font-size="13" fill="{muted}">Lighthouse</text>
  <text x="398" y="280" font-size="16" font-weight="700" fill="{ink}">Performance</text>

  <!-- published, top-right -->
  <g filter="url(#cardShadow)"><rect x="1110" y="150" width="222" height="92" rx="18" fill="#ffffff"/></g>
  <circle cx="1152" cy="196" r="20" fill="#eafaf0"/>
  <path d="M1144 196 l6 6 l11 -12" fill="none" stroke="#22a55a" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="1184" y="190" font-size="16" font-weight="700" fill="{ink}">Published</text>
  <text x="1184" y="214" font-size="13" fill="{muted}">shipped in 18 days</text>

  <!-- live enquiry, bottom-left -->
  <g filter="url(#cardShadow)"><rect x="330" y="496" width="296" height="116" rx="18" fill="#ffffff"/></g>
  <circle cx="364" cy="534" r="7" fill="#22c55e"/>
  <text x="382" y="540" font-size="16" font-weight="700" fill="{ink}">New enquiry</text>
  <text x="560" y="540" font-size="13" fill="{muted}" text-anchor="end">2m ago</text>
  <circle cx="364" cy="578" r="16" fill="#efeeff"/>
  <text x="364" y="583" font-size="13" font-weight="700" fill="{P}" text-anchor="middle">S</text>
  <text x="390" y="575" font-size="14" font-weight="600" fill="{ink}">Sarah M.</text>
  <text x="390" y="595" font-size="13" fill="{muted}">“We need a new website.”</text>

  <!-- conversions, bottom-right -->
  <g filter="url(#cardShadow)"><rect x="1086" y="494" width="252" height="120" rx="18" fill="#ffffff"/></g>
  <text x="1110" y="528" font-size="13" fill="{muted}">Conversions</text>
  <text x="1110" y="566" font-size="32" font-weight="800" fill="{ink}" letter-spacing="-1">+38<tspan font-size="22">%</tspan></text>
  <text x="1110" y="592" font-size="12" fill="#22a55a">▲ since relaunch</text>
  <polyline points="1238,592 1262,580 1286,584 1306,560 1322,540"
            fill="none" stroke="url(#spark)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="1322" cy="540" r="4.5" fill="{P}"/>
</svg>'''


files = {
    "web-northpeak.svg": northpeak(),
    "web-verde.svg": verde(),
    "web-atelier.svg": atelier(),
    "web-maison.svg": maison(),
    "web-harbor.svg": harbor(),
    "web-atlas.svg": atlas(),
    "web-hero.svg": hero(),
}
for name, svg in files.items():
    with open(os.path.join(OUT, name), "w") as f:
        f.write(svg)
    print("wrote", name, len(svg), "bytes")
