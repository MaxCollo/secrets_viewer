{{/*
Expand the name of the chart.
*/}}
{{- define "secrets-viewer.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "secrets-viewer.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "secrets-viewer.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "secrets-viewer.labels" -}}
helm.sh/chart: {{ include "secrets-viewer.chart" . }}
{{ include "secrets-viewer.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "secrets-viewer.selectorLabels" -}}
app.kubernetes.io/name: {{ include "secrets-viewer.fullname" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: secrets-viewer
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "secrets-viewer.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "secrets-viewer.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Image name with registry
*/}}
{{- define "secrets-viewer.image" -}}
{{- $registry := "" }}
{{- if .Values.global }}
{{- $registry = .Values.global.imageRegistry | default "" }}
{{- end }}
{{- $repository := .Values.image.repository }}
{{- $tag := .Values.image.tag | default .Chart.AppVersion }}
{{- if $registry }}
{{- printf "%s/%s:%s" $registry $repository $tag }}
{{- else }}
{{- printf "%s:%s" $repository $tag }}
{{- end }}
{{- end }}

{{/*
Image pull policy
*/}}
{{- define "secrets-viewer.imagePullPolicy" -}}
{{- $globalPolicy := "" }}
{{- if .Values.global }}
{{- $globalPolicy = .Values.global.imagePullPolicy | default "" }}
{{- end }}
{{- .Values.image.pullPolicy | default $globalPolicy | default "IfNotPresent" }}
{{- end }}

{{/*
Namespace
*/}}
{{- define "secrets-viewer.namespace" -}}
{{- if .Values.global }}
{{- .Values.global.namespace | default .Release.Namespace }}
{{- else }}
{{- .Release.Namespace }}
{{- end }}
{{- end }}
