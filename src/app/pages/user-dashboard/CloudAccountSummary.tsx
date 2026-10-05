import { useState } from "react";
import { ArrowDownUp, ChevronRight, Cpu, HardDrive, Layers3, MemoryStick, Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/dialog";
import {
  flexiblePool, poolInstances, poolResources, monthlyPurchases, monthlySpend, formatSummaryMoney,
} from "./cloudAccountSummaryData";
import "../../../styles/cloud-account-summary.css";

const poolResourceIcons = { cores: Cpu, ram: MemoryStick, storageGB: HardDrive, monthlyTrafficGB: ArrowDownUp };
const formatResourceAmount = (amount: number) => amount.toLocaleString("zh-CN");

export function CloudAccountSummary() {
  const [detail, setDetail] = useState<"purchases" | "allocation" | null>(null);
  const month = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai", year: "numeric", month: "long",
  }).format(new Date());

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
        <div className="dash-pool-heading-actions">
          <div className="dash-pool-legend" aria-label="服务器分配颜色图例">
            {poolInstances.map(server => <span key={server.id}><i style={{ backgroundColor: server.color }} aria-hidden="true" />{server.name}</span>)}
            <span><i className="dash-pool-available-dot" aria-hidden="true" />剩余额度</span>
          </div>
          <button className="dash-link" onClick={() => setDetail("allocation")}>分配明细 <ChevronRight size={14} /></button>
        </div>
      </div>
      <div className="dash-pool-overview">
        {poolResources.map(resource => {
          const Icon = poolResourceIcons[resource.key];
          const remaining = resource.total - resource.used;
          return <div className={`dash-pool-resource ${resource.key}`} key={resource.key}>
            <div className="dash-pool-resource-heading"><Icon size={16} aria-hidden="true" /><span>{resource.title}</span></div>
            <strong className="dash-pool-resource-value">{formatResourceAmount(resource.used)}<small> / {formatResourceAmount(resource.total)} {resource.unit}</small></strong>
            <div className="dash-pool-bar" role="progressbar" aria-label={`${resource.title}${resource.usedLabel}`} aria-valuemin={0} aria-valuemax={resource.total} aria-valuenow={resource.used} aria-valuetext={`${poolInstances.map(server => `${server.name} ${resource.usedLabel} ${server[resource.key]} ${resource.unit}`).join("，")}；${resource.remainingLabel} ${remaining} ${resource.unit}`}>
              {poolInstances.map(server => <span className="dash-pool-segment" key={server.id} aria-hidden="true" title={`${server.name}：${resource.usedLabel} ${formatResourceAmount(server[resource.key])} ${resource.unit}`} style={{ width: `${server[resource.key] / resource.total * 100}%`, backgroundColor: server.color }} />)}
              <span className="dash-pool-unallocated" aria-hidden="true" title={`${resource.remainingLabel}：${formatResourceAmount(remaining)} ${resource.unit}`} />
            </div>
            <p>{resource.usedLabel} {formatResourceAmount(resource.used)} {resource.unit}<span>{resource.remainingLabel} <b>{formatResourceAmount(remaining)} {resource.unit}</b></span></p>
          </div>;
        })}
      </div>
      <div className="dash-pool-caption"><span>{flexiblePool.name} · {poolInstances.length} 台服务器共享</span><span>流量每月 {flexiblePool.trafficResetDay} 日重置 · 演示数据</span></div>
    </section>

    <Dialog open={detail !== null} onOpenChange={open => { if (!open) setDetail(null); }}>
      <DialogContent className="cloud-modal dash-summary-dialog">
        <DialogTitle>{detail === "purchases" ? "本月套餐明细" : "随心配资源分配"}</DialogTitle>
        <DialogDescription>{detail === "purchases" ? `${month} · 演示消费记录，金额以美元（USD）计价。` : `CPU、内存和存储按配置分配，已停止的服务器仍保留额度；流量为 ${month} 实际消耗，每月 ${flexiblePool.trafficResetDay} 日重置。演示数据。`}</DialogDescription>
        {detail === "purchases" ? <>
          <ul className="dash-summary-details">{monthlyPurchases.map(purchase => <li key={purchase.id}><div><strong>{purchase.name}</strong><span>{purchase.specification}</span></div><b>{formatSummaryMoney(purchase.amount)}</b></li>)}</ul>
          <div className="dash-summary-detail-total"><span>本月消费合计</span><strong>{formatSummaryMoney(monthlySpend)}</strong></div>
        </> : <>
          <div className="dash-summary-resource-totals">{poolResources.map(resource => <div key={resource.key}><span>{resource.title} · 总额 {formatResourceAmount(resource.total)} {resource.unit}</span><strong>{resource.remainingLabel} {formatResourceAmount(resource.total - resource.used)} {resource.unit}</strong></div>)}</div>
          <ul className="dash-summary-details dash-pool-allocation-details">{poolInstances.map(server => <li key={server.id}>
            <div><strong><i style={{ backgroundColor: server.color }} aria-hidden="true" />{server.name}</strong><span>{server.region} · {server.running ? "运行中" : "已停止"}</span></div>
            <div className="dash-server-resource-details">{poolResources.map(resource => <span key={resource.key}>{resource.title}<b>{formatResourceAmount(server[resource.key])} {resource.unit}</b></span>)}</div>
          </li>)}</ul>
        </>}
      </DialogContent>
    </Dialog>
  </>;
}
