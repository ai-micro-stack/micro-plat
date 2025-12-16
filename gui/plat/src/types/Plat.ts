import React from "react";
import type { HostType, ClusterType } from "@/types/Tent";
import type { moduleType } from "@/types/Addon";
import { defaultRoles } from "@/types/Addon";

export type NodeType = HostType & {
  compute_node?: boolean;
  compute_role?: number;
  storage_node?: boolean;
  storage_role?: number;
  balancer_node?: boolean;
  balancer_role: number;
};

export type ClusterTuple = ClusterType & {
  cluster_nodes: number;
  compute_cluster: string;
  compute_nodes: number;
  storage_cluster: string;
  storage_nodes: number;
  cluster_status: string;
  nodeRef: React.ReactNode;
  plat_core_cluster?: boolean;
};

export type PlatType = {
  readonly id: number;
  plat_name: string;
  plat_note: string;
  plat_type: number;
  plat_vip: string;
  is_active: boolean;
  is_locked?: boolean;
  build_auto_lock?: boolean;
  core_service_cluster?: ClusterTuple | null;
  core_gateway_service?: string;
  core_auth_ima_service?: string;
  embedding_model_server: string;
  embedding_model_store: string;
  llm_model_server: string;
  llm_model_store: string;
  vectordb_data_server: string;
  vectordb_data_store: string;

  readonly createdAt: Date;
  Clusters: ClusterTuple[];
};

export const defaultPlat: PlatType = {
  id: 0,
  plat_name: "-- all free clusters --",
  plat_note: "_@_",
  plat_type: 0,
  plat_vip: "",
  core_service_cluster: null,
  core_gateway_service: "",
  core_auth_ima_service: "",
  embedding_model_server: "",
  embedding_model_store: "",
  llm_model_server: "",
  llm_model_store: "",
  vectordb_data_server: "",
  vectordb_data_store: "",
  is_active: true,
  is_locked: true,
  build_auto_lock: true,
  createdAt: new Date(),
  Clusters: [],
};

export const emptyPlat: PlatType = {
  id: 0,
  plat_name: "",
  plat_note: "",
  plat_type: 0,
  plat_vip: "",
  is_active: true,
  is_locked: false,
  build_auto_lock: true,
  core_service_cluster: null,
  core_gateway_service: "0",
  core_auth_ima_service: "0",
  embedding_model_server: "(None)",
  embedding_model_store: "",
  llm_model_server: "(None)",
  llm_model_store: "",
  vectordb_data_server: "(None)",
  vectordb_data_store: "",
  createdAt: new Date(),
  Clusters: [],
};

export type platModuleAreas = {
  embeddingModules: moduleType[];
  vectordbModules: moduleType[];
  llmModules: moduleType[];
};

export const platEmptyAreas: platModuleAreas = {
  embeddingModules: [
    { moduleName: "(None)", moduleRoles: defaultRoles, moduleStatus: 0 },
  ],
  vectordbModules: [
    { moduleName: "(None)", moduleRoles: defaultRoles, moduleStatus: 0 },
  ],
  llmModules: [
    { moduleName: "(None)", moduleRoles: defaultRoles, moduleStatus: 0 },
  ],
};

export const platTypes = [
  { key: 0, plat_type_name: "-- select a type --" },
  { key: 1, plat_type_name: "Type-I: Text" },
  { key: 2, plat_type_name: "Type-II: Voice" },
  { key: 3, plat_type_name: "Type-III: Picture" },
];

export const coreGateways = [
  { key: 0, gateway_name: "-- select gateway type --" },
  { key: 1, gateway_name: "Trafik" },
  { key: 2, gateway_name: "Caddy" },
  { key: 3, gateway_name: "Nginx" },
];

export const coreIMAs = [
  { key: 0, ima_name: "-- select ima type --" },
  { key: 1, ima_name: "Keycloak" },
  { key: 2, ima_name: "Authentik" },
  { key: 3, ima_name: "Authelia" },
];
