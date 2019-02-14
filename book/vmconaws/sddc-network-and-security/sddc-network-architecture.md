---
layout: chapter
---

<section markdown="1" id="the-aws-base-layer">
## The AWS Base Layer

<section markdown="1" id="aws-account">
### The VMware AWS Account
As part of the partnership with AWS, VMware maintains a master AWS account which is used as part of the VMware Cloud On AWS service. Whenever a new cloud services Organization (Org) is created, VMware creates a sub-account within this master account which acts as the parent for all AWS resources used by that Org.

<figure>
  <img src="{{ '/book/illustrations/vmconaws/sddc-network-and-security/sddc-network-architecture/aws-accounts.png' | relative_url }}">
  <figcaption>VMware AWS Accounts</figcaption>
</figure>

Whenever an SDDC is provisioned, resources for that SDDC are created within the AWS sub-account for the Org. This model allows VMware to manage billing for SDDC consumption (hardware, bandwidth, [EBS]({{site.data.links.aws.ebs}}), etc...).

</section>

<section markdown="1" id="underlay-vpc">
### The SDDC Underlay VPC
As part of the process for provisioning an SDDC it is required to provide the number of hosts for the SDDC base cluster and an IP address range to use for SDDC management. Using this information, VMware will create a new [VPC]({{site.data.links.aws.vpc_subnets}}) within the VMware-owned AWS account for that SDDC's Org. This VPC will be created using the SDDC management IP address range provided during the provisioning process and several subnets will be created within that VPC. VMware will then allocate hardware hosts for the SDDC and connect them to the subnets of that VPC.

<figure>
  <img src="{{ '/book/illustrations/vmconaws/sddc-network-and-security/sddc-network-architecture/underlay-vpc.png' | relative_url }}">
  <figcaption>The Underlay VPC</figcaption>
</figure>

An [IGW]({{site.data.links.aws.igw}}) and VGW will also be created for this VPC. These gateways enable internet and Direct Connect connectivity to the VPC. 

</section>

</section>




<section markdown="1" id="the-sddc-underlay">
## The SDDC Underlay

<section markdown="1" id="esxi-networking">
### ESXi Networking
Once the underlay VPC has been created for the SDDC and hardware hosts have been provisioned, the SDDC is bootstapped with ESXi and the remaining VMware software stack is installed. Once the SDDC is up and running, it is possible to get a glimpse of the underlay networking design by viewing the networking configuration of a single ESXi host. This setup is fairly complex, so it is not entirely necessary that it be well understood. However, having some insight into the inner workings of the underlay network will help when it comes to understanding the networking behaviors and quirks of the SDDC itself.

Although the hosts  of the SDDC are deployed with a redundant physical pair of NICs, they are presented in the vCenter UI as a single physical NIC. Within the host, this physical NIC is attached to an internal host-switch where it is made available to the various virtual switches which make up the management network of the SDDC. The hosts themselves have a number of VMkernel interfaces which they use for the following purposes:

* host management (vmk0)
* vSAN (vmk1)
* vMotion (vmk2)
* AWS API (vmk4)
* NSX Tunnel End Point (not shown)

These VMkernel adapters are visible from the networking section of the configuration tab of the ESXi host. You can also get a sense of the setup by viewing the TCP/IP configuration for the host.

The last portion of the underlay network are the virtual switches. Again, these are visible from the networking section of the configuration tab of the ESXi host. Here, you will see a mix of switches which are part of the underlay network as well as switches which are used for the NSX overlay (NSX network segments). The switches which are part of the underlay are there to provide network connectivity to the infrastructure appliance VMs of the SDDC and are part of the SDDC management network.

The AWS infrastructure is completely unlike a traditional switched network in that it is not based on MAC-learning. Instead, 100% of all IP/MAC pairs must be explicitly programmed by AWS into the infrastructure. This presents a problem for the SDDC; specifically when it comes to vMotion. Although the exact nature of the problem (as well as the details around the solution) are beyond the scope of this document, it is sufficient to understand that each ESXi host utilizes a series of kernel-level (non-NSX managed) virtual routers designed to enable vMotion on top of AWS. These virtual routers are visible in the network path of a VM whenever you perform a traceroute. If you do a traceroute then you will notice that the interconnects between the NSX edges and the host-level routers (vDR) are utilizing a mix of IPv4 addresses from the [reserved](https://en.wikipedia.org/wiki/Reserved_IP_addresses) ranges for link-local and carrier-grade NAT.

<figure>
  <img src="{{ '/book/illustrations/vmconaws/sddc-network-and-security/sddc-network-architecture/esx-networking.png' | relative_url }}">
  <figcaption>ESXi Host Networking</figcaption>
</figure>

</section>

<section markdown="1" id="vpc-cross-link">
### The VPC Cross-Link
Every SDDC must be cross-linked to a VPC within the customer-owned AWS account. This cross-linking is accomplished using the Cross-Account [ENI]({{site.data.links.aws.eni}}) feature of AWS and creates a connection between every host of the SDDC to a [subnet]({{site.data.links.aws.vpc_subnets}}) within the cross-linked VPC. This cross-link provides the SDDC with a network forwarding path to services maintained within the customer-owned AWS account.

<figure>
  <img src="{{ '/book/illustrations/vmconaws/sddc-network-and-security/sddc-network-architecture/cross-account-eni.png' | relative_url }}">
  <figcaption>SDDC Cross-Account ENIs</figcaption>
</figure>

The Cross-Account ENIs are visible from the customer-owned AWS account (by viewing network interfaces within EC2). You will notice that there are several ENIs created when the SDDC is deployed, but that only a few are active. In addition to ENIs created for active hosts of the SDDC, there will also be ENIs created for future expansion and for upgrades/maintenances. Even though it is possible, you should avoid modifying or deleting these ENIs since doing so may impact the cross-link to the SDDC.

</section>

</section>




<section markdown="1" id="the-sddc-overlay">
## The SDDC Overlay

<section markdown="1" id="an-overview-of-nsx-networking">
### An Overview of NSX Networking
As part of the standard SDDC software stack, VMware utilizes [NSX-t]({{site.data.links.vmw.nsxt}}) to create an overlay network atop the base-layer provided by AWS. The end result is a logical network architecture which is completely abstracted from the underlying infrastructure.

Network overlays operate on the notion of encapsulation; they hide network traffic between VMs within the overlay from the underlying infrastructure. Networking is full of examples of overlay networks. Older protocols, such as GRE and IPSec ESP, have been around for years and were designed to create network overlays (typically over a WAN). With the introduction of software defined networking, specialty protocols such as VXLAN, STT, and NVGRE were created to help alleviate some of the limitations of VLAN-based data center networks. In recent years a newer overlay protocol known as [GENEVE](https://tools.ietf.org/html/draft-gross-geneve-00) was introduced to address limitations with the first round of data center overlay protocols. NSX-t uses GENEVE as its overlay networking protocol within the SDDC.

Higher-level constructs aside, software defined networking defines 2 types of objects: logical switches and logical routers. These objects are designed to mimic the behavior of their counterparts in traditional hardware-based networks. Logical switches operate at [layer-2](https://en.wikipedia.org/wiki/Data_link_layer) and will forward traffic between nodes within the same [network segment](https://en.wikipedia.org/wiki/Network_segment). Logical routers operate at [layer-3](https://en.wikipedia.org/wiki/Network_layer) and will route traffic between network segments. With NSX, logical switches and logical routers are distributed. This means that each host of the SDDC maintains enough information to understand which VMs belong to which logical switch(es) and how to forward traffic through the underlay network. When 2 VMs communicate with one another, the exact path through the underlay becomes a function of where the VMs reside (i.e. on which host they reside).

<figure id="fig-overlay-networking">
  <img src="{{ '/book/illustrations/vmconaws/sddc-network-and-security/sddc-network-architecture/overlay-networking.png' | relative_url }}">
  <figcaption>Overlay Networking</figcaption>
</figure>

In <a class="xref" href="#fig-overlay-networking"></a> above, we see several examples of different types of traffic flows. As illustrated, intra-segment traffic will either be switched locally for VMS on the same host, or encapsulated and sent through the underlay for VMs on different hosts. Similarly, for inter-segment traffic the routing will take place locally before being switched or encapsulated and sent through the underlay.
</section>

<section markdown="1" id="nsx-overlay-network">
### The NSX Overlay Network
The SDDC utilizes NSX to create an overlay network with 2 tiers of routing. At the first tier of the network is an NSX tier-0 router which acts as the north-south border device for the entire SDDC. At the second tier are the NSX tier-1 routers which are known as the Management Gateway (MGW) and Compute Gateway (CGW). These tier-1 routers act as the gateways for their respective networks.

<figure>
  <img src="{{ '/book/illustrations/vmconaws/sddc-network-and-security/sddc-network-architecture/sddc-overlay.png' | relative_url }}">
  <figcaption>SDDC Overlay Network</figcaption>
</figure>

There are two distinct types of networks within the SDDC: the management network and the compute network. The management network is considered to be part of the SDDC infrastructure and provides network connectivity to the various infrastructure components of the SDDC. Due to the permissions model of the service, the layout of this network may not be altered. The compute network is used by the compute workloads of the SDDC. Customers have the ability to add and remove network segments within the compute network as needed.
</section>

<section markdown="1" id="nsx-logical-routers">
### NSX Logical Routers
All routers within the SDDC are distributed. This means that routing between segments is performed locally on ESXi host by the appropriate distributed router (DR). Certain functions, however, are not distributed and must be handle centrally by a Service Router (SR) component on the NSX edge appliances. Specifically, gateway firewalling and NAT operations are handled in a centralized manner. Also, any traffic which passes between the overlay and underlay networks must be handled by the tier-0 edge SR on the edge appliances. The edge appliances are deployed in a redundant pair, with all SRs running on the active appliance and with SRs on the standby appliance sitting idle. In the event of a failure of 1 or more SRs on the active appliance, all SRs will fail over to the standby appliance. This is an optimization strategy designed to prevent unecessary traffic flows between the edge appliances.

<figure>
  <img src="{{ '/book/illustrations/vmconaws/sddc-network-and-security/sddc-network-architecture/edge-appliances.png' | relative_url }}">
  <figcaption>NSX Edge Appliances</figcaption>
</figure>

In <a class="xref" href="#fig-overlay-networking"></a> above, we see an example traffic flow where a VM is communicating to the internet. It this example, the traffic is routed between the CGW and Edge DRs locally before being sent through the underlay to the Edge SR in the active edge appliance. From there, the traffic is routed through to the vDR on the local ESXi host before finally being sent out to the internet. This routing pattern would be visible in a traceroute from the VM.
</section>

<section markdown="1" id="vpc-cross-link-to-edge">
### The VPC Cross-Link to the SDDC Edge
As discussed previously, every host of the SDDC is connected to a VPC within the customer-owned AWS account via Cross-Account ENI connections. These connections are there in order to provide a forwarding path to the tier-0 edge of the SDDC.

<figure>
  <img src="{{ '/book/illustrations/vmconaws/sddc-network-and-security/sddc-network-architecture/edge-cross-link.png' | relative_url }}">
  <figcaption>Edge Cross-Link</figcaption>
</figure>

Since we must always pass through the Edge SR whenever traffic leaves the SDDC, all traffic to and from the cross-linked VPC must pass through the active edge appliance of the SDDC. Since this edge appliance is a VM, it resides on a specific ESXi host. As such, it will always use the Cross-Account ENI for that host (as well as the local vDR for that host). It should be noted that the base cluster of the SDDC will be deployed within the same [Availability Zone]({{site.data.links.aws.regions_az}}) (AZ) as the cross-link subnet (the subnet which contains the Cross-Account ENIs). Since the edge appliances reside within the base cluster, cross-AZ bandwidth charges will be avoided between the edge and any resources within that same AZ.

Routing between the SDDC and the VPC is enabled through static routes which are created on-demand as networks are added to the SDDC. These static routes are added to the **main routing table** of the customer VPC and use one of the Cross-Account ENIs as the next-hop for the route. It is important to keep in mind that the next-hop ENI used for the static routes will always be that of the ESXi host which houses the active edge appliance of the SDDC. This means that if the edge were to migrate to a different host (as happens during a failover event or whenever the SDDC is upgraded) then the next-hop of the static routes will be updated to reflect this change. For this reason **it is not recommended** to manually copy these static routes to other routing tables of the VPC.

</section>

<section markdown="1" id="edge-uplinks-and-traffic-flows">
### Edge Uplinks and Traffic Flows
It is important to understand the various uplinks in the SDDC and what traffic flows through them. This information is useful not only for understanding interconnectivity within the SDDC, but also in understanding how traffic exits the SDDC (and potentially incurs bandwidth charges). There are currently 3 uplinks from the tier-0 edge of the SDDC. These are described below.

#### Internet Uplink
The internet uplink provides the SDDC with internet connectivity via the [IGW]({{site.data.links.aws.igw}}) within the underlay VPC. The SDDC edge has a default route which points to the IGW as a next-hop, so will use this uplink for all unknown destination networks. Traffic over this uplink is billable and the charges will be passed through as part of the billing for the SDDC.

#### VPC Uplink
The VPC uplink connects the SDDC edge to the cross-linked VPC in the customer-owned AWS account. There is a static route on the SDDC edge for the private address space of the VPC which points to the VPC router as a next-hop. The SDDC administrator may also enable static routing of certain public AWS services (e.g. S3) over this uplink. Traffic over this uplink is non-billable only for AWS resources which are **within the same availability Zone** as the SDDC. Traffic to resources in other Availability Zones is billable and charges will be accrued on the customer-owned AWS account.

#### Direct Connect Uplink
This Direct Connect uplink is only used when [Direct Connect]({{site.data.links.aws.dx}}) private VIF is plumbed into the SDDC. The SDDC edge will use this uplink for whatever network prefixes are received via BGP over this uplink. Since Direct Connect is a resource which is managed by the customer-owned AWS account, bandwidth charges over this uplink will be accrued on the customer-owned AWS account.
</section>

</section>
