export interface SecretEntry {
  name: string
  value: string
  source: 'secret' | 'configmap' | 'env'
}

export interface PodInfo {
  hostname: string
  namespace: string
  podName: string
  nodeName: string
  startTime: string
}

export interface HealthStatus {
  status: string
  version: string
}
