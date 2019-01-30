---
layout: chapter
---

<section markdown="1">
<h2 class="section-header" id="hcx-manager-installation">HCX Manager Installation</h2>

The installation of the on-premises HCX Manager is summarized below. It is a required component.


#### Installation Procedure

##### Step 1
Deploy the ova to the on-premises vCenter. Note that you must use a Datastore for the appliance and not a Datastore Cluster. Also note that the "prefix length" used for the management IP is expected to be in CIDR format (i.e. 24 for a /24 network). Be sure to specify an NTP server since it is critical that HCX appliances maintain accurate time. Keep note of the passwords provided during installation. These will be used for logging into the appliance later on.

##### Step 2
Connect to the web UI of the on-premises HCX appliance. Use the IP address provided to the manager during installation and connect via https (it should redirect to 9443). Log in as "admin" using the password provided during installation. Note that it may take 5-10 minutes to come up after the initial installation.

##### Step 3
Provide the activation key acquired from the cloud-side HCX Manager.

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/manager-install/step03.png' | relative_url }}">
  <figcaption>Step 3</figcaption>
</figure>

##### Step 4
Configure HCX manager with the location of the on-premises network by entering a city name. Finish up by specifying the system name for the manager. Select "YES, CONTINUE" to continue with the setup.

##### Step 5
Enter the admin credentials of the local vCenter. You may optionally provide credentials for your NSX manager, if applicable. Be sure to specify the FQDN for both. Following this, you will be asked to specify your SSO/PSC source. Restart the appliance when finished.

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/manager-install/step05.png' | relative_url }}">
  <figcaption>Step 5</figcaption>
</figure>

##### Step 6
HCX will install UI components within vCenter. In order to see these, you must ensure that role mapping has been completed. Configure this from the on-premises HCX Manager.

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/manager-install/step06.png' | relative_url }}">
  <figcaption>Step 6</figcaption>
</figure>

##### Step 7
From the HCX Manager, navigate to Administration -> Certificate-> Trust CA Certificate. Click on "import" and select "URL". Import the certificate for the SDDC HCX Manager by entering its URL (https://fqdn.of.hcx.manager).

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/manager-install/step07.png' | relative_url }}">
  <figcaption>Step 7</figcaption>
</figure>

##### Step 8
If logged into vCenter, then log out. After logging back into vCenter, you will find that HCX has installed components within the vCenter UI. You may be prompted to reload the browser before the plugin will load.

##### Step 9
From the "home" menu on the top navigation of vCenter, open HCX.

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/manager-install/step09.png' | relative_url }}">
  <figcaption>Step 9</figcaption>
</figure>

##### Step 10
Click on the New Site Pairing link on the dashboard, then Register new connection.

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/manager-install/step10.png' | relative_url }}">
  <figcaption>Step 10</figcaption>
</figure>

##### Step 11
Enter the FQDN of the SDDC HCX Manager and the cloudadmin@vmc.local account and password from the SDDC. Do not install any additional services at this time.

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/manager-install/step11.png' | relative_url }}">
  <figcaption>Step 11</figcaption>
</figure>

##### Step 12
Registration may take a few moments. You may hit the refresh button periodically to check the status of the registration.

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/manager-install/step12.png' | relative_url }}">
  <figcaption>Step 12</figcaption>
</figure>

</section>


<section markdown="1">
<h2 class="section-header" id="interconnect-appliance-installation">Interconnect Appliance Installation</h2>

The WAN Interconnect Appliance enables workload replication between sites. It is a required component.


#### Installation Procedure
##### Step 1
From vCenter, navigate to the HCX dashboard. Click on Interconnect -> Install HCX Components. Choose the HCX Interconnect Service from the list of services and hit "next".

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/ix-install/step01.png' | relative_url }}">
  <figcaption>Step 1</figcaption>
</figure>

##### Step 2
Provide the storage and network properties for the appliance, as well as the passwords. Note that if your vMotion network is not accessible from the management network (e.g. a non-routable vMotion network), then you must configure the optional, 2nd network interface of the appliance and connect it directly to the vMotion network.

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/ix-install/step02.png' | relative_url }}">
  <figcaption>Step 2</figcaption>
</figure>

##### Step 3
Finish the install to deploy the appliance. Note that a matching appliance will be automatically installed within the SDDC. Once both are up and ready, then they will establish a tunnel between one another. If the tunnel fails to come up, then the most common culprit is a firewall blocking the connectivity.

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/ix-install/step03.png' | relative_url }}">
  <figcaption>Step 3</figcaption>
</figure>

</section>


<section markdown="1">
<h2 class="section-header" id="wan-optimization-appliance-installation">WAN Optimization Appliance Installation</h2>

The WAN Optimization Appliance installs as an optional companion component to the WAN Interconnect Appliance. Although it is optional, it is recommended.


### Installation Procedure
##### Step 1
From vCenter, navigate to the HCX dashboard. Click on Interconnect -> Install HCX Components. Choose the WAN Optimization Service from the list of services and hit "next".

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/ix-install/step01.png' | relative_url }}">
  <figcaption>Step 1</figcaption>
</figure>

##### Step 2
You may specify a bandwidth limit for replication as part of the appliance install. Hitting next will complete the installation and deploy a matching appliance in the SDDC.

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/wanopt-install/step02.png' | relative_url }}">
  <figcaption>Step 2</figcaption>
</figure>

</section>


<section markdown="1">
<h2 class="section-header" id="network-extension-appliance-installation">Network Extension Appliance Installation</h2>

The Network Extension appliance enables port-groups of a VDS to be extended to the SDDC. It is optional unless network extension is a requirement.


#### Installation Procedure

##### Step 1
From vCenter, navigate to the HCX dashboard. Click on Interconnect -> Install HCX Components. Choose the Network Extension Service from the list of services and hit "next".

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/ix-install/step01.png' | relative_url }}">
  <figcaption>Step 1</figcaption>
</figure>

##### Step 2
Provide the VDS which contains port-groups to be extended to the SDDC. Be sure to keep the uplink MTU at the default value of 1500. Provide the storage and network properties for the appliance, as well as the passwords.

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/l2c-install/step02.png' | relative_url }}">
  <figcaption>Step 2</figcaption>
</figure>

##### Step 3
Finish the install to deploy the appliance. Note that a matching appliance will be automatically installed within the SDDC. Once both are up and ready, then they will establish a tunnel between one another. If the tunnel fails to come up, then the most common culprit is a firewall blocking the connectivity.

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/l2c-install/step03.png' | relative_url }}">
  <figcaption>Step 3</figcaption>
</figure>

</section>

