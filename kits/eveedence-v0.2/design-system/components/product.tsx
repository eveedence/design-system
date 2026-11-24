"use client";

import { ArrowRight, Download } from "lucide-react";
import { Button, EvidenceStateBadge, MetadataList, SearchField, Tag, type EvidenceDimension, type EvidenceState } from "./base";

export function EvidenceRow({ id, type, title, source, capturedAt, dimension, state, stateLabel, href }: {
  id: string; type: string; title: string; source: string; capturedAt: string;
  dimension: EvidenceDimension; state: EvidenceState; stateLabel: string; href?: string;
}) {
  const destination = href?.trim();
  return <article className="ev-evidence-row">
    <div className="ev-evidence-row__main">
      <div className="ev-evidence-row__title"><Tag>{type}</Tag><strong>{title}</strong></div>
      <MetadataList items={[{ label: "ID", value: id, mono: true }, { label: "Origem", value: source }, { label: "Capturado", value: capturedAt, mono: true }]} />
    </div>
    <div className="ev-evidence-row__status"><EvidenceStateBadge dimension={dimension} state={state} label={stateLabel} />{destination && destination !== "#" ? <a className="ev-row-action" href={destination}>Abrir <ArrowRight size={14} aria-hidden="true" /></a> : null}</div>
  </article>;
}

export function SidebarNav({ label = "Evidence Explorer", items }: { label?: string; items: ReadonlyArray<{ label: string; href: string; count?: number; active?: boolean }> }) {
  return <nav className="ev-sidebar-nav" aria-label={label}><p className="ev-eyebrow">{label}</p><ul>{items.map(item => <li key={item.label}><a href={item.href} aria-current={item.active ? "page" : undefined} className={item.active ? "is-active" : undefined}><span>{item.label}</span>{typeof item.count === "number" ? <span className="ev-sidebar-nav__count">{item.count}</span> : null}</a></li>)}</ul></nav>;
}

export function ComponentExamples() {
  const sidebarItems = [
    { label: "Evidence Explorer", href: "#componentes", count: 24, active: true },
    { label: "Casos", href: "#componentes", count: 8 },
    { label: "Gaps", href: "#componentes", count: 3 },
  ] as const;
  return <>
    <div className="ev-example"><p className="ev-eyebrow">Botões · alvo mínimo de 44 px</p><div className="ev-demo-row"><Button><Download size={17} aria-hidden="true" />Exportar consulta</Button><Button variant="brand">Ação de marca</Button><Button variant="secondary">Limpar</Button><Button disabled>Desativado</Button></div></div>
    <div className="ev-example"><p className="ev-eyebrow">Estados · dimensão explícita</p><div className="ev-demo-row"><EvidenceStateBadge dimension="integrity" state="verified" label="Verificada" /><EvidenceStateBadge dimension="attestation" state="unverified" label="Ainda não avaliada" /><EvidenceStateBadge dimension="assurance" state="insufficient" label="Informação insuficiente" /><EvidenceStateBadge dimension="capture" state="integrity" label="Problema detectado" /></div><p className="ev-caption">Integridade, attestation, assurance e captura não formam um único semáforo. Cada badge declara a dimensão avaliada.</p></div>
    <div className="ev-example"><SearchField /></div>
    <div className="ev-example"><p className="ev-eyebrow">Metadata primitives</p><MetadataList items={[{ label: "Evidence ID", value: "evd_8f3e2a7b", mono: true }, { label: "Capturado", value: "14 fev 2026 · 09:12 UTC", mono: true }, { label: "Origem", value: "Monitoramento" }]} /></div>
    <div className="ev-example"><p className="ev-eyebrow">EvidenceRow · destino ilustrativo</p><EvidenceRow id="evd_8f3e2a7b" type="observation" title="Alerta de acesso anômalo" source="Monitoramento" capturedAt="14 fev 2026 · 09:12 UTC" dimension="integrity" state="verified" stateLabel="Verificada" href="#evidence-row-example-details" /><p id="evidence-row-example-details" className="ev-caption" tabIndex={-1}>Detalhes do exemplo: alerta de monitoramento fictício, sem artefato real associado.</p><p className="ev-eyebrow">EvidenceRow · sem destino</p><EvidenceRow id="evd_demo_02" type="observation" title="Registro ilustrativo sem destino" source="Monitoramento" capturedAt="14 fev 2026 · 09:13 UTC" dimension="integrity" state="unverified" stateLabel="Ainda não avaliada" /></div>
    <div className="ev-example"><p className="ev-eyebrow">SidebarNav</p><div className="ev-sidebar-preview"><SidebarNav items={sidebarItems} /></div></div>
    <div className="ev-example ev-demo-row"><Tag>decision</Tag><Tag>observation</Tag><Tag>Controle</Tag><Tag>Exemplo ilustrativo</Tag></div>
  </>;
}
