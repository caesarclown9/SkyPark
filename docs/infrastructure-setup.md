# Sky Park Infrastructure Setup

## 1. Architecture Overview

### 1.1 Deployment Strategy
- **Primary**: K3s cluster for orchestration
- **Database**: PostgreSQL with streaming replication
- **Cache**: Redis for session and application cache
- **Message Queue**: RabbitMQ for background jobs
- **Storage**: MinIO for S3-compatible object storage
- **Monitoring**: Prometheus + Grafana + Loki stack

### 1.2 Environment Structure
```
Production Environment
├── Load Balancer (Nginx/Traefik)
├── K3s Cluster (3 nodes minimum)
│   ├── Master Node (API server, etcd)
│   ├── Worker Node 1 (Apps)
│   └── Worker Node 2 (Databases)
├── External Services
│   ├── SMS Gateway
│   ├── Payment Providers
│   └── CDN (Cloudflare/AWS)
└── Monitoring Stack
```

## 2. Hardware Requirements

### 2.1 Minimum Production Setup
```yaml
Master Node:
  CPU: 4 cores
  RAM: 8GB
  Storage: 100GB SSD
  Network: 1Gbps

Worker Nodes (2x):
  CPU: 8 cores
  RAM: 16GB
  Storage: 200GB SSD
  Network: 1Gbps

Database Node:
  CPU: 8 cores
  RAM: 32GB
  Storage: 1TB SSD (with backup storage)
  Network: 1Gbps
```

### 2.2 Scaling Considerations
- **API pods**: 3-10 replicas based on load
- **Web pods**: 2-5 replicas
- **Database**: Master-slave setup with read replicas
- **Cache**: Redis cluster for high availability

## 3. K3s Cluster Setup

### 3.1 Installation Script
```bash
#!/bin/bash
# install-k3s.sh

# Master node setup
curl -sfL https://get.k3s.io | sh -s - server \
  --cluster-init \
  --disable traefik \
  --disable servicelb \
  --write-kubeconfig-mode 644

# Get node token
sudo cat /var/lib/rancher/k3s/server/node-token

# Worker nodes setup (run on each worker)
curl -sfL https://get.k3s.io | K3S_URL=https://${MASTER_IP}:6443 \
  K3S_TOKEN=${NODE_TOKEN} sh -
```

### 3.2 Base Namespace Setup
```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: skypark
  labels:
    name: skypark
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: skypark-config
  namespace: skypark
data:
  DATABASE_HOST: postgresql-service
  REDIS_HOST: redis-service
  RABBITMQ_HOST: rabbitmq-service
  LOG_LEVEL: info
  PORT: "8080"
---
apiVersion: v1
kind: Secret
metadata:
  name: skypark-secrets
  namespace: skypark
type: Opaque
stringData:
  DATABASE_URL: postgresql://skypark:password@postgresql-service:5432/skypark
  JWT_SECRET: your-jwt-secret-here
  REDIS_PASSWORD: your-redis-password
  RABBITMQ_PASSWORD: your-rabbitmq-password
```

## 4. Database Setup

### 4.1 PostgreSQL StatefulSet
```yaml
# postgresql.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgresql
  namespace: skypark
spec:
  serviceName: postgresql-service
  replicas: 1
  selector:
    matchLabels:
      app: postgresql
  template:
    metadata:
      labels:
        app: postgresql
    spec:
      containers:
      - name: postgresql
        image: postgres:15.5
        env:
        - name: POSTGRES_DB
          value: skypark
        - name: POSTGRES_USER
          value: skypark
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: skypark-secrets
              key: DATABASE_PASSWORD
        - name: PGDATA
          value: /var/lib/postgresql/data/pgdata
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgresql-storage
          mountPath: /var/lib/postgresql/data
        - name: postgresql-config
          mountPath: /etc/postgresql/postgresql.conf
          subPath: postgresql.conf
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
      volumes:
      - name: postgresql-config
        configMap:
          name: postgresql-config
  volumeClaimTemplates:
  - metadata:
      name: postgresql-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 100Gi
      storageClassName: local-path
---
apiVersion: v1
kind: Service
metadata:
  name: postgresql-service
  namespace: skypark
spec:
  selector:
    app: postgresql
  ports:
  - port: 5432
    targetPort: 5432
  type: ClusterIP
```

### 4.2 Database Migration Job
```yaml
# migration-job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration
  namespace: skypark
spec:
  template:
    spec:
      containers:
      - name: migration
        image: skypark/api:latest
        command: ["/app/migrate"]
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: skypark-secrets
              key: DATABASE_URL
      restartPolicy: OnFailure
  backoffLimit: 3
```

## 5. Application Deployment

### 5.1 API Deployment
```yaml
# api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: skypark-api
  namespace: skypark
spec:
  replicas: 3
  selector:
    matchLabels:
      app: skypark-api
  template:
    metadata:
      labels:
        app: skypark-api
    spec:
      containers:
      - name: api
        image: skypark/api:latest
        ports:
        - containerPort: 8080
        env:
        - name: PORT
          value: "8080"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: skypark-secrets
              key: DATABASE_URL
        - name: REDIS_URL
          value: redis://redis-service:6379
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: skypark-secrets
              key: JWT_SECRET
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: skypark-api-service
  namespace: skypark
spec:
  selector:
    app: skypark-api
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP
```

### 5.2 Web App Deployment
```yaml
# web-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: skypark-web
  namespace: skypark
spec:
  replicas: 2
  selector:
    matchLabels:
      app: skypark-web
  template:
    metadata:
      labels:
        app: skypark-web
    spec:
      containers:
      - name: web
        image: skypark/web:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: https://api.skypark.kg
        - name: NODE_ENV
          value: production
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: skypark-web-service
  namespace: skypark
spec:
  selector:
    app: skypark-web
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

## 6. Ingress and TLS

### 6.1 Traefik Installation
```bash
# Install Traefik
helm repo add traefik https://helm.traefik.io/traefik
helm repo update
helm install traefik traefik/traefik \
  --namespace traefik-system \
  --create-namespace \
  --set ports.web.redirectTo=websecure \
  --set certificatesResolvers.letsencrypt.acme.email=admin@skypark.kg \
  --set certificatesResolvers.letsencrypt.acme.storage=/data/acme.json \
  --set certificatesResolvers.letsencrypt.acme.httpChallenge.entryPoint=web
```

### 6.2 Ingress Configuration
```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: skypark-ingress
  namespace: skypark
  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: websecure
    traefik.ingress.kubernetes.io/router.tls.certresolver: letsencrypt
    traefik.ingress.kubernetes.io/router.middlewares: skypark-ratelimit@kubernetescrd
spec:
  tls:
  - hosts:
    - skypark.kg
    - api.skypark.kg
    secretName: skypark-tls
  rules:
  - host: skypark.kg
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: skypark-web-service
            port:
              number: 80
  - host: api.skypark.kg
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: skypark-api-service
            port:
              number: 80
```

## 7. Monitoring Setup

### 7.1 Prometheus Stack
```bash
# Install Prometheus Operator
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set prometheus.prometheusSpec.retention=30d \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=50Gi \
  --set grafana.adminPassword=admin123
```

### 7.2 Application Metrics
```yaml
# servicemonitor.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: skypark-api-metrics
  namespace: skypark
spec:
  selector:
    matchLabels:
      app: skypark-api
  endpoints:
  - port: http
    path: /metrics
    interval: 30s
```

## 8. Backup Strategy

### 8.1 Database Backup CronJob
```yaml
# backup-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup
  namespace: skypark
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: postgres-backup
            image: postgres:15.5
            command:
            - /bin/bash
            - -c
            - |
              pg_dump $DATABASE_URL | gzip > /backup/skypark-$(date +%Y%m%d).sql.gz
              # Upload to S3 or external storage
              aws s3 cp /backup/skypark-$(date +%Y%m%d).sql.gz s3://skypark-backups/
            env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: skypark-secrets
                  key: DATABASE_URL
            volumeMounts:
            - name: backup-storage
              mountPath: /backup
          volumes:
          - name: backup-storage
            persistentVolumeClaim:
              claimName: backup-pvc
          restartPolicy: OnFailure
```

## 9. Security Hardening

### 9.1 Network Policies
```yaml
# network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: skypark-network-policy
  namespace: skypark
spec:
  podSelector:
    matchLabels:
      app: skypark-api
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: traefik-system
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgresql
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
```

### 9.2 Pod Security Policy
```yaml
# pod-security-policy.yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: skypark-psp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
```

## 10. Deployment Scripts

### 10.1 Complete Deployment Script
```bash
#!/bin/bash
# deploy.sh

set -e

# Variables
NAMESPACE="skypark"
REGISTRY="registry.skypark.kg"
TAG=${1:-latest}

echo "Deploying Sky Park to Kubernetes..."

# Create namespace if not exists
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Apply configurations
kubectl apply -f infrastructure/k3s/base/

# Deploy databases
kubectl apply -f infrastructure/k3s/databases/

# Wait for databases to be ready
echo "Waiting for databases..."
kubectl wait --for=condition=ready pod -l app=postgresql -n $NAMESPACE --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=300s

# Run database migrations
kubectl apply -f infrastructure/k3s/migrations/
kubectl wait --for=condition=complete job/db-migration -n $NAMESPACE --timeout=300s

# Deploy applications
kubectl apply -f infrastructure/k3s/apps/

# Wait for applications to be ready
echo "Waiting for applications..."
kubectl wait --for=condition=ready pod -l app=skypark-api -n $NAMESPACE --timeout=300s
kubectl wait --for=condition=ready pod -l app=skypark-web -n $NAMESPACE --timeout=300s

# Apply ingress
kubectl apply -f infrastructure/k3s/ingress/

echo "Deployment completed successfully!"
echo "API: https://api.skypark.kg"
echo "Web: https://skypark.kg"

# Show status
kubectl get pods -n $NAMESPACE
```

### 10.2 Health Check Script
```bash
#!/bin/bash
# health-check.sh

NAMESPACE="skypark"

echo "Checking Sky Park health..."

# Check pods
echo "Pod Status:"
kubectl get pods -n $NAMESPACE

# Check services
echo "Service Status:"
kubectl get services -n $NAMESPACE

# Check ingress
echo "Ingress Status:"
kubectl get ingress -n $NAMESPACE

# Test API health
echo "API Health Check:"
curl -f https://api.skypark.kg/health || echo "API health check failed"

# Test Web app
echo "Web App Check:"
curl -f https://skypark.kg || echo "Web app check failed"
```

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Owner**: DevOps Team 
 