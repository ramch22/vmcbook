---
layout: default
---


The WAN Extension appliance enables port-groups of a VDS to be extended to the SDDC. It is optional unless network extension is a requirement.


#### Installation Procedure

##### Step 1
From vCenter, navigate to the HCX dashboard. Click on Interconnect -> Install HCX Components. Choose the Network Extension Service from the list of services and hit "next".

<figure>
  <img src="./illustrations/ixInstall/step01.png">
  <figcaption>Step 1</figcaption>
</figure>

##### Step 2
Provide the VDS which contains port-groups to be extended to the SDDC. Be sure to keep the uplink MTU at the default value of 1500. Provide the storage and network properties for the appliance, as well as the passwords.

<figure>
  <img src="./illustrations/l2cInstall/step02.png">
  <figcaption>Step 2</figcaption>
</figure>

##### Step 3
Finish the install to deploy the appliance. Note that a matching appliance will be automatically installed within the SDDC. Once both are up and ready, then they will establish a tunnel between one another. If the tunnel fails to come up, then the most common culprit is a firewall blocking the connectivity.

<figure>
  <img src="./illustrations/l2cInstall/step03.png">
  <figcaption>Step 3</figcaption>
</figure>


