---
layout: default
---



<h2 id="introduction">Introduction</h2>

This guide is intended to provide supplemental documentation to the [official HCX user guide]({{ site.data.links.vmw.hcx_doc }}) by summarizing the installation procedures and highlighting know caveats. This document will also discuss the process of planning, deploying, testing, documenting, and managing an HCX installation.


<h2 id="technical-overview">Technical Overview</h2>

At its core, [HCX]({{ site.data.links.vmw.hcx }}) provides the ability to transparently migrate workloads between vSphere environments. Although this function enables a number of different business cases, the primary cases which will be the focus of this document are:

* Data center evacuations and/or workload migrations
* Disaster recovery

This guide will focus on HCX as applied to [VMware Cloud]({{ site.data.links.vmw.cloud }}).



#### HCX Components
HCX requires that a number of appliance be installed both within the SDDC and within the on-premises environment. These appliances are always deployed in pairs, with 1 on the on-premises side and a twin within the SDDC. Appliances within the SDDC are installed automatically while on-premises appliances must be installed and configured manually.

HCX uses the following appliances:
* Manager - Required. This component provides management functionality to HCX. Within the SDDC, this component is installed automatically as soon as HCX is enabled. Once enabled, a download link will be provided for the on-premises HCX manager appliance. This appliance will be manually installed and will be used to deploy all other components and to drive the operations of HCX.

* WAN Interconnect Appliance - Required. This component facilitates workload replication and migration. The appliance will establish its own dedicated IPSec tunnels for communication to its peer within the SDDC.

* WAN Optimization Appliance - Optional. This component provides WAN optimization and data de-duplication for the WAN Interconnect Appliance. It communicates exclusively with the WAN Interconnect Appliance via private IP (uses addresses from IPv4 range reserved for carrier grade NAT).

* Network Extension (L2C) - Optional. This component provides [Layer-2](https://en.wikipedia.org/wiki/Data_link_layer) network extension for the purposes of "extending" networks between vSphere environments. It will establish its own dedicated IPSec tunnels for communication to its peer within the SDDC.

* Proxy Host - This is a fake ESXi host which is deployed silently by the WAN Interconnect appliance. This host is used to as the target for vmotion/migrations and is used to "trick" vCenter into thinking the migration target host is local. This host will be visible in the inventory of vCenter.



#### An Overview of Workload Migration
The process for workload migration is roughly as follows:
1. Activate the HCX service within the SDDC and deploy on-premises HCX components.
2. Determine a list of workloads to migrate and any networks which must be extended.
3. Develop and execute a test plan for the HCX implementation.
4. Develop a migration plan.
5. Extend networks to the cloud.
6. Begin migrations.
7. Once migrations have completed, perform a "network cutover" by removing network extensions, shutting down the original on-premises networks, and enabling reachability of migrated networks through the IPSec VPN or Direct Connect to the SDDC.

**Important Note** - Network extension, while very common, is completely optional. If your use case does not require workloads to retain their IP addresses post-migration, then there is no need to perform a network extension (or network cutover).

Let's walk through some of the details using the following diagram.

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/workloadMigration.png' | relative_url }}">
  <figcaption>Workload Migration</figcaption>
</figure>

In this example, HCX is being used to migrate application workloads and their associated networks to the SDDC. As indicated, the WAN Interconnect appliance (IX) is responsible for data replication between the on-premises environment and the SDDC. This replication traffic is carried over a dedicated IPSec tunnel which is initiated by the on-premises appliance and is optimized using the WAN Optimization appliance (not shown). The Network Extension appliance (L2C) is reponsible for creating a forwarding path for networks which have been extended to the SDDC. Again, this traffic is carried over a dedicated IPSec tunnel which is initiated by the on-premises appliance.

Within the SDDC exists a "Services" network which contains critical services such as DNS or Active Directory which are designed to serve the local environment. In general, it is a good idea to keep such services as close to the consumers (SDDC workloads in this case) as possible. Doing so will not only cut down on network traffic sent to the WAN, but will also reduce dependencies between sites.

We can see from the diagram that a migration is in progress. In this scenario, we are migrating all of the application servers located in the networks 10.1.8.0/24, 10.1.9.0/24, and 10.1.10.0/24. The network 10.1.8.0/24 has already been completely migrated and, as a result, the L2 extension has been disconnected and the on-premises version of the network has been shut down. This network is now accessible directly through the routing infrastructure of the SDDC. This process of making the SDDC the athority for a migrated network is often referred to as a "network cutover".

Workloads from within the networks 10.1.9.0/24 and 10.1.10.0/24 are still in the process of being migrated. As indicated, the L2C is attached to these networks such that it is providing a layer-2 network extension to the SDDC. Due to this network extension, the workloads which have already been migrated have been able to retain their network addresses and, from a routing perspective, appear to reside within the on-premises environment. These "extended" networks are not tied into the routing infrastructure of the SDDC. 

Extended networks present an interesting routing scenario. Due to the fact that they are not tied to the routing infrastructure of the SDDC, the only "way out" for the workloads is via the layer-2 network extension to the on-premises default-gateway. This means that all traffic which is "non-local" to the extended network must pass through the L2C and be routed through the on-premises gateway router. This includes not only communications to resources within the on-premises environment, but also to communications between other extended networks, as well as to networks which are native to the SDDC or to resources within the cross-linked VPC.

This process of forwarding traffic from SDDC -> on-premises -> SDDC between extended networks is referred to as "tromboning", and can result in unexpected WAN utilization and added latency. Since migrations tend to be a temporary activity, this tromboning effect is not typically a major concern. However, it is important to keep in mind when planning migrations such that it may be reduced as much as possible. For layer-2 extensions that are intended to exist in a more permanent fashion, HCX provides a feature by the name of Proximity Routing, which is designed to eliminate the tromboning effect. This feature is not currently supported in VMware Cloud deployments but is currently planned as a roadmap item.




#### An Overview of Disaster Recovery
HCX Disaster Recovery replicates and protects Virtual Machines to an SDDC, and provides flexible configuration of recovery point objectives (RPO) for workloads in intervals from 5 minutes to 24 hours. As an HCX feature, it can take advantage of WAN optimization and de-duplication for replication traffic and can utilize network extension as a means of recovering workloads without requiring IP address changes.

Consider the following illustration.

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/dr.png' | relative_url }}">
  <figcaption>Disaster Recovery</figcaption>
</figure>

In the above scenario, the application servers are being protected by Disaster Recovery using two separate methods. 

Servers in the subnet 10.1.8.0/24 are not required to keep their IP addresses upon recovery, so are being recovered to the 10.2.8.0/24 network which is native to the SDDC. In the event of a failure at the active site, these workloads will be recovered in the SDDC and DHCP will be used to re-assign their IP addresses.

Servers in the subnet 10.1.9.0/24 are operating under a different constraint, and cannot tolerate a change of IP addressing. In this situation, network extension is used to ensure that workloads recovered within the SDDC will not require an IP address change upon recovery.

As a general rule, it is a good practice to maintain a local version of critical services (such as DNS or active directory) which can serve workloads within the SDDC. In this case, servers in the 10.2.8.0/24 subnet would utilize local services in the event of a recovery to the SDDC.



<h2 id="prerequisites-and-requirements">Prerequisites and Requirements</h2>

This section covers requirements for activating HCX and installing the on-premises components.



#### DNS Resolution
The on-premises installation of HCX must be able to connect to central HCX services via their [FQDN](https://en.wikipedia.org/wiki/Fully_qualified_domain_name). Therefore, it is critical that any DNS servers used by HCX be able to resolve the following names:
* connect.hcx.vmware.com
* hybridity-depot.vmware.com

If these names are not resolvable by HCX, then the installation will fail.



#### Direct Connect Private VIF Requirements
HCX can be configured to ride atop Direct Connect Private VIF. In order to do so, it requires that an additional range of private IP addresses be allocated to the cloud-side appliances within the SDDC. This address range must be unique and something which will be reachable from the on-premises network. A small range, such as a /29, is sufficent for this. A common practice is to allocate this range from the larger block of address space allocated for the Compute Network of the SDDC.



#### On-Premises IP Address Requirements
The following appliances need an IP address for management:
* HCX Manager
* WAN Interconnect
* WAN Extension

It is a recommended practice to allocate these addresses from the vCenter management network.

**Important Note** - The WAN Interconnect requires connectivity to the vMotion interfaces of ESXi hosts on the on-premises network. If this network is non-routable or otherwise unreachable from the management network, then the appliance will require a second interface/IP directly attached to the vMotion network. This second interface/IP is optional otherwise.



#### vCenter and ESXi Versions
HCX requires certain minimal vCenter/ESXi versions per a give feature. These are as follows:

Feature                      | Versions
-----------------------------|---------
Bulk Migration               | vCenter 5.1+, ESXi 5.0+
vMotion                      | vCenter 5.5+, ESXi 5.0+
Cold Migration               | vCenter 5.5+, ESXi 5.0+
Replication Assisted vMotion | vCenter 5.5+, ESXi 5.5+
Network Extension            | vCenter 5.1+, ESXi 5.1+
Network Extension (NSX)      | vCenter 5.5+, ESXi 5.5+, NSX-v 6.1+
Disaster Recovery            | vCenter 5.1+, ESXi 5.0+



#### vSphere Distributed Switch
If nework extension is required, then you must deploy the WAN Extension appliance. This appliance currently only supports extension of port-groups back by a [vDS](https://www.vmware.com/products/vsphere/distributed-switch.html). In order to avoid creating layer-2 loops, you may only deploy a single appliance per vDS. Once deployed, the WAN Extension appliance will be able to extend any port-group on the vDS (and by definition, the underlying VLAN of that port-group).

**Important Note** - It is possible to have separate vCenter/vDS instances which are backed by the same underlying VLAN infrastructure. In this case, it would be possible to deploy a separate WAN Extension appliance to each. This scenario could create a layer-2 loop which can have a serious impact on your on-premise network. 



#### On-Premises Network Requirements
It is assumed that the on-premises environment has been deployed following VMware recommended practices. A key assumption is that dedicated networks are being used for management, vmotion, etc... HCX cannot extend the management network to the SDDC. If you have workloads which need to be migrated to the SDDC (and use network extension), and these networks reside within the management network, then they must be moved to a non-management network.

HCX needs at least 100Mbps of connectivity to the SDDC (through the internet or Direct Connect). While it is possible for it to run on less, performance will suffer.


#### Appliance LAN Interconnectivity
The on-premises HCX appliances require connectivity to one another on a number of ports. They also require connectivity to/from vCenter and ESXi. If your on-premises network is not restricting internal communications, then you may skip this section. Otherwise, please refer to the following table:

Source           | Destination      | Protocol/Port
-----------------|------------------|---------------
HCX Manager      | WAN Interconnect | TCP 443,8123,9443
HCX Manager      | WAN Extension    | TCP 443
HCX Manager      | vCenter          | TCP 443,7444,9443
HCX Manager      | ESXi management  | TCP 80,902
HCX Manager      | NSX-v Manager    | TCP 443 (only if NSX is present)
vCenter          | HCX Manager      | TCP 443
WAN Interconnect | vCenter          | UDP 902
WAN Interconnect | ESXi management  | TCP 80,902,8000
ESXi management  | WAN Interconnect | TCP 902,8000,31031,44046
users            | HCX Manager      | TCP 443,9443



#### Appliance WAN Connectivity
The HCX components in the on-premises environment must be able to communicate to both centeral HCX services as well as components in the SDDC. For connecting to HCX central services the Manager must be able to either:
* Communicate through a proxy, or
* NAT outbound to a public IP address. A dedicated public IP is **not** required.

For connecting to components in the SDDC, the on-premises appliances must be able to either:
* Communicate directly via Direct Connect Private VIF, or
* NAT outbound to a public IP address. Dedicated public IPs are **not** required.

In general, the on-premises appliances must be able to communicate outbound on TCP 443 and UDP 500/4500. If you must explicitly define outbound security policy per-appliance, then please refer to the following table:

Source           | Destination                 | Protocol/Port
-----------------|-----------------------------|---------------
HCX Manager      | central HCX services        | TCP 443
HCX Manager      | cloud-side HCX Manager      | TCP 443
WAN Interconnect | cloud-side WAN Interconnect | UDP 500,4500
WAN Extension    | cloud-side WAN Extension    | UDP 500,4500

The public IP addresses of cloud-side HCX components are available within the SDDC after HCX has been activated.



#### Critical Network Services
On-premises HCX will require access to the following network services:
* DNS
* NTP
* Syslog



#### Activating HCX
Installation of HCX within an SDDC is performed from the "Add Ons" tab in the SDDC view of the [VMC Console]({{ site.data.links.vmw.vmc }}). Clicking on the "Deploy HCX" button for the specific SDDC will trigger the installation of the cloud-side HCX Manager within that SDDC. Activation keys are also generated from this interface. The activation key is required to activate the on-premises HCX Manager.

You should ensure that if you are running an add blocker in your browser that you whitelist connect.hcx.vmware.com.

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/activate/activateHCX.png' | relative_url }}">
  <figcaption>Activate HCX</figcaption>
</figure>

The HCX Manager within the SDDC is protected by the gateway firewall of the MGW. You must permit access by adding a rule within the [VMC Console]({{ site.data.links.vmw.vmc }}).

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/activate/permitAccess.png' | relative_url }}">
  <figcaption>Permit Access</figcaption>
</figure>


#### Downloading the HCX Manager
The on-premises HCX Manager may be downloaded from the cloud-side HCX manager once the service has been activated. To do so:

##### Step 1
Open the HCX Manager within the SDDC. This is done from the "Add Ons" tab of the SDDC in the VMC Console. Use the cloudadmin creditials of the SDDC to log into the Manager.

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/activate/step01.png' | relative_url }}">
  <figcaption>Step 1</figcaption>
</figure>


##### Step 2
Download the on-premises HCX Manager. A download link is availble from the HCX Manager. Be sure to note the FQDN of the cloud-side HCX Manager. This will be needed as part of the installation process for the on-premises HCX Manager.

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/activate/step02.png' | relative_url }}">
  <figcaption>Step 2</figcaption>
</figure>



#### Pre-Flight Checklist
Before getting started, please verify the following:

- [ ] The on-premises vCenter/ESXi/NSX versions meet the minimums
- [ ] The on-premises network has sufficient bandwidth for HCX
- [ ] HCX has been activated
- [ ] HCX manager has been downloaded
- [ ] Activation key has been generated
- [ ] IP addresses have been allocated for on-premises HCX components
- [ ] If using Direct Connect, a range of private addresses has been allocated for cloud-side HCX components
- [ ] The FQDN of the cloud-side HCX Manager has been noted
- [ ] The password for the cloud-side HCX Manager has been noted
- [ ] The URL of the on-premises vCenter server has been noted
- [ ] If using external PSC, its URL has been noted
- [ ] A vDS has been created within the on-premises vCenter (if using network extension)
- [ ] DNS can resolve the public IP addresses of central HCX services
- [ ] Firewalls have been configured to allow outbound connectivity by the on-premises HCX components



<h2 id="hcx-manager-installation">HCX Manager Installation</h2>

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



<h2 id="interconnect-appliance-installation">Interconnect Appliance Installation</h2>

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



<h2 id="wan-optimization-appliance-installation">WAN Optimization Appliance Installation</h2>

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



<h2 id="network-extension-appliance-installation">Network Extension Appliance Installation</h2>

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



<h2 id="network-extension">Network Extension</h2>

Network Extension can be performed on any port-group which is backed by a VDS to which a WAN Extension Appliance has been attached. When you "extend" a network, HCX will create a duplicate of this network within the SDDC and will create a layer-2 network extension between it and the on-premises port-group. The network which is created in the SDDC is detached from the routing infrastructure of that SDDC. This means that the network is effectivly isolated within the SDDC and that the only "path out" for workloads which are attached to it is through the layer-2 extension to the on-premises network.



#### Extending a Network
These steps are performed from the HCX Dashboard within vCenter.

##### Step 1
From the HCX Dashboard, click Extend Network from the "Interconnect" tab.

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/extend-net/step01.png' | relative_url }}">
  <figcaption>Step 1</figcaption>
</figure>

##### Step 2
Select the network to extend, and provide the default gateway IP of that network along with the netmask (in CIDR format).

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/extend-net/step02.png' | relative_url }}">
  <figcaption>Step 2</figcaption>
</figure>

##### Step 3
Upon completion, the network will show up under the list of extended networks. The duplicate network which was created within the SDDC will be visible as the "Destination Network".

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/extend-net/step03.png' | relative_url }}">
  <figcaption>Step 3</figcaption>
</figure>



#### Additional Notes
* If the port groups being extended are served by different physical uplinks on the DVS, then a separate appliance should be deployed per unique group of uplinks.  The port-groups that share the same uplinks should be manually mapped to the same appliance when extending the networks.
* If multiple appliances are being deployed, and HCX is being used over the public internet, then additional public IP addresses must be assigned to the SDDC. Currently, this is a manual process and the activity should be coordinated by opening a live-chat session with VMware from within the VMC console.
* Multiple appliances can be added with "add another distributed switch" workflow on HCX components page.
* **Do not** extend the management network (where HCX mgmt interfaces exist). Doing so will break the HCX deployment.



<h2 id="workload-migration">Workload Migration</h2>

Workload migration in HCX comes in the following flavors:
* Bulk Migration - AKA "warm migration" or "reboot to cloud". Performed using the migration scheduler feature of HCX. Will pre-replicate data in advance of the migration and, at the preset time, will perform a final sync before shutting down (and archiving) the source VM and powering-up the migrated version in the destination site.
* vMotion - Replicates and migrates the source VM immediately. This performs similarly to vMotion built natively into vCenter.
* Cold Migration - A method for replicating powered-off VMs to the destination site.
* Replication-Assisted vMotion - Combines the features of Bulk Migration (scheduling, etc..) with vMotion (zero downtime).

You may find more information on the different types of migrations in the HCX [user guide]({{ site.data.links.vmw.hcx_doc }}).



#### Performing a Migration
Migrations are typically performed from the HCX dashboard within vCenter, by navigating to the Migration tab and clicking Migrate Virtual Machines. The following screenshot shows an example of the dialog.

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/migrate/migrate.png' | relative_url }}">
  <figcaption>Migrate</figcaption>
</figure>



<h2 id="network-cutover">Network Cutover</h2>

A "network cutover" is the act of migrating a network from the on-premises location into the SDDC. As a prerequisite for a cutover event, the on-premises side of an extended network **must** have been fully evactuated. If the network contains resources which will not be migrating to the SDDC, then they must be moved to another network which will remain within the on-premises environment.

The process for a network cutover is roughly as follows:
1. Prepare the SDDC to act as the authority for the network. This means reviewing the security policy of the SDDC to ensure that workloads will be reachable once the network has been cut-over.
2. Review the routing between the on-premises and the SDDC. Understand what will be required to ensure that the migrated network is known via the SDDC. For example, this may mean adjusting prefix-lists to ensure that BGP routes propagate over IPSec or Direct Connect.
3. Schedule a maintenance.
4. At the start of the maintenance, unstretch the network.
5. Shut down the on-premises version of the network.
6. Adjust routing such that the migrated network is known via the SDDC.
7. Verify connectivity to migrated workloads.



#### Unstretching a Network
Unstretching a network is performed from the HCX dashboard within vCenter.

##### Step 1
From the HCX Dashboard, click Extended Networks from the "Interconnect" tab.

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/extend-net/step01.png' | relative_url }}">
  <figcaption>Step 1</figcaption>
</figure>

##### Step 2
Click on "unstretch" for the desired network.

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/net-cutover/step02.png' | relative_url }}">
  <figcaption>Step 2</figcaption>
</figure>

##### Step 3
Check the box to plumb the network into the routing infrastructure of the SDDC, and hit "Unstretch".

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/net-cutover/step03.png' | relative_url }}">
  <figcaption>Step 3</figcaption>
</figure>

##### Step 4
The status of the network will change to reflect the tear-down of the extension.

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/net-cutover/step04.png' | relative_url }}">
  <figcaption>Step 4</figcaption>
</figure>



<h2 id="known-caveates">Known Caveates</h2>

#### Networking

##### HCX over Direct Connect Private VIF requires manual configuration
HCX over Direct Connect Private VIF requires manual configuration by VMware. In order for HCX traffic to ride over Direct Connect Private VIF, the cloud-side appliances must bind to a private IP. For this, customers must allocate an additional private IP range for HCX to use. A unique subnet should be used, that will be advertised by the SDDC over the private VIF in addition to the Management & Compute networks. This subnet cannot be taken from nor overlap the existing Management or Compute networks.
The size of this subnet will depend on how many vCenters HCX will deployed to on-prem, and how many L2C appliances will be deployed. One IP is required per interconnect or L2C appliance.  One Interconnect appliance is required per vCenter, and a minimum of 1 L2C per vDS with networks to be extended, and a maximum of 8 networks can be extended per L2C appliance.  It is also possible to deploy additional L2Cs for higher scale requirements (up to 1 per extended network). In most cases, a /29 will be sufficient, however if there are many networks and/or vDS or vCenters to extend networks on, a larger subnet should be provided.

The process for configuring HCX for Private VIF will be as follows:
1. Customer to activate HCX
2. Customer to allocate private IP range for cloud-side HCX appliances
3. Customer to contact VMware via live-chat and provide the private IP range
4. VMware to perform the configuration and contact the customer when finished
5. Customer to continue with on-premises installation

1. Customer to connect the Private VIF to the SDDC* (Note this step can be done before or after HCX is activated)
2. Customer to activate HCX on the SDDC
3. Customer to allocate private IP range for cloud-side HCX appliances
4. Customer to contact VMware via live-chat and provide the private IP range and confirm the SDDC they want to configure with HCX.
5. VMware to perform the configuration and contact the customer when finished
6. Customer to continue with on-premises installation.

There is one additional change that the customer must make, and this is with the site-pairing. Normally, the site-pairing will be done to the public IP of the cloud-side HCX Manager, over the Internet. However, this is not typically desirable in the case of Private VIF. In this case, the customer will want to establish the pairing with the private IP of the HCX manager such that the traffic will ride over the Direct Connect. This IP may be found directly within vCenter by looking at the HCX Manager which has been deployed within the SDDC, under the Management Resource Pool. Then the customer will need to connect to the on-prem HCX Manager by ensuring that SSH is enabled through the web interface, then ssh into it as the admin user, and run su - to access the root account. Create an entry within /etc/hosts of the on-prem HCX Manager using an editor such as vi. This entry should reflect the FQDN of the cloud-side HCX Manager (e.g. hcx-sddc.xx-xx-xx-xx.vmwarevmc.com), for example:

<pre class="mycode"><code>
10.10.10.123	hcx.sddc-x-x-x-x.vmwarevmc.com

</code></pre>


##### IP assignment for additional WAN Interconnect/Extension appliances requires VMware assistance.
When using HCX over the public internet, the cloud-side appliances will use public EIPs provided by AWS. There are 2 of these allocated by default for the WAN Interconnect/Extension appliances. If additional appliances are required by the customer, as described above, then they must contact VMware via live-chat and request additional EIPs be allocated to their SDDC for HCX. Once these have been allocated then the customer may continue with the deployment of the additional appliances.




#### vMotion

##### Virtual Machine Restrictions for vMotion
The following are summarized from the HCX user guide. Please refer to that document for details.
* VMs must be running vm hardware version vmx-09 or higher.
* underlying architecture, regardless of OS, must be x86 on Intel CPUs
* VM disk size cannot exceed 2 TB
* cannot have shared VMDK files
* cannot have any attached virtual media or ISOs
* cannot have change block tracking enabled

Note: Only 1 vMotion operation at a time can be running, and it is not recommended to perform migrations using vMotion while bulk migration replication is also in progress.

