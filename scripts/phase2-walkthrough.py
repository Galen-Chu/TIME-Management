# Phase 2 CRUD 流程走查(web;InMemory repo)
import time

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

opts = Options()
opts.add_argument("--headless=new")
opts.add_argument("--window-size=402,874")
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
    d.get("http://localhost:8081/")
    time.sleep(10)
    click_text("繼續"); time.sleep(1.2)
    click_text("繼續"); time.sleep(1.2)
    click_text("開始使用"); time.sleep(3)

    # 首次無紀錄 → 空狀態(§B)
    click_text("日誌卡"); time.sleep(1.5)
    check("空狀態顯示(還沒有任何紀錄)", "還沒有任何紀錄" in body())
    d.save_screenshot(r"D:\TIME-management\.shots\p2-01-empty.png")

    # 回時間軸:點空白新增事件(tap layer 難以定位 → 以 JS 觸發第一個 add-event 按壓層)
    click_text("時間軸"); time.sleep(1)
    ok = d.execute_script("""
      const els = document.querySelectorAll('[aria-label="add event"]');
      if (els.length === 0) return false;
      els[0].click();
      return true;
    """)
    check("點開新增表單", ok)
    time.sleep(1.5)
    check("表單標題=新增", "新增這段時間的紀錄" in body())

    # 填名稱+選類別+儲存
    inp = d.find_element(By.TAG_NAME, "input")
    inp.clear(); inp.send_keys("深度工作")
    for el in d.find_elements(By.XPATH, '//*[contains(text(), "工作")]'):
        try:
            el.click(); break
        except Exception:
            continue
    time.sleep(0.5)
    click_text("儲存"); time.sleep(2)
    check("事件出現在時間軸", "深度工作" in body())
    d.save_screenshot(r"D:\TIME-management\.shots\p2-02-created.png")

    # 日誌卡:已完成清單
    click_text("日誌卡"); time.sleep(1.5)
    check("日誌卡:已完成出現", "深度工作" in body())
    check("統計卡:工作時數 > 0", any("1" in e.text for e in d.find_elements(By.XPATH, '//*[contains(text(), "小時")]')))
    d.save_screenshot(r"D:\TIME-management\.shots\p2-03-blocks.png")

    # 例行工事勾選 → streak +1
    before = [e.text for e in d.find_elements(By.XPATH, '//*[contains(text(), "連續")]')]
    for el in d.find_elements(By.XPATH, '//*[contains(text(), "晨間冥想")]'):
        try:
            el.click(); break
        except Exception:
            continue
    time.sleep(1.5)
    after = [e.text for e in d.find_elements(By.XPATH, '//*[contains(text(), "連續")]')]
    check("勾選切換(streak 文案更新)", before != after)
    d.save_screenshot(r"D:\TIME-management\.shots\p2-04-routine.png")

    # 週檢視有資料
    click_text("週"); time.sleep(1.5)
    check("週檢視 7 列", len(d.find_elements(By.XPATH, '//*[text()="24h"]')) >= 7)
    d.save_screenshot(r"D:\TIME-management\.shots\p2-05-week.png")

    severe = [e for e in d.get_log("browser") if e["level"] == "SEVERE"]
    real_errors = [e for e in severe if "Invalid DOM property" not in e["message"]]
    check("0 實質 console errors", len(real_errors) == 0)

    print(f"P2 RESULT {sum(1 for _, c in P if c)} / {len(P)}")
finally:
    d.quit()
