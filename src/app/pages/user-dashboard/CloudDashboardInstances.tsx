import { useState } from "react";
import { Link } from "react-router";
import { ChevronLeft, ChevronRight, RefreshCw, Search, Server, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import "../../../styles/cloud-instances.css";
import { consoleInstances } from "./cloudDashboardData";

const expiryFormatter = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Hong_Kong", year: "numeric", month: "2-digit", day: "2-digit" });
const PAGE_SIZE = 5;

export function CloudDashboardInstances() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [status, setStatus] = useState("all");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(1);

  const rows = consoleInstances.filter(
    (row) =>
      (region === "all" || row.region === region) &&
      (status === "all" || row.running === (status === "running")) &&
      `${row.name} ${row.game}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const detail = consoleInstances.find((row) => row.id === detailId);

  return (
    <section className="dash-panel dash-instances" aria-label="游戏服务器列表">
      <div className="dash-instances-heading">
        <div className="dash-instances-title"><span className="dash-instances-symbol"><Server size={20} /></span><div><h2>游戏服务器 <span className="dash-server-count">{consoleInstances.length} 台</span></h2><p>管理服务器，查看运行状态与资源使用情况</p></div></div>
        <div className="dash-table-actions">
          <button className="dash-refresh" aria-label="刷新游戏服务器" onClick={() => setNotice(`当前显示 ${rows.length} 台游戏服务器（演示数据）`)}><RefreshCw size={15} /></button>
          <Link className="dash-create" to="/deploy"><Plus size={15} />创建服务器</Link>
        </div>
      </div>
      <div className="dash-table-toolbar">
        <Select value={region} onValueChange={value => { setRegion(value); setPage(1); }}><SelectTrigger className="dash-instance-filter" aria-label="游戏服务器节点"><SelectValue /></SelectTrigger><SelectContent className="dash-period-menu"><SelectItem value="all" className="dash-period-option">全部节点</SelectItem>{Array.from(new Set(consoleInstances.map(row => row.region))).map(item => <SelectItem key={item} value={item} className="dash-period-option">{item}</SelectItem>)}</SelectContent></Select>
        <Select value={status} onValueChange={value => { setStatus(value); setPage(1); }}><SelectTrigger className="dash-instance-filter" aria-label="游戏服务器状态"><SelectValue /></SelectTrigger><SelectContent className="dash-period-menu"><SelectItem value="all" className="dash-period-option">全部状态</SelectItem><SelectItem value="running" className="dash-period-option">运行中</SelectItem><SelectItem value="stopped" className="dash-period-option">已停止</SelectItem></SelectContent></Select>
        <label className="dash-instance-search">
          <Search size={15} />
          <input
            aria-label="搜索游戏服务器"
            placeholder="搜索服务器或游戏名称"
            value={query}
            onChange={(event) => { setQuery(event.target.value); setPage(1); }}
          />
        </label>
        <div className="dash-instance-pagination">
          <span className="dash-filter-count" aria-live="polite">共 {rows.length} 台服务器</span>
          <nav aria-label="游戏服务器分页">
            <button type="button" aria-label="上一页服务器" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={13} />上一页</button>
            <span aria-live="polite">{currentPage} / {pageCount}</span>
            <button type="button" aria-label="下一页服务器" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}>下一页<ChevronRight size={13} /></button>
          </nav>
        </div>
      </div>

      {notice && <div className="dash-table-notice" role="status">{notice}</div>}

      <div className="dash-table-scroll">
        <table>
          <colgroup>{[24, 10, 16, 13, 13, 11, 13].map((width, index) => <col key={index} style={{ width: width + "%" }} />)}</colgroup>
          <thead>
            <tr>
              <th>服务器名称</th>
              <th>状态</th>
              <th>托管节点</th>
              <th>CPU</th>
              <th>内存</th>
              <th>在线玩家</th>
              <th>到期时间</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr key={row.id}>
                <td>
                  <button
                    className="dash-instance-name"
                    onClick={() => setDetailId(row.id)}
                  >
                    <span className="dash-server-avatar"><Server size={16} /></span><span className="dash-server-label"><strong>{row.name}</strong><small>{row.game}</small></span>
                  </button>
                </td>
                <td>
                  <span
                    className={`dash-instance-status ${row.running ? "running" : "stopped"}`}
                  >
                    <i />
                    {row.running ? "运行中" : "已停止"}
                  </span>
                </td>
                <td>{row.region}</td>
                {[{ value: row.cpu, key: "CPU", className: "" }, { value: row.memory, key: "内存", className: "memory" }].map((metric) => (
                  <td key={metric.key}>
                    {row.running ? (
                      <div className="dash-table-usage">
                        <span>{metric.value}%</span>
                        <progress
                          aria-label={`${row.name} ${metric.key} 使用率`}
                          max="100"
                          value={metric.value}
                          className={metric.className}
                        />
                      </div>
                    ) : "-"}
                  </td>
                ))}
                <td>{row.players} / {row.slots} 人</td>
                <td><time dateTime={row.expiresAt} className={Date.parse(row.expiresAt) - Date.now() <= 7 * 86400000 ? "dash-expiry soon" : "dash-expiry"}>{expiryFormatter.format(new Date(row.expiresAt))}</time></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="dash-empty">
                  没有匹配的游戏服务器。
                  <button
                    className="dash-link"
                    onClick={() => {
                      setQuery("");
                      setRegion("all");
                      setStatus("all");
                      setPage(1);
                    }}
                  >
                    清除筛选
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog
        open={!!detail}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
      >
        <DialogContent className="cloud-modal">
          <DialogTitle>{detail?.name}</DialogTitle>
          <DialogDescription>游戏服务器详情与托管状态 · 演示数据</DialogDescription>
          {detail && (
            <dl className="cloud-instance-details">
              <div><dt>游戏</dt><dd>{detail.game}</dd></div>
              <div><dt>托管节点</dt><dd>{detail.region}</dd></div>
              <div><dt>连接地址</dt><dd>{detail.ip}:{detail.port}</dd></div>
              <div><dt>配置</dt><dd>{detail.cores} vCPU · {detail.ram} GB 内存</dd></div>
              <div><dt>状态</dt><dd>{detail.running ? "运行中" : "已停止"}</dd></div>
              <div><dt>在线玩家</dt><dd>{detail.players} / {detail.slots} 人</dd></div>
              <div><dt>游戏存档</dt><dd>{detail.saveGB} GB</dd></div>
              <div><dt>存档备份</dt><dd>{detail.backups} 份</dd></div>
              <div><dt>到期时间</dt><dd>{expiryFormatter.format(new Date(detail.expiresAt))}（香港时间）</dd></div>
              <div><dt>运行时长</dt><dd>{detail.uptime}</dd></div>
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
