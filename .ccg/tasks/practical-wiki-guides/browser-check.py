"""Practical-guide reading checks against a built site in real Chromium."""
import json, os, re, sys
from pathlib import Path
sys.path.insert(0, '/home/sgy/Chromix/sdk/python')
os.environ.setdefault('CLOAKBROWSER_BINARY_PATH', '/home/sgy/.cache/chromix/v154.0.8037.97/linux-x64/chromix/chrome')
import chromix
from playwright.sync_api import expect
BASE = os.environ.get('ATLAS_TEST_URL', 'http://127.0.0.1:4175/')
OUT = Path(os.environ.get('ATLAS_ARTIFACTS', '/tmp/foss-practical-browser-root'))
OUT.mkdir(exist_ok=True)
checks, errors = [], []
ctx = chromix.launch_context(headless=True, viewport={'width': 390, 'height': 844})
ctx.grant_permissions(['clipboard-read', 'clipboard-write'])
p = ctx.new_page()
p.emulate_media(reduced_motion='reduce')
p.on('pageerror', lambda e: errors.append(str(e)))
p.set_default_timeout(12000)
def passed(name):
    checks.append(name)
    print('PASS', name, flush=True)
try:
    for width in [320, 390, 1440]:
        p.set_viewport_size({'width': width, 'height': 900 if width==1440 else 844})
        for resource in ['ollama', 'vaultwarden', 'qdrant', 'resend']:
            response=p.goto(BASE+'wiki/'+resource+'/')
            assert response.ok, response.status
            jump=p.get_by_role('link', name='跳到快速上手', exact=True)
            expect(jump).to_be_visible()
            p.evaluate('document.fonts.ready')
            assert p.evaluate('document.documentElement.scrollWidth <= innerWidth')
            p.screenshot(path=str(OUT/f'{resource}-{width}-header.png'))
            jump.click()
            target=p.locator('h2').filter(has_text=re.compile('^快速上手$'))
            expect(target).to_be_focused()
            assert p.evaluate('decodeURIComponent(location.hash)')=='#'+target.get_attribute('id')
            rect=target.bounding_box(); assert 0<=rect['y']<250, rect
            assert p.locator('.md h3').count()>=3
            p.reload()
            expect(target).to_be_focused()
            rect=target.bounding_box(); assert 0<=rect['y']<250, rect
            block=p.locator('.fa-markdown-code').first
            block.scroll_into_view_if_needed()
            content=block.locator('code').inner_text()
            block.get_by_role('button',name='复制代码块',exact=True).click()
            expect(block.get_by_role('button',name='代码已复制',exact=True)).to_be_visible()
            assert p.evaluate('navigator.clipboard.readText()')==content
            assert p.evaluate('document.documentElement.scrollWidth <= innerWidth')
            p.screenshot(path=str(OUT/f'{resource}-{width}-steps.png'))
            if width<1440:
                p.locator('.fa-wiki-toc-compact summary').click()
                nav=p.get_by_role('navigation',name='本页目录（移动与窄屏）')
            else:
                nav=p.get_by_role('navigation',name='本页目录（桌面）')
            h3=p.locator('.md h3').nth(1)
            nav.get_by_role('link',name=h3.inner_text(),exact=True).click()
            expect(h3).to_be_focused()
            assert p.evaluate('document.documentElement.scrollWidth <= innerWidth')
            passed(f'{resource} at {width}px: jump/reload focus, H3 outline, actual clipboard, width')
    p.goto(BASE+'wiki/ollama/')
    p.locator('.md').get_by_role('link',name='Dify',exact=True).click()
    expect(p.locator('.fa-page-header--wiki')).to_contain_text('Dify')
    assert '/wiki/dify' in p.url
    p.reload()
    expect(p.locator('.fa-page-header--wiki')).to_contain_text('Dify')
    passed('internal Wiki link and refreshed nested route')
    assert not errors, errors
    passed('no runtime errors')
finally:
    (OUT/'results.json').write_text(json.dumps({'base':BASE,'checks':checks,'errors':errors}, ensure_ascii=False,indent=2))
    p.screenshot(path=str(OUT/'last-state.png'))
    ctx.close()
