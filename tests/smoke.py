"""Smoke test for the site. Serves the repo, opens it in headless Chrome at several sizes,
exercises the interactive parts and saves screenshots to tests/shots/.

    pip install playwright && playwright install chromium
    python tests/smoke.py            # add --channel chrome to use an installed Chrome
"""
import functools, http.server, pathlib, sys, threading
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
SHOTS = ROOT / "tests" / "shots"
SHOTS.mkdir(exist_ok=True)
SIZES = {"desktop": (1440, 900), "laptop": (1024, 768), "tablet": (768, 1024), "phone": (390, 844), "small": (320, 640)}
failures = []


def check(ok, label):
    print(("  ok   " if ok else "  FAIL ") + label)
    if not ok:
        failures.append(label)


def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    handler = functools.partial(Quiet, directory=str(ROOT))
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, f"http://127.0.0.1:{srv.server_address[1]}/index.html"


def run(page, name, url, reduced=False):
    w, h = SIZES[name]
    print(f"\n{name} {w}x{h}" + (" (reduced motion)" if reduced else ""))
    errors, missing = [], []
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("response", lambda r: missing.append(r.url) if r.status >= 400 and not r.url.endswith("resume.pdf") else None)
    page.set_viewport_size({"width": w, "height": h})
    page.goto(url)
    page.add_style_tag(content="html { scroll-behavior: auto !important; }")  # instant jumps keep the timing checks stable
    page.wait_for_timeout(2200)  # let the entrance finish
    tag = name + ("-reduced" if reduced else "")
    page.screenshot(path=str(SHOTS / f"{tag}-0-start.png"))

    check(page.evaluate("document.fonts.check('1em Marcellus') && document.fonts.check('1em \"Albert Sans\"')"), "fonts loaded")
    check(page.locator(".hero__name").bounding_box()["height"] > 40, "name visible")
    check(page.evaluate("getComputedStyle(document.querySelector('.hero__sub')).opacity") == "1", "hero text fully visible after entrance")
    gaps = page.evaluate("""() => { const y = (sel, edge) => document.querySelector(sel).getBoundingClientRect()[edge] + scrollY;
        const lastHero = Math.max(y('#menu', 'bottom'), y('.keys', 'bottom'));
        return [Math.round(y('#character h2', 'top') - lastHero), Math.round(y('#quests h2', 'top') - y('#character .parchment', 'bottom'))]; }""")
    print(f"  info hero-to-Player gap {gaps[0]}px, Player-to-Quest-log gap {gaps[1]}px")
    if w > 640:
        check(gaps[0] <= gaps[1] * 1.25, "gap under the menu matches the gaps between other sections")
    check(page.locator(".compass__marker").count() == 6, "compass has 6 markers")
    check(page.locator(".quest-tab").count() == 4, "4 quests rendered")
    empty = 5 if w > 640 else 6
    check(page.locator("button.slot").count() == 3 and page.locator(".slot--empty").count() == empty, "inventory shows 3 projects with empty slots padding the grid")
    check(page.locator("#constellation-svg .star").count() == 36, "36 skill stars rendered")
    check(page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"), "no sideways scroll")

    # canvas actually paints clouds
    painted = page.evaluate("""() => { const c = document.getElementById('sky-canvas');
        const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        let n = 0; for (let i = 3; i < d.length; i += 400) if (d[i] > 8) n++; return n; }""")
    check(painted > 50, f"sky canvas has painted pixels ({painted} samples)")

    # sky and clock change with scroll
    sky0 = page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--sky-0')")
    for i, sec in enumerate(["character", "quests", "inventory", "skills", "contact"], 1):
        page.evaluate(f"document.documentElement.style.scrollBehavior='auto'; document.getElementById('{sec}').scrollIntoView()")
        page.wait_for_timeout(2600 if sec in ("skills", "quests") else 700)
        page.screenshot(path=str(SHOTS / f"{tag}-{i}-{sec}.png"))
        cur = page.locator(".compass__marker[aria-current=true]").inner_text()
        check(cur.lower() == page.locator(f"#{sec}").get_attribute("data-nav").lower(), f"compass points at {sec} ({cur})")
    check(page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--sky-0')") != sky0, "sky colour changed by the end")
    check(page.locator("#sundial-time").inner_text() > "22:00", "clock reads late evening at the bottom")
    check(page.locator(".toast", has_text="Night flight").count() == 1, "end-of-page achievement toast shown")
    page.wait_for_timeout(2400)
    raven = page.evaluate("""() => { const a = document.getElementById('raven'), b = document.getElementById('raven-bird').getBoundingClientRect(),
        art = a.querySelector('svg').getBoundingClientRect(), t = a.querySelector('.raven__text');
        return { href: a.getAttribute('href'), flying: a.classList.contains('is-flying'), landed: b.left >= art.left - 4 && b.right <= art.right + 4 && b.bottom <= art.bottom + 4,
          text: t.innerText, opacity: getComputedStyle(t).opacity, h: a.getBoundingClientRect().height }; }""")
    check(raven["href"].startswith("mailto:") and "Send a raven" in raven["text"] and "@gmail.com" in raven["text"], "raven is the email link and says so")
    check(raven["landed"] and not raven["flying"] and raven["opacity"] == "1", f"raven has landed and its button is visible")
    page.screenshot(path=str(SHOTS / f"{tag}-5b-raven.png"))
    check(page.evaluate("[...document.querySelectorAll('#constellation-svg .star')].every(s => getComputedStyle(s).opacity === '1')"), "all stars visible after reveal")

    # quest log tabs
    page.evaluate("document.getElementById('quests').scrollIntoView()")
    page.locator(".quest-tab").nth(2).click()
    page.wait_for_timeout(700)
    check("Machine Learning" in page.locator(".quest__title").inner_text(), "clicking a quest swaps the detail panel")
    page.locator(".quest-tab").nth(2).press("ArrowDown")
    page.wait_for_timeout(700)
    check("Hack@Davidson" in page.locator(".quest__title").inner_text(), "arrow keys move between quests")
    check(page.locator(".quest__status").inner_text() == "In progress", "active quest shows In progress")
    page.screenshot(path=str(SHOTS / f"{tag}-6-quest-switched.png"))

    # the scroll has finished unrolling and its two views switch
    check(not page.evaluate("getComputedStyle(document.querySelector('.scroll__paper')).clipPath").startswith("inset"), "scroll fully unrolled")
    page.locator("#view-tab-map").click()
    page.wait_for_timeout(2600)
    check(page.locator("#view-map").is_visible() and not page.locator("#view-quests").is_visible(), "Map tab swaps the view")
    check(page.locator(".pin").count() == 2 and page.locator(".place").count() == 2, "map has 2 markers and 2 place cards")
    centre = """() => { const s = document.querySelector('.worldmap__stage').getBoundingClientRect();
        return [...document.querySelectorAll('.pin')].map(p => { const r = p.getBoundingClientRect();
          return [(r.left + r.width / 2 - s.left) / s.width, (r.top + r.height / 2 - s.top) / s.height]; }); }"""
    scale = "(document.getElementById('wm-world').getAttribute('transform').match(/scale\\(([\\d.]+)\\)/) || [0, 1])[1] * 1"
    check(all(0 < v < 1 for pt in page.evaluate(centre) for v in pt), "markers sit inside the map")
    page.locator(".worldmap").screenshot(path=str(SHOTS / f"{tag}-8-map.png"))
    page.locator(".wm__btn[aria-label='Zoom in']").click()
    check(abs(page.evaluate(scale) - 1.6) < 0.01, "zoom in button zooms the map")
    before = page.evaluate("document.getElementById('wm-world').getAttribute('transform')")
    page.locator(".worldmap__stage").scroll_into_view_if_needed()
    page.evaluate("document.querySelector('.worldmap__stage').scrollIntoView({block: 'center'})")
    page.wait_for_timeout(300)
    box = page.locator(".worldmap__stage").bounding_box()
    page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
    page.mouse.down(); page.mouse.move(box["x"] + box["width"] / 2 - 60, box["y"] + box["height"] / 2 - 20, steps=4); page.mouse.up()
    check(page.evaluate("document.getElementById('wm-world').getAttribute('transform')") != before, "dragging pans the map")
    page.locator(".place__fly", has_text="Bhutan").click()
    page.wait_for_timeout(1800)
    pt = page.evaluate(centre)[0]
    check(page.evaluate(scale) > 5 and abs(pt[0] - 0.5) < 0.05 and abs(pt[1] - 0.5) < 0.08, "Fly to Bhutan zooms in and centres its marker")
    check("is-active" in page.locator(".place").first.get_attribute("class"), "flying to Bhutan highlights its card")
    page.locator(".worldmap__stage").screenshot(path=str(SHOTS / f"{tag}-8b-map-bhutan.png"))
    page.locator(".wm__btn", has_text="World").click()
    page.wait_for_timeout(1600)
    check(abs(page.evaluate(scale) - 1) < 0.01, "World button resets the view")
    page.locator(".worldmap").screenshot(path=str(SHOTS / f"{tag}-8-map.png"))
    page.locator(".place__quests button", has_text="Machine Learning").click()
    page.wait_for_timeout(500)
    check(page.locator("#view-quests").is_visible() and "Machine Learning" in page.locator(".quest__title").inner_text(), "a quest link on the map opens that quest")

    # summit homage
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(500)
    page.locator("#summit").click()
    page.wait_for_timeout(500)
    check(page.locator("#summit-note").is_visible() and "Tenzing Norgay" in page.locator("#summit-note").inner_text(), "summit flags open the Tenzing Norgay note")
    check("I, too, will climb Everest one day." in page.locator("#summit-note").inner_text(), "summit note carries the Everest line")
    page.wait_for_timeout(1500)
    box = page.locator("#summit-note").bounding_box()
    check(box["x"] >= 0 and box["x"] + box["width"] <= w and box["y"] >= -1 and box["y"] + box["height"] <= h + 1, f"summit note is fully on screen {box}")
    geo = page.evaluate("""() => { const el = document.getElementById('summit-note'), n = el.getBoundingClientRect();
        const gap = (r) => Math.hypot(Math.max(n.left - r.right, r.left - n.right, 0), Math.max(n.top - r.bottom, r.top - n.bottom, 0));
        const min = (sel) => Math.min(9999, ...[...document.querySelectorAll(sel)].map(e => e.getBoundingClientRect()).filter(r => r.width).map(gap));
        const f = document.getElementById('summit').getBoundingClientRect();
        return { name: min('.hero__name .ch'), sub: min('.hero__sub'), menu: min('#menu a'), keys: min('.keys'), aboveFlag: f.top - n.bottom,
          tailOff: n.right - parseFloat(getComputedStyle(el).getPropertyValue('--tail')) - (f.left + 20), position: getComputedStyle(el).position }; }""")
    check(geo["position"] == "absolute", "summit bubble floats over the sky and does not push the text apart")
    check(geo["aboveFlag"] >= 4 and abs(geo["tailOff"]) <= 3, "summit bubble sits right above the flag with its tail on the pole")
    texts = ["name", "sub", "keys"] + (["menu"] if w > 640 else [])  # phones have no room beside the menu
    check(all(geo[k] >= 12 for k in texts), f"summit bubble keeps clear of the hero text { {k: round(geo[k]) for k in texts} }")
    page.screenshot(path=str(SHOTS / f"{tag}-9-summit.png"))
    page.keyboard.press("Escape")
    check(not page.locator("#summit-note").is_visible(), "Escape closes the summit note")

    # inventory: slots, detail panel, pouches
    page.evaluate("document.getElementById('inventory').scrollIntoView()")
    page.wait_for_timeout(500)
    page.locator("button.slot", has_text="Mantra").click()
    page.wait_for_timeout(600)
    check("Mantra" in page.locator("#bag-detail .item__name").inner_text() and page.locator("#bag-detail .item__link").count() == 1, "picking a slot shows that project")
    page.locator("#bag-tab-tools").click()
    page.wait_for_timeout(700)
    check(page.locator("button.slot").count() == 10 and page.locator(".slot--empty").count() == 2, "Tools pouch shows 10 tools and 2 empty slots")
    page.locator("button.slot", has_text="Supabase").click()
    page.wait_for_timeout(600)
    check("Supabase" in page.locator("#bag-detail .item__name").inner_text() and "Used in" in page.locator("#bag-detail").inner_text(), "picking a tool shows its details")
    page.locator("button.slot", has_text="Supabase").press("ArrowRight")
    page.wait_for_timeout(600)
    check("Databricks" in page.locator("#bag-detail .item__name").inner_text(), "arrow keys move between slots")
    page.locator("#bag").screenshot(path=str(SHOTS / f"{tag}-10-tools.png"))
    page.locator("#bag-tab-projects").click()
    page.wait_for_timeout(600)
    page.locator("#bag").screenshot(path=str(SHOTS / f"{tag}-10-projects.png"))
    clipped = page.evaluate("[...document.querySelectorAll('.slot__name')].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent)")
    check(not clipped, f"slot labels fit their slots {clipped or ''}")

    # skill hover (desktop layouts only)
    if w > 760:
        page.evaluate("document.getElementById('skills').scrollIntoView()")
        page.wait_for_timeout(500)
        overlaps = page.evaluate("""() => { const t = [...document.querySelectorAll('#constellation-svg .star__label, #constellation-svg .const__title')].map(e => [e.textContent, e.getBoundingClientRect()]);
            const d = [...document.querySelectorAll('#constellation-svg .star__dot')].map(e => ['dot', e.getBoundingClientRect()]);
            const hit = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom; const out = [];
            for (let i = 0; i < t.length; i++) { for (let j = i + 1; j < t.length; j++) if (hit(t[i][1], t[j][1])) out.push(t[i][0] + ' x ' + t[j][0]);
              for (const k of d) if (hit(t[i][1], k[1])) out.push(t[i][0] + ' x dot'); }
            const s = document.getElementById('constellation-svg').getBoundingClientRect();
            for (const [n, r] of t) if (r.right > s.right + 1 || r.left < s.left - 1) out.push(n + ' outside'); return out; }""")
        check(not overlaps, f"constellation labels do not overlap {overlaps or ''}")
        page.locator("#constellation-svg .star", has_text="LangGraph").locator(".star__hit").hover()
        check("Budgetation" in page.locator("#skill-readout").inner_text(), "hovering a star updates the readout")
        mid = page.evaluate("""() => { const p = document.getElementById('skill-readout'), r = document.createRange(); r.selectNodeContents(p);
            const t = r.getBoundingClientRect(), b = p.getBoundingClientRect(); return Math.abs((t.top + t.bottom) / 2 - (b.top + b.bottom) / 2); }""")
        check(mid <= 2, "skill readout text is centred on its gold line")
        page.screenshot(path=str(SHOTS / f"{tag}-7-skill-hover.png"))
    else:
        check(page.locator(".skill-lists").is_visible() and not page.locator(".constellation").is_visible(), "small screens get the list instead of the constellation")

    # keyboard: number keys, menu arrows, cheat code
    page.mouse.move(5, 5)
    page.keyboard.press("0")
    try:
        page.wait_for_function("window.scrollY < 5", timeout=12000)  # smooth scroll from the bottom of a long page
    except Exception:
        pass
    check(page.evaluate("window.scrollY") < 5, "0 key returns to the start")
    page.locator("#menu a").first.focus()
    page.keyboard.press("ArrowDown")
    check("Quest log" in page.evaluate("document.activeElement.textContent"), "arrow keys move the menu cursor")
    check(page.locator("#menu a.is-selected").count() == 1, "exactly one menu item selected")
    page.keyboard.press("Enter")
    page.wait_for_timeout(700)
    check(page.evaluate("location.hash") == "#quests", "Enter on a menu item jumps to its section")
    page.keyboard.press("3")
    page.wait_for_timeout(1500)
    check(page.locator(".compass__marker[aria-current=true]").inner_text() == "Projects", "3 key jumps to projects")
    for k in ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"]:
        page.keyboard.press(k)
    page.wait_for_timeout(300)
    check(page.locator(".toast", has_text="Cheat enabled").count() == 1, "cheat code fires")
    page.locator(".toast", has_text="Cheat enabled").locator(".toast__close").click()
    page.wait_for_timeout(500)
    check(page.locator(".toast", has_text="Cheat enabled").count() == 0, "toast can be dismissed")

    # compass link click
    page.locator(".compass__marker", has_text="Contact").click(force=True)
    page.wait_for_timeout(800)
    check(page.locator(".compass__marker[aria-current=true]").inner_text() == "Contact", "compass marker click navigates")

    # small tap targets
    small = page.evaluate("""() => [...document.querySelectorAll('a, button')].filter(e => {
        const r = e.getBoundingClientRect(); return r.width && (r.height < 40) && !e.classList.contains('skip-link'); })
        .map(e => e.className + ':' + Math.round(e.getBoundingClientRect().height))""")
    check(not small, f"tap targets at least 40px tall {small or ''}")
    check(not errors, f"no console errors {errors or ''}")
    check(not missing, f"no failed requests {missing or ''}")


def reload_check(page, url):
    """The end-of-page achievement must show again on every load, at short window heights too."""
    print("\nachievement after reload, 900x420")
    page.set_viewport_size({"width": 900, "height": 420})
    for attempt in ("first load", "after reload"):
        page.goto(url)
        page.wait_for_timeout(800)
        page.evaluate("window.scrollTo(0, document.documentElement.scrollHeight)")
        page.wait_for_timeout(1500)
        check(page.locator(".toast", has_text="Night flight").count() == 1, f"end-of-page achievement shows ({attempt})")


if __name__ == "__main__":
    channel = sys.argv[sys.argv.index("--channel") + 1] if "--channel" in sys.argv else None
    srv, url = serve()
    with sync_playwright() as p:
        browser = p.chromium.launch(channel=channel)
        for name in SIZES:
            ctx = browser.new_context()
            run(ctx.new_page(), name, url)
            ctx.close()
        ctx = browser.new_context()
        reload_check(ctx.new_page(), url)
        ctx.close()
        ctx = browser.new_context(reduced_motion="reduce")
        run(ctx.new_page(), "desktop", url, reduced=True)
        ctx.close()
        browser.close()
    srv.shutdown()
    print(f"\n{len(failures)} failure(s)" + ("" if not failures else ": " + "; ".join(failures)))
    sys.exit(1 if failures else 0)
