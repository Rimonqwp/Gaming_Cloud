# 使用者重要事件 Log 設計文件

## 目標
- 將目前的資金與交易紀錄擴充為完整事件 Log
- 集中顯示使用者發生過的重要事件，而不只限於交易

## 事件範圍

### 資金事件 funding
- 充值成功 / 失敗 / 待處理
- 包月扣費
- 新購實例扣費
- 退款
- 邀請獎勵發放
- 管理員手動調整真實餘額
- 管理員手動調整推廣贈金
- 推廣贈金清零

### 帳號事件 account
- 封鎖 / 解封
- 狀態變更（active / suspended / banned）
- 會員等級變更
- 密碼重設（後續可加）
- 綁定與安全資訊更新（後續可加）

### 實例事件 instance
- 建立實例
- 停止實例
- 啟動實例
- 刪除實例
- 續費 / 扣月費
- 建置中 / 建置完成 / 建置失敗

### 邀請事件 referral
- 建立邀請關係
- 邀請成功轉化
- 邀請獎勵發放

### 系統事件 system
- 批次操作影響到該使用者
- 系統自動扣費
- 風控 / 審核結果

## 建議資料模型
- id：log 唯一識別碼
- userId：對應使用者
- timestamp：事件發生時間
- category：funding / account / instance / referral / system
- eventType：細分類型，例如 wallet.balance.adjusted
- title：事件標題
- description：事件說明
- amount：涉及金額時填入
- currency：幣別，第一階段可先固定 USD
- status：completed / pending / failed / info
- referenceId：交易單號、實例 ID 或其他關聯編號
- operator：system / admin / user
- method：支付方式或操作來源
- meta：保留擴充資訊

## 建議事件命名

### 資金
- transaction.deposit.completed
- transaction.deposit.failed
- transaction.payment.completed
- transaction.refund.completed
- wallet.balance.adjusted
- wallet.balance.set
- wallet.bonus.adjusted
- wallet.bonus.set
- wallet.bonus.zeroed
- referral.bonus.granted

### 帳號
- user.status.banned
- user.status.unbanned
- user.status.suspended
- user.rank.changed

### 實例
- instance.created
- instance.deleted
- instance.stopped
- instance.started
- instance.billing.renewed
- instance.provision.started
- instance.provision.completed
- instance.provision.failed

## 現有程式可對應的事件來源
- INITIAL_TRANSACTIONS
- commitWalletChangeApi
- applyBatchBalanceAdjust
- applyBatchBalanceSet
- applyBatchBonusDelta
- applyBatchBonusSet
- applyBatchBonusZero
- toggleUserStatus
- applyBatchUserStatus
- changeUserRank
- batchStopInstancesForUsers
- batchDeleteInstancesForUsers
- referrals

## 前端顯示建議
- 卡片標題改為：事件與交易紀錄 或 使用者事件 Log
- 欄位顯示：時間 / 類型 / 描述 / 金額 / 關聯編號 / 狀態
- 沒有金額的事件顯示 -
- 依 timestamp 倒序排列
- 不同 category 使用不同顏色與 icon

## 第一階段實作策略
- 先做前端聚合，不先重做後端
- 先把 transactions 轉成事件資料
- 各管理操作成功後 append 新事件
- 建議新增 userEventLogTypes.ts 與 userEventLogUtils.ts

## 第二階段
- 建立 user_event_logs 資料表
- 管理操作 API 成功後同步寫入事件
- 前端改為讀取 /api/admin/users/:id/events

## 結論
- 這個區塊應從單純交易列表升級為使用者的重要事件時間軸
- 建議順序：建立模型、轉換交易資料、補上各操作事件、再改 UI、最後再做後端持久化