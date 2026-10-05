import { useState } from "react";
import { ChevronRight, Layers3, Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/dialog";
import {
  flexiblePool, poolInstances, poolAllocated, monthlyPurchases, monthlySpend, formatSummaryMoney,
} from "./cloudAccountSummaryData";
import "../../../styles/cloud-account-summary.css";

export function CloudAccountSummary() {
  const [detail, setDetail] = useState<"purchases" | "allocation" | null>(null);
  const month = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai", year: "numeric", month: "long",
  }).format(new Date());
  const available = { cores: flexiblePool.cores - poolAllocated.cores, ram: flexiblePool.ram - poolAllocated.ram };

  return <>
    <section className="dash-panel dash-monthly-spend" aria-label="本月费用概览">
      <div className="dash-spend-total">
        <span className="dash-summary-icon"><Wallet size={22} /></span>
        <div><h2>本月消费 <span className="dash-summary-demo">演示数据</span></h2><p>{month} · 美元（USD）</p></div>
        <strong>{formatSummaryMoney(monthlySpend)}</strong>
      </div>
      <div className="dash-purchased-plans"><span>已购套餐</span><p>{monthlyPurchases.map(purchase => purchase.name).join(" · ")}</p></div>
      <button className="dash-link" onClick={() => setDetail("purchases")}>套餐明细 <ChevronRight size={14} /></button>
    </section>

    <section className="dash-panel dash-flexible-pool" aria-label="随心配资源概览">
      <div className="dash-panel-heading">
        <div className="dash-pool-title"><Layers3 size={18} /><h2>随心配资源</h2><span>自由分配</span></div>
        <button className="dash-link" onClick={() => setDetail("allocation")}>分配明细 <ChevronRight size={14} /></button>
      </div>
      <div className="dash-pool-overview">
        <div className="dash-pool-capacity"><span>资源总额</span><strong>{flexiblePool.cores}<small>核</small><em>/</em>{flexiblePool.ram}<small>GB</small></strong><p>{flexiblePool.name} · 已分配至 {poolInstances.length} 台服务器</p></div>
        {([
          { key: "cores", title: "CPU", unit: "核" },
          { key: "ram", title: "内存", unit: "GB" },
        ] as const).map(resource => <div className={`dash-pool-resource ${resource.key}`} key={resource.key}>
          <div><span>{resource.title} 分配</span><strong>{poolAllocated[resource.key]} <small>/ {flexiblePool[resource.key]} {resource.unit}</small></strong></div>
          <progress value={poolAllocated[resource.key]} max={flexiblePool[resource.key]} aria-label={`${resource.title}已分配 ${poolAllocated[resource.key]} ${resource.unit}，总额 ${flexiblePool[resource.key]} ${resource.unit}`} />
          <p>已分配 {poolAllocated[resource.key]} {resource.unit}<span>可分配 <b>{available[resource.key]} {resource.unit}</b></span></p>
        </div>)}
      </div>
      <div className="dash-pool-servers"><span>分配给</span>{poolInstances.slice(0, 3).map(server => <span className="dash-pool-server" key={server.id}>{server.name}<b>{server.cores} 核 / {server.ram} GB</b></span>)}{poolInstances.length > 3 && <span>另 {poolInstances.length - 3} 台</span>}</div>
    </section>

    <Dialog open={detail !== null} onOpenChange={open => { if (!open) setDetail(null); }}>
      <DialogContent className="cloud-modal dash-summary-dialog">
        <DialogTitle>{detail === "purchases" ? "本月套餐明细" : "随心配资源分配"}</DialogTitle>
        <DialogDescription>{detail === "purchases" ? `${month} · 演示消费记录，金额以美元（USD）计价。` : "展示套餐额度的分配情况；已停止的服务器仍保留分配额度。演示数据。"}</DialogDescription>
        {detail === "purchases" ? <>
          <ul className="dash-summary-details">{monthlyPurchases.map(purchase => <li key={purchase.id}><div><strong>{purchase.name}</strong><span>{purchase.specification}</span></div><b>{formatSummaryMoney(purchase.amount)}</b></li>)}</ul>
          <div className="dash-summary-detail-total"><span>本月消费合计</span><strong>{formatSummaryMoney(monthlySpend)}</strong></div>
        </> : <>
          <div className="dash-summary-detail-total"><span>总资源 {flexiblePool.cores} 核 / {flexiblePool.ram} GB</span><strong>可分配 {available.cores} 核 / {available.ram} GB</strong></div>
          <ul className="dash-summary-details">{poolInstances.map(server => <li key={server.id}><div><strong>{server.name}</strong><span>{server.region} · {server.running ? "运行中" : "已停止"}</span></div><b>{server.cores} 核 / {server.ram} GB</b></li>)}</ul>
        </>}
      </DialogContent>
    </Dialog>
  </>;
}
