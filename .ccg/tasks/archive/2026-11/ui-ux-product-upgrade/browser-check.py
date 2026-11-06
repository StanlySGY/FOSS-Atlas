"""Real Chromium user-journey regression. Run with the local Chromix environment."""
import json
import os
from pathlib import Path
import re
import sys
from urllib.parse import urlparse, parse_qs

sys.path.insert(0, '/home/sgy/Chromix/sdk/python')
os.environ.setdefault('CLOAKBROWSER_BINARY_PATH', '/home/sgy/.cache/chromix/v154.0.8037.97/linux-x64/chromix/chrome')
import chromix
from playwright.sync_api import expect

BASE = os.environ.get('ATLAS_TEST_URL', 'http://127.0.0.1:4174/FOSS-Atlas/')
ARTIFACTS = Path(os.environ.get('ATLAS_ARTIFACTS', '/tmp/foss-atlas-ux-check'))
ARTIFACTS.mkdir(exist_ok=True)
checks = []
errors = []
ctx = chromix.launch_context(headless=True, viewport={'width': 390, 'height': 844})
p = ctx.new_page()
p.emulate_media(reduced_motion='reduce')
p.on('pageerror', lambda e: errors.append(str(e)))
p.set_default_timeout(12000)

def passed(name, **data):
    checks.append({'check': name, **data})
    print('PASS', name, json.dumps(data, ensure_ascii=False), flush=True)

def home(query=''):
    p.goto(BASE + query)
    p.locator('#catalog-search').wait_for()
    p.evaluate('document.fonts.ready')

def width_ok():
    sizes = p.evaluate('({viewport: innerWidth, width: document.documentElement.scrollWidth})')
    assert sizes['width'] <= sizes['viewport'], sizes
    return sizes

try:
    home()
    expect(p.locator('.fa-resource-card')).to_have_count(8)
    expect(p.get_by_role('combobox', name='资源分类', exact=True)).to_be_visible()
    expect(p.get_by_role('button', name=re.compile('加载更多资源'))).to_contain_text('+8')
    p.get_by_role('button', name=re.compile('加载更多资源')).click()
    expect(p.locator('.fa-resource-card')).to_have_count(16)
    expect(p.locator('.fa-resource-title').nth(8)).to_be_focused()
    passed('mobile loads exactly eight more and keyboard focus reaches first new result')

    for intent, count in [('密码管理', 2), ('本地大模型', 3), ('向量数据库', 3), ('邮件发送', 3)]:
        p.locator('.fa-discovery-intents').get_by_role('button', name=intent, exact=True).click()
        expect(p.locator('#catalog-search')).to_have_value(intent)
        expect(p.locator('.fa-resource-card')).to_have_count(count)
        assert parse_qs(urlparse(p.url).query)['q'] == [intent]
    passed('four task shortcuts resolve to curated resources and URL state')

    p.get_by_role('button', name='收藏 Resend', exact=True).click()
    p.locator('.fa-quick-views').get_by_role('button', name=re.compile('我的收藏')).click()
    p.locator('#catalog-search').fill('this-does-not-match-any-resource')
    expect(p.locator('.fa-discovery-empty')).to_contain_text('收藏中没有匹配的资源')
    p.get_by_role('button', name='查看全部收藏', exact=True).click()
    expect(p.locator('.fa-resource-card')).to_have_count(1)
    expect(p.locator('.fa-resource-title')).to_have_text('Resend')
    assert parse_qs(urlparse(p.url).query)['saved'] == ['1']
    p.get_by_role('button', name='取消收藏 Resend', exact=True).click()
    expect(p.locator('.fa-discovery-empty')).to_contain_text('还没有收藏资源')
    p.get_by_role('button', name='去发现资源', exact=True).click()
    expect(p.locator('.fa-resource-card')).to_have_count(8)
    passed('empty favorites differ from filtered favorites; recovery preserves saved view')

    p.get_by_role('combobox', name='资源分类', exact=True).select_option('selfhost')
    # Category IDs come from the current dataset; the visible select is the actual entry point.
    assert parse_qs(urlparse(p.url).query)['cat'] == ['selfhost']
    assert urlparse(p.url).path == urlparse(BASE).path, p.url
    p.get_by_role('button', name=re.compile('^筛选')).click()
    p.get_by_role('button', name='列表视图', exact=True).click()
    expect(p.locator('.fa-discovery-grid')).to_have_class(re.compile('is-list'))
    p.reload()
    expect(p.get_by_role('combobox', name='资源分类', exact=True)).to_have_value('selfhost')
    expect(p.locator('.fa-discovery-grid')).to_have_class(re.compile('is-list'))
    passed('visible category and list preference survive refresh')

    home('?q=邮件发送&view=grid')
    for name in ['Resend', 'Brevo', 'Postal']:
        p.get_by_role('button', name=f'将 {name} 加入比较', exact=True).click()
    expect(p.get_by_role('complementary', name='已选比较资源')).to_contain_text('已选 3 / 3')
    p.reload()
    expect(p.get_by_role('complementary', name='已选比较资源')).to_contain_text('已选 3 / 3')
    p.get_by_role('link', name='查看 Resend 的 Wiki 详情', exact=True).click()
    p.locator('.fa-page-header--wiki').wait_for()
    p.locator('.fa-app-header').get_by_role('link', name=re.compile('FOSS-Atlas')).click()
    expect(p.get_by_role('complementary', name='已选比较资源')).to_contain_text('已选 3 / 3')
    p.get_by_role('button', name=re.compile('将 .* 加入比较')).first.click()
    expect(p.get_by_role('status').filter(has_text='最多同时比较')).to_be_visible()
    passed('comparison survives refresh and Wiki roundtrip; fourth selection is rejected')

    p.get_by_role('button', name='比较所选', exact=True).click()
    expect(p.locator('dialog:modal')).to_be_visible()
    expect(p.get_by_role('button', name='关闭资源比较', exact=True)).to_be_focused()
    expect(p.get_by_role('rowheader', name='适用场景', exact=True)).to_be_visible()
    expect(p.get_by_role('rowheader', name='全部额度与限制', exact=True)).to_be_visible()
    for _ in range(32):
        p.keyboard.press('Tab')
        assert p.evaluate('!!document.activeElement.closest("dialog")'), p.evaluate('document.activeElement.outerHTML')
    p.keyboard.press('Control+k')
    assert p.locator('dialog:modal').count() == 1
    assert p.get_by_role('dialog').count() == 1
    p.keyboard.press('Escape')
    expect(p.locator('dialog:modal')).to_have_count(0)
    expect(p.get_by_role('button', name='比较所选', exact=True)).to_be_focused()
    assert p.evaluate('document.body.style.overflow') != 'hidden'
    passed('native modal traps keyboard, isolates global shortcut and restores focus and scroll')

    p.get_by_role('button', name='比较所选', exact=True).click()
    p.evaluate("Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {writeText: () => Promise.reject(new Error('test denied'))}})")
    p.get_by_role('button', name='复制比较链接', exact=True).click()
    manual = p.get_by_role('textbox', name='手动复制比较链接', exact=True)
    expect(manual).to_be_visible()
    share_url = manual.input_value()
    share_params = parse_qs(urlparse(share_url).query)
    assert set(share_params) == {'compare', 'comparing'}, share_params
    assert share_params['compare'] == ['resend,brevo,postal']
    p.screenshot(path=str(ARTIFACTS/'comparison-mobile.png'))
    new = ctx.new_page()
    new.emulate_media(reduced_motion='reduce')
    new.goto(share_url)
    expect(new.locator('dialog:modal')).to_be_visible()
    assert new.locator('.fa-comparison-table thead th').count() == 4
    new.close()
    p.get_by_role('button', name='关闭资源比较', exact=True).click()
    passed('failed share copy exposes a clean manual link which opens the same comparison')

    for viewport in [320, 390, 768, 1440]:
        p.set_viewport_size({'width':viewport,'height':900 if viewport>=768 else 844})
        home('?view=grid&compare=')
        expect(p.locator('.fa-comparison-tray')).to_have_count(0)
        dims=width_ok()
        if viewport<=390:
            values=p.locator('.fa-resource-card').first.evaluate('''card => ({text:parseFloat(getComputedStyle(card.querySelector('.fa-resource-description')).fontSize),buttons:[...card.querySelectorAll('.fa-favorite-button,.fa-resource-actions a,.fa-resource-actions button')].map(e=>e.getBoundingClientRect().height),search:parseFloat(getComputedStyle(document.querySelector('#catalog-search')).fontSize)})''')
            assert values['text']>=14 and values['search']>=16,values
            assert all(h>=44 for h in values['buttons']),values
        p.screenshot(path=str(ARTIFACTS/f'home-{viewport}.png'))
        p.get_by_role('button', name=re.compile('^筛选')).click()
        p.get_by_role('button', name='列表视图', exact=True).click()
        width_ok()
        passed(f'{viewport}px grid/list fit viewport', **dims)

    p.set_viewport_size({'width':390,'height':844})
    p.goto(BASE+'wiki/ollama/')
    p.locator('.md').first.wait_for()
    p.evaluate("Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {writeText: () => Promise.reject(new Error('test denied'))}})")
    p.get_by_role('button', name='复制链接', exact=True).click()
    expect(p.get_by_role('textbox', name='分享链接', exact=True)).to_have_value(BASE+'wiki/ollama/')
    expect(p.get_by_role('textbox', name='分享链接', exact=True)).to_be_focused()
    width_ok()
    passed('Wiki copy denial produces a focused, selectable manual link')

    for route in ['graph/?view=list', 'graph/', 'deployed/', 'wiki/ollama/']:
        p.set_viewport_size({'width':320,'height':844})
        p.goto(BASE+route)
        p.locator('main').wait_for()
        p.evaluate('document.fonts.ready')
        width_ok()
        assert p.locator('vite-error-overlay').count()==0
        passed('320px route smoke '+route)
    # Browser storage can be denied; explicit URL selection still works.
    denied = ctx.new_page()
    denied.add_init_script("Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('denied','SecurityError') } })")
    denied.goto(BASE+'?compare=resend,brevo&comparing=1')
    expect(denied.locator('dialog:modal')).to_be_visible()
    denied.get_by_role('button', name='关闭资源比较', exact=True).click()
    denied.reload()
    expect(denied.get_by_role('complementary', name='已选比较资源')).to_contain_text('已选 2 / 3')
    denied.close()
    passed('URL comparison works even when local storage access throws')
    assert not errors,errors
    passed('no browser runtime errors', errors=errors)
finally:
    (ARTIFACTS/'results.json').write_text(json.dumps({'checks':checks,'runtimeErrors':errors},ensure_ascii=False,indent=2))
    p.screenshot(path=str(ARTIFACTS/'last-state.png'))
    ctx.close()
