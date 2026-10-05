import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function SettingsPanel({ title, description, icon: Icon, action, children }: {
  title: string;
  description?: string;
  icon: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
}) {
  return <section className="ec-settings-panel" aria-label={title}>
    <header className="ec-panel-heading">
      <div className="ec-panel-title"><Icon size={23} strokeWidth={1.8} aria-hidden /><div><h2>{title}</h2>{description && <p>{description}</p>}</div></div>
      {action}
    </header>
    {children}
  </section>;
}
