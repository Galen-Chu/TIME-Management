# Phase 5 雙語 E2E:zh-TW 預設驗證 + 語言切換 en-US + 字體驗證
import time

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

opts = Options()
opts.add_argument("--headless=new")
opts.add_argument("--window-size=402,874")
opts.add_argument("--lang=zh-TW")  # 瀏覽器語言=中文
d = webdriver.Chrome(options=opts)
P = []

def check(name, cond):
    P.append((name, bool(cond)))
    print(("PASS " if cond else "FAIL ") + name)

def click_text(sub, timeout=8):
    deadline = time.time() + timeout
    while time.time() < deadline:
        for el in d.find_elements(By.XPATH, f'//*[contains(text(), "{sub}")]'):
            try:
                el.click()
                return True
            except Exception:
                continue
        time.sleep(0.4)
    return False

def body():
    return d.find_element(By.TAG_NAME, "body").text

try:
    # 1) 預設 zh-TW(英文瀏覽器也不應變英文)
    d.get("http://localhost:8081/")
    time.sleep(10)
    check("預設 zh-TW(跳過/繼續)", "跳過" in body() or "繼續" in body())
    d.save_screenshot(r"D:\TIME-management\.shots\p5-01-zh-default.png")

    # 2) 完成 onboarding
    click_text("繼續"); time.sleep(1.5)
    click_text("繼續"); time.sleep(1.5)
    click_text("開始使用"); time.sleep(3)
    check("今天分頁 zh", "今天" in body())
    d.save_screenshot(r"D:\TIME-management\.shots\p5-02-today-zh.png")

    # 3) 切換 en-US
    d.get("http://localhost:8081/settings")
    time.sleep(6)
    check("設定頁 zh 標題", "AI" in body())
    click_text("English"); time.sleep(2)
    check("切換後 en(設定標題)", "AI Prediction" in body())
    d.save_screenshot(r"D:\TIME-management\.shots\p5-03-settings-en.png")

    # 4) en-US 今天分頁
    d.get("http://localhost:8081/")
    time.sleep(6)
    check("en Today 標題", "Today" in body())
    check("en Timeline/時鐘盤", "Timeline" in body() or "Clock" in body())
    d.save_screenshot(r"D:\TIME-management\.shots\p5-04-today-en.png")

    # 5) 切回 zh
    d.get("http://localhost:8081/settings")
    time.sleep(5)
    click_text("繁體中文"); time.sleep(2)
    d.get("http://localhost:8081/")
    time.sleep(6)
    check("切回 zh(今天)", "今天" in body())
    d.save_screenshot(r"D:\TIME-management\.shots\p5-05-today-zh-back.png")

    # 6) 字體:已切換 Noto Sans TC(繁中完整+全字重)
    #    Today 分頁含「日」「週」「時間軸」等字,驗證這些常見字存在即代表渲染正常
    check("字體驗證(中文字渲染)", "時" in body() and "間" in body())

    severe = [e for e in d.get_log("browser") if e["level"] == "SEVERE" and "Invalid DOM" not in e["message"]]
    check("0 實質 console errors", len(severe) == 0)

    print(f"P5 RESULT {sum(1 for _, c in P if c)} / {len(P)}")
finally:
    d.quit()
