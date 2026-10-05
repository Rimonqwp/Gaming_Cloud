from pathlib import Path

path = Path(__file__).resolve().parents[2] / 'src/app/pages/UserDashboardPage.tsx'
source = path.read_text(encoding='utf-8')
start = source.index('  const mergedToolbarAtTop')
render = source.index('            {renderActiveTabContent', start)
end = source.index('          </AnimatePresence>', render)
content = source[render:end]
source = source[:start] + '''  return (
    <div className="cloud-shell">
      <div className="cloud-container">
        <CloudConsoleHeader />
        <div className={activeTab === "overview" || activeTab === "instances" ? "" : "cloud-legacy"}>
''' + content + '''        </div>
      </div>
    </div>
  );
}
'''
source = source.replace('import { AnimatePresence, motion } from "motion/react";\n', '')
source = source.replace('import { instances, mockUser, teamMembers, ticketsData, usageData }', 'import { mockUser, teamMembers, ticketsData }')
source = source.replace('import { UserDashboardInstancesTab } from "./user-dashboard/UserDashboardInstancesTab";\n', '')
source = source.replace('import { UserDashboardOverviewTab } from "./user-dashboard/UserDashboardOverviewTab";\n', '')
path.write_text(source, encoding='utf-8')
