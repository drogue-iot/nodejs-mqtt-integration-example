## Deploying to local Kubernetes cluster
This file contains instructions about how to deploy this example to a locally
running Kubernetes cluster. The was tested using minikube:

```console
$ minikube version
minikube version: v1.26.0
commit: f4b412861bb746be73053c9f6d2895f12cf78565
```

### Install the Ingress controller
```console
$ minikube addons enable ingress
    ▪ Using image k8s.gcr.io/ingress-nginx/controller:v1.2.1
    ▪ Using image k8s.gcr.io/ingress-nginx/kube-webhook-certgen:v1.1.1
    ▪ Using image k8s.gcr.io/ingress-nginx/kube-webhook-certgen:v1.1.1
🔎  Verifying ingress addon...
🌟  The 'ingress' addon is enabled
```

```console
$ kubectl get pods --namespace=ingress-nginx
NAME                                        READY   STATUS      RESTARTS   AGE
ingress-nginx-admission-create-zgqmq        0/1     Completed   0          65s
ingress-nginx-admission-patch-9fwrt         0/1     Completed   0          65s
ingress-nginx-controller-755dfbfc65-78lpf   1/1     Running     0          65s
```

### Deploy/apply the ConfigMap and Secret
```console
$ kubectl apply -f 010-configuration.template.yaml 
secret/credentials created
configmap/configuration created
```

### Deploy/apply the Deployment
```console
$ kubectl apply -f  020-deployment.yaml 
deployment.apps/nodejs-mqtt-integration-example created
```

Update the image to a different one, for example if you have made changes and
would like to try them out. This requires that you have built, tagged, and
published the image to some repository like Docker or Github packages:

```console
$ kubectl patch deployment nodejs-mqtt-integration-example --type='json' -p '[{"op":"replace","path":"/spec/template/spec/containers/0/image","value":"docker.io/dbevenius/nodejs-mqtt-example:latest"}]'
```

### Deploy/apply the Service
```console
$ kubectl apply -f  030-service.yaml 
service/nodejs-mqtt-integration-example created
```

Patch the service to use NodePort:
```
$ kubectl patch svc nodejs-mqtt-integration-example --type='json' -p '[{"op":"replace","path":"/spec/type","value":"NodePort"}]'
service/nodejs-mqtt-integration-example patched
```

Get the URL of the service:
```
$ minikube service nodejs-mqtt-integration-example --url=true
http://192.168.49.2:31752
```
Access the service:
```console
$ curl http://192.168.49.2:31752/health/live
live
```

And the UI can be accessed using http://192.168.49.2:31752.



