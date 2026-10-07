import { useEffect, useRef, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const trendTimeFormat = new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const trendHourMs = 3600000;
const maxTrendHours = 7 * 24;

export function MetricTrend({ points, color, label, unit, className, precision = 1 }: { points: number[]; color: string; label: string; unit: string; className: string; precision?: number }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [endTime] = useState(() => Math.floor(Date.now() / trendHourMs) * trendHourMs);
  const [rangeHours, setRangeHours] = useState(24);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    let wheelDelta = 0;
    const adjustRange = (event: WheelEvent) => {
      if (event.ctrlKey || event.deltaY === 0) return;
      event.preventDefault();
      event.stopPropagation();
      wheelDelta += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1);
      const steps = Math.trunc(wheelDelta / 100);
      if (!steps) return;
      wheelDelta -= steps * 100;
      setRangeHours(previous => Math.max(24, Math.min(maxTrendHours, previous + steps * 24)));
    };
    chart.addEventListener("wheel", adjustRange, { passive: false });
    return () => chart.removeEventListener("wheel", adjustRange);
  }, []);

  const history = Array.from({ length: maxTrendHours + 1 }, (_, index) => {
    const hoursAgo = maxTrendHours - index;
    const position = ((24 - hoursAgo % 24) % 24) / 24 * (points.length - 1);
    const left = Math.floor(position);
    const right = Math.min(left + 1, points.length - 1);
    const factor = 10 ** precision;
    const value = Math.round((points[left] + (points[right] - points[left]) * (position - left)) * factor) / factor;
    return { time: endTime - hoursAgo * trendHourMs, value: hoursAgo === 0 ? points[points.length - 1] : value };
  });
  const data = history.slice(-(rangeHours + 1));
  const rangeLabel = rangeHours === 24 ? "近 24 小时" : `近 ${rangeHours / 24} 天`;

  return <div ref={chartRef} className={className} title="滚动调整显示范围（24 小时至 7 天）" role="img" aria-label={`${label}${rangeLabel}演示趋势，滚轮调整范围，最多7天，时间为北京时间`}>
    <span className={`${className}-range`}>{rangeLabel}</span>
    <ResponsiveContainer width="100%" height="100%"><AreaChart data={data}>
      <XAxis dataKey="time" hide />
      <Tooltip allowEscapeViewBox={{ y: true }} isAnimationActive={false} labelFormatter={value => `时间：${trendTimeFormat.format(new Date(Number(value)))}`} formatter={(value: number) => [`${value} ${unit}`, label]} cursor={{ stroke: color, strokeOpacity: 0.3, strokeDasharray: "3 3" }} wrapperStyle={{ zIndex: 10 }} contentStyle={{ fontSize: 11, padding: "8px 10px", borderRadius: 8, borderColor: "#e0eaf7", boxShadow: "0 4px 16px #28375614" }} labelStyle={{ color: "#697793", marginBottom: 4 }} />
      <Area dataKey="value" type="linear" stroke={color} fill={color} fillOpacity={0.06} strokeWidth={1.5} activeDot={{ r: 3, stroke: "#fff", strokeWidth: 1.5 }} isAnimationActive={false} />
    </AreaChart></ResponsiveContainer>
  </div>;
}
