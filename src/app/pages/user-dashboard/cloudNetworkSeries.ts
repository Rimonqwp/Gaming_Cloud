type TrafficPoint = { hour: number; inbound: number; outbound: number };
type TrafficServer = { id: string; running: boolean; cores: number };

// Split demo traffic into server series; the aggregate always sums those series.
export function buildServerTraffic(points: TrafficPoint[], servers: TrafficServer[]) {
  const result: Record<string, TrafficPoint[]> = Object.fromEntries(servers.map(server => [server.id, []]));
  const all = points.map((point, index) => {
    const weights = servers.map((server, serverIndex) => server.running ? server.cores * (1 + .2 * Math.sin(index * .7 + serverIndex)) : 0);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let inbound = 0;
    let outbound = 0;
    servers.forEach((server, serverIndex) => {
      const share = totalWeight ? weights[serverIndex] / totalWeight : 0;
      const traffic = { hour: point.hour, inbound: point.inbound * share, outbound: point.outbound * share };
      result[server.id].push(traffic);
      inbound += traffic.inbound;
      outbound += traffic.outbound;
    });
    return { hour: point.hour, inbound, outbound };
  });
  return { ...result, all };
}
