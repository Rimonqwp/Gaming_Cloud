import { useState } from "react";
import { Link } from "react-router";
import { RefreshCw, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../components/ui/dialog";
import { consoleInstances } from "./cloudDashboardData";

export function CloudDashboardInstances() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [status, setStatus] = useState("all");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const rows = consoleInstances.filter(
    (row) =>
      (region === "all" || row.region === region) &&
      (status === "all" || row.running === (status === "running")) &&
      `${row.name} ${row.game}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const detail = consoleInstances.find((row) => row.id === detailId);

  return (
    <section className="dash-panel dash-instances" aria-label="游戏服务器列表">
      <div className="dash-table-toolbar">
        <h2>游戏服务器</h2>
        <select
          aria-label="游戏服务器节点"
          value={region}
          onChange={(event) => setRegion(event.target.value)}
        >
          <option value="all">全部节点</option>
          {Array.from(new Set(consoleInstances.map((row) => row.region))).map(
            (item) => <option key={item}>{item}</option>,
          )}
        </select>
        <select
          aria-label="游戏服务器状态"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="all">全部状态</option>
          <option value="running">运行中</option>
          <option value="stopped">已停止</option>
        </select>
        <label className="dash-instance-search">
          <Search size={15} />
          <input
            aria-label="搜索游戏服务器"
            placeholder="搜索服务器或游戏名称"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="dash-table-actions">
          <button
            className="dash-refresh"
            aria-label="刷新游戏服务器"
            onClick={() => setNotice(`当前显示 ${rows.length} 台游戏服务器（演示数据）`)}
          >
            <RefreshCw size={15} />
          </button>
          <Link className="dash-create" to="/deploy">
            创建服务器
          </Link>
        </div>
      </div>

      {notice && <div className="dash-table-notice" role="status">{notice}</div>}

      <div className="dash-table-scroll">
        <table>
          <colgroup>
            <col style={{ width: "21%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "16%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>服务器名称</th>
              <th>状态</th>
              <th>托管节点</th>
              <th>CPU</th>
              <th>内存</th>
              <th>在线玩家</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <button
                    className="dash-instance-name"
                    onClick={() => setDetailId(row.id)}
                  >
                    {row.name}
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
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="dash-empty">
                  没有匹配的游戏服务器。
                  <button
                    className="dash-link"
                    onClick={() => {
                      setQuery("");
                      setRegion("all");
                      setStatus("all");
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
              <div><dt>运行时长</dt><dd>{detail.uptime}</dd></div>
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
