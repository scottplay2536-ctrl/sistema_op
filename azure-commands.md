# Guia paso a paso para desplegar en Azure

> Cambia los nombres si ya existen en tu suscripcion. Los nombres de ACR deben ser unicos globalmente y solo pueden usar letras y numeros.

## 1. Variables base

```bash
RESOURCE_GROUP=rg-sistema-op
LOCATION=eastus
ACR_NAME=acrsistemaop2536
AKS_NAME=aks-sistema-op
APP_NAME=devops-azure-app
NAMESPACE=devops-demo
```

## 2. Iniciar sesion en Azure

```bash
az login
az account show
```

## 3. Crear Resource Group

```bash
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION
```

## 4. Crear Azure Container Registry

```bash
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic
```

Obtener el login server:

```bash
az acr show \
  --name $ACR_NAME \
  --query loginServer \
  --output tsv
```

## 5. Crear cluster AKS conectado al ACR

```bash
az aks create \
  --resource-group $RESOURCE_GROUP \
  --name $AKS_NAME \
  --node-count 2 \
  --enable-addons monitoring \
  --generate-ssh-keys \
  --attach-acr $ACR_NAME
```

Este comando tambien activa monitoreo con Azure Monitor / Container Insights.

## 6. Obtener credenciales de AKS

```bash
az aks get-credentials \
  --resource-group $RESOURCE_GROUP \
  --name $AKS_NAME \
  --overwrite-existing
```

Validar nodos:

```bash
kubectl get nodes
```

## 7. Probar despliegue manual inicial

Iniciar sesion en ACR:

```bash
az acr login --name $ACR_NAME
```

Construir y publicar imagen:

```bash
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer --output tsv)
docker build -t $ACR_LOGIN_SERVER/$APP_NAME:latest .
docker push $ACR_LOGIN_SERVER/$APP_NAME:latest
```

Actualizar el manifiesto:

```bash
sed -i "s|REPLACE_ACR_LOGIN_SERVER|$ACR_LOGIN_SERVER|g" k8s/deployment.yaml
```

Aplicar Kubernetes:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

Verificar:

```bash
kubectl get pods -n $NAMESPACE
kubectl get svc -n $NAMESPACE
```

Cuando el servicio tenga `EXTERNAL-IP`, abre:

```text
http://EXTERNAL-IP
```

## 8. Crear credenciales para GitHub Actions

Obtén el ID de la suscripcion:

```bash
SUBSCRIPTION_ID=$(az account show --query id --output tsv)
```

Crea un Service Principal:

```bash
az ad sp create-for-rbac \
  --name sp-devops-demo-github \
  --role contributor \
  --scopes /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP \
  --sdk-auth
```

Copia el JSON que devuelve el comando. Ese valor se usara como secret en GitHub.

## 9. Configurar secrets en GitHub

En GitHub entra a:

```text
Settings > Secrets and variables > Actions > New repository secret
```

Crea estos secrets:

```text
AZURE_CREDENTIALS = JSON completo del Service Principal
AZURE_RESOURCE_GROUP = rg-sistema-op
AKS_CLUSTER_NAME = aks-sistema-op
ACR_NAME = acrsistemaop2536
ACR_LOGIN_SERVER = acrsistemaop2536.azurecr.io
```

## 10. Ejecutar pipeline

Haz commit y push a la rama `main`. GitHub Actions ejecutara:

1. Clonado del repositorio.
2. Instalacion de dependencias.
3. Pruebas basicas.
4. Construccion de imagen Docker.
5. Publicacion en Azure Container Registry.
6. Despliegue automatico en AKS.

## 11. Validar despliegue

```bash
kubectl rollout status deployment/devops-azure-app -n devops-demo
kubectl get pods -n devops-demo
kubectl get svc -n devops-demo
```

## 12. Monitoreo en Azure

En Azure Portal:

1. Abre el recurso de AKS.
2. Entra a `Insights`.
3. Revisa nodos, controladores, pods y contenedores.
4. Guarda capturas para la documentacion.

## 13. Limpieza de recursos

Cuando ya no necesites el ambiente:

```bash
az group delete --name $RESOURCE_GROUP --yes --no-wait
```
