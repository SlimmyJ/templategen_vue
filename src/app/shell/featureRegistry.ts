import type { Component } from "vue";

import InstallationView from "../components/installation/InstallationView.vue";
import InspectionView from "../components/inspection/InspectionView.vue";
import CallLogView from "../components/calllog/CallLogView.vue";
import DesignerView from "../components/designer/DesignerView.vue";

/**
 * A top-level feature reachable from the nav bar. Adding a feature is a one-line
 * change here plus a self-contained View component that owns its own state — the
 * App shell stays untouched.
 */
export type FeatureModule = {
  key: string;
  label: string;
  component: Component;
};

export const features: FeatureModule[] = [
  { key: "installatie", label: "Installaties", component: InstallationView },
  { key: "inspection",  label: "Nazichten",    component: InspectionView },
  { key: "calllog",     label: "Call log",  component: CallLogView },
  { key: "designer",    label: "Designer",     component: DesignerView }
];

export const defaultFeatureKey = features[0]!.key;

export function findFeature(key: string): FeatureModule {
  return features.find((feature) => feature.key === key) ?? features[0]!;
}
