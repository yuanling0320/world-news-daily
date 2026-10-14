"""選用：每日早上由 Telegram Bot 推送新聞摘要。"""
import json
import os
import sys
from pathlib import Path

import requests

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")
if not TOKEN or not CHAT_ID:
    print("[Telegram] 尚未設定 Bot Token 或 Chat ID，略過推播。")
    sys.exit(0)

path = Path(__file__).resolve().parents[1] / "site" / "news.json"
data = json.loads(path.read_text(encoding="utf-8"))
if data.get("mode") != "ai":
    print("[Telegram] 尚無繁中 AI 摘要，略過推播。")
    sys.exit(0)

lines = [f"🌐 {data['date_taipei']} 國際重大新聞", ""]
for i, item in enumerate(data["articles"][:8], 1):
    lines.append(f"{i}. {item['title']}")
lines.extend(["", "新聞刊登時間與事件發生日期可能不同；請以原文來源為準。"])
repo = os.getenv("GITHUB_REPOSITORY", "")
if "/" in repo:
    owner, name = repo.split("/", 1)
    lines.append(f"完整摘要：https://{owner}.github.io/{name}/")
message = "\n".join(lines)[:4000]
response = requests.post(
    f"https://api.telegram.org/bot{TOKEN}/sendMessage",
    json={"chat_id": CHAT_ID, "text": message, "disable_web_page_preview": True},
    timeout=25,
)
response.raise_for_status()
if not response.json().get("ok"):
    raise RuntimeError(f"Telegram 推播回應失敗：{response.text[:300]}")
print("[Telegram] 今日早報已推送。")
