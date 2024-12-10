# Install Nxpod in Minikube

1. Setup Minikube
```
#!/bin/bash
minikube delete # optional: only necessary if you had one before; deletes old vm and all contents completely!
minikube config set disk-size 40G  # recommended, min. 40
minikube config set memory 6144    # recommended, min. 6144
minikube config set cpus 4         # recommended
minikube start --extra-config=apiserver.service-node-port-range=80-32767 --kubernetes-version=v1.10.0
```

2. Setup a local DNS server for local development
     1. For Linux:
     ```
    apt-get update
    apt-get install dnsmasq

    sudo vim /etc/NetworkManager/dnsmasq.d/nxpod.io-local

    address=/nxpod.io-local/<IP of minikube>
    address=/host.nxpod.io-local/<Your network interface IP>
    sudo service NetworkManager restart
    sudo service dnsmasq restart
     ```
     2. For OS X:
        1. `brew install dnsmasq`
        2. Add the following lines to the top of `/usr/local/etc/dnsmasq.conf` (for global installation) or `~/.homebrew/etc/dnsmasq.conf` (for installation in home directory):
           ```
           address=/nxpod.io-local/<IP of minikube>
           address=/host.nxpod.io-local/<Your network interface IP>
           ```
        To get the IP of minikube: `minikube ip`
        To get your interface's IP use `ifconfig`. It is usually the IP of the `en0` (inet).

        3. Restart the dns server `sudo brew services restart dnsmasq`
        4. In your Network preferences, under advanced of your wifi add a DNS server for `127.0.0.1`. (Make sure that you also have another DNS server there, otherwise add `8.8.8.8`.)

3. Install Helm

Follow Helm's [installation instructions](https://docs.helm.sh/using_helm/#installing-the-helm-client) and then run:
```
helm init
```

4. Install Nxpod

Run
```
helm repo add nxpod https://charts.nxpod.io
helm repo update
```

Check if the chart is there:
```
$ helm search nxpod
NAME              	CHART VERSION	APP VERSION	DESCRIPTION
nxpod/nxpod	0.1.0        	0.1.5      	The core chart for Nxpod
```

Create file `values.minikube.yaml` with the following contents:
```
global:
  nxpod:
    hostname: nxpod.io-local
    localhostUrl: http://host.nxpod.io-local
    certificates: {}
```

Now run:
```
helm install nxpod/nxpod -f values.minikube.yaml
```

Open the browser via:
```
minikube service proxy
```

:-D