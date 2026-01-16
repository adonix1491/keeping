from flask import Flask, request, abort
from linebot import LineBotApi, WebhookHandler
from linebot.exceptions import InvalidSignatureError
from linebot.models import MessageEvent, TextMessage, TextSendMessage, FollowEvent, UnfollowEvent
import os

app = Flask(__name__)

# 請填入您的 Token 與 Secret
# 建議之後改用環境變數或設定檔讀取
LINE_CHANNEL_ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN'
LINE_CHANNEL_SECRET = 'YOUR_CHANNEL_SECRET'

line_bot_api = LineBotApi(LINE_CHANNEL_ACCESS_TOKEN)
handler = WebhookHandler(LINE_CHANNEL_SECRET)

@app.route("/callback", methods=['POST'])
def callback():
    # 取得 X-Line-Signature 標頭值
    signature = request.headers['X-Line-Signature']

    # 取得請求主體
    body = request.get_data(as_text=True)
    app.logger.info("Request body: " + body)

    # 處理 Webhook
    try:
        handler.handle(body, signature)
    except InvalidSignatureError:
        print("Invalid signature. Please check your channel access token/channel secret.")
        abort(400)

    return 'OK'

# 當用戶加入好友時觸發
@handler.add(FollowEvent)
def handle_follow(event):
    user_id = event.source.user_id
    print(f"新用戶加入！User ID: {user_id}")
    
    # 回覆歡迎訊息
    welcome_msg = f"歡迎使用候位通！\n您的 User ID 是：\n{user_id}\n\n(開發測試中：請暫存此 ID 以便手動測試推播)"
    line_bot_api.reply_message(
        event.reply_token,
        TextSendMessage(text=welcome_msg)
    )

# 當收到文字訊息時觸發 (可做指令綁定)
@handler.add(MessageEvent, message=TextMessage)
def handle_message(event):
    msg = event.message.text
    user_id = event.source.user_id
    
    if msg == "ID":
        line_bot_api.reply_message(
            event.reply_token,
            TextSendMessage(text=f"您的 User ID:\n{user_id}")
        )
    else:
        line_bot_api.reply_message(
            event.reply_token,
            TextSendMessage(text=f"收到: {msg}")
        )

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
