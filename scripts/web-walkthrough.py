# 最終走查截圖(直達 URL 模式;tab 切換 web 限制見驗收說明)
import time

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

opts = Options()
opts.add_argument("--headless=new")
opts.add_argument("--window-size=402,874")
d = webdriver.Chrome(options=opts)
OUT = r"D:\TIME-management\.shots"

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

def shot(name):
    d.save_screenshot(OUT + "\\" + name + ".png")
    print("shot:", name)

try:
    d.get("http://localhost:8081/")
    time.sleep(10)
    shot("01-onboarding-s1")
    click_text("繼續"); time.sleep(1.5)
    shot("02-onboarding-s2")
    click_text("繼續"); time.sleep(1.5)
    shot("03-onboarding-s3")
    click_text("開始使用"); time.sleep(3)
    shot("04-today-timeline")

    click_text("時鐘盤"); time.sleep(1.5); shot("05-today-clock")
    click_text("日誌卡"); time.sleep(1.5); shot("06-today-blocks")
    click_text("週"); time.sleep(1.5); shot("07-today-week")

    d.get("http://localhost:8081/stats"); time.sleep(6); shot("08-stats")
    d.get("http://localhost:8081/adjust"); time.sleep(5); shot("09-adjust")
    d.get("http://localhost:8081/settings"); time.sleep(5); shot("10-settings")

    click_text("English"); time.sleep(1.5)
    shot("11-settings-en")
    d.get("http://localhost:8081/"); time.sleep(6)
    shot("12-today-en")

    severe = [e for e in d.get_log("browser") if e["level"] == "SEVERE"]
    print("severe console errors:", len(severe))
    for e in severe[:5]:
        print("CONSOLE:", e["message"][:200])
    print("FINAL_WALKTHROUGH_DONE")
finally:
    d.quit()
