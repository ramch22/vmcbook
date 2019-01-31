---
layout: chapter
---

<section markdown="1" id="network-extension">
## Network Extension

Network Extension can be performed on any port-group which is backed by a VDS to which a WAN Extension Appliance has been attached. When you "extend" a network, HCX will create a duplicate of this network within the SDDC and will create a layer-2 network extension between it and the on-premises port-group. The network which is created in the SDDC is detached from the routing infrastructure of that SDDC. This means that the network is effectivly isolated within the SDDC and that the only "path out" for workloads which are attached to it is through the layer-2 extension to the on-premises network.


### Extending a Network
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


### Additional Notes
* If the port groups being extended are served by different physical uplinks on the DVS, then a separate appliance should be deployed per unique group of uplinks.  The port-groups that share the same uplinks should be manually mapped to the same appliance when extending the networks.
* If multiple appliances are being deployed, and HCX is being used over the public internet, then additional public IP addresses must be assigned to the SDDC. Currently, this is a manual process and the activity should be coordinated by opening a live-chat session with VMware from within the VMC console.
* Multiple appliances can be added with "add another distributed switch" workflow on HCX components page.
* **Do not** extend the management network (where HCX mgmt interfaces exist). Doing so will break the HCX deployment.

</section>



<section markdown="1" id="workload-migration">
## Workload Migration

Workload migration in HCX comes in the following flavors:
* Bulk Migration - AKA "warm migration" or "reboot to cloud". Performed using the migration scheduler feature of HCX. Will pre-replicate data in advance of the migration and, at the preset time, will perform a final sync before shutting down (and archiving) the source VM and powering-up the migrated version in the destination site.
* vMotion - Replicates and migrates the source VM immediately. This performs similarly to vMotion built natively into vCenter.
* Cold Migration - A method for replicating powered-off VMs to the destination site.
* Replication-Assisted vMotion - Combines the features of Bulk Migration (scheduling, etc..) with vMotion (zero downtime).

You may find more information on the different types of migrations in the HCX [user guide]({{ site.data.links.vmw.hcx_doc }}).


### Performing a Migration
Migrations are typically performed from the HCX dashboard within vCenter, by navigating to the Migration tab and clicking Migrate Virtual Machines. The following screenshot shows an example of the dialog.

<figure>
  <img src="{{ '/book/illustrations/cloud-services/hcx/migrate/migrate.png' | relative_url }}">
  <figcaption>Migrate</figcaption>
</figure>

</section>



<section markdown="1" id="network-cutover">
## Network Cutover

A "network cutover" is the act of migrating a network from the on-premises location into the SDDC. As a prerequisite for a cutover event, the on-premises side of an extended network **must** have been fully evactuated. If the network contains resources which will not be migrating to the SDDC, then they must be moved to another network which will remain within the on-premises environment.

The process for a network cutover is roughly as follows:
1. Prepare the SDDC to act as the authority for the network. This means reviewing the security policy of the SDDC to ensure that workloads will be reachable once the network has been cut-over.
2. Review the routing between the on-premises and the SDDC. Understand what will be required to ensure that the migrated network is known via the SDDC. For example, this may mean adjusting prefix-lists to ensure that BGP routes propagate over IPSec or Direct Connect.
3. Schedule a maintenance.
4. At the start of the maintenance, unstretch the network.
5. Shut down the on-premises version of the network.
6. Adjust routing such that the migrated network is known via the SDDC.
7. Verify connectivity to migrated workloads.


### Unstretching a Network
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

</section>

