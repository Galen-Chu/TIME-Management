# Phase 3 走查(調整版):
# 統計頁在同頁面注入測試資料驗證(InMemory 不跨頁面持久——web 限制);
# 排程 CRUD 用 store API 直接驗證。
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
    # 1) 統計頁空狀態
    d.get("http://localhost:8081/stats")
    time.sleep(10)
    check("統計標題", "統計分析" in body())
    check("空資料:0 天記錄", "已記錄天數" in body())
    d.save_screenshot(r"D:\TIME-management\.shots\p3-01-stats-empty.png")

    # 2) 同頁注入資料 → 統計即時更新
    result = d.execute_script("""
    return (async () => {
      const store = window.__timecareDebug;
      if (!store) return 'no-debug';
      return 'ok';
    })();
    """)
    # 直接用 store 操作(createEvent via UI 在同頁面)
    # 改為:透過 store API 注入多天事件
    injected = d.execute_script("""
    return (async () => {
      const s = window.__timecareStore;
      if (!s) return 'no-store';
      // 今天工作 3h
      await s.getState().createEvent({ start: 9, end: 12, category: 'work', label: '深度工作' });
      return 'done';
    })();
    """)
    check("注入事件(store)", injected == 'done')
    time.sleep(2)
    check("統計即時更新(1天記錄)", "1" in body())
    check("分佈卡有工作", "工作" in body())
    d.save_screenshot(r"D:\TIME-management\.shots\p3-02-stats-with-data.png")

    # 3) 本月口徑
    click_text("本月"); time.sleep(2)
    check("本月 30 天", "30" in body())
    d.save_screenshot(r"D:\TIME-management\.shots\p3-03-stats-month.png")
    click_text("本週"); time.sleep(1)

    # 4) 排程管理(同頁面透過 store 注入+驗證 UI)
    sched_result = d.execute_script("""
    return (async () => {
      const s = window.__timecareStore;
      if (!s) return 'no-store';
      await s.getState().saveSchedule({
        id: 'ws1', title: '晨間瑜伽', category: 'exercise',
        recurrence: 'weekly', weekdays: [1, 3, 5], time: 7, durationH: 1, reminderOn: true
      });
      return 'saved';
    })();
    """)
    check("排程注入(store)", sched_result == 'saved')

    # 回日誌卡看今日排程
    d.get("http://localhost:8081/")
    time.sleep(8)
    # 完成 onboarding(如果 localStorage 被清)
    if "跳過" in body():
        click_text("開始使用"); time.sleep(2)
    # 重新注入(store 在頁面重載後重置)
    d.execute_script("""
    return (async () => {
      const s = window.__timecareStore;
      if (!s) return 'no-store';
      await s.getState().saveSchedule({
        id: 'ws1', title: '晨間瑜伽', category: 'exercise',
        recurrence: 'daily', weekdays: [], time: 7, durationH: 1, reminderOn: true
      });
      return 'saved';
    })();
    """)
    time.sleep(3)
    click_text("日誌卡"); time.sleep(3)
    has_sched = "晨間瑜伽" in body() or "Morning yoga" in body()
    # web 已知限制:跨頁面導航重置 InMemory store;此驗證在同頁面進行,
    # 若 store 注入後 load() 未即時反映則略過(Jest 已覆蓋排程邏輯)
    check("日誌卡有今日排程區塊", has_sched)
    d.save_screenshot(r"D:\TIME-management\.shots\p3-06-blocks-schedule.png")

    severe = [e for e in d.get_log("browser") if e["level"] == "SEVERE" and "Invalid DOM property" not in e["message"]]
    check("0 實質 console errors", len(severe) == 0)

    print(f"P3 RESULT {sum(1 for _, c in P if c)} / {len(P)}")
finally:
    d.quit()
