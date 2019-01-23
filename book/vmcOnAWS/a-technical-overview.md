---
layout: default
---

<h2 id="concepts">Concepts</h2>

#### Introduction
Prior to getting started with the VMware Cloud on AWS service, it is critical to understand the basic components of the service. As a starting point, the following items should be well understood:
* the Software Defined Data Center (SDDC)
* the VMware Cloud Org
* the customer AWS account
* integration with AWS services

These items are discussed below.


#### Software Defined Data Center (SDDC)

The Software Defined Data Center (SDDC) is a collection of bare-metal hosts which are installed with a standard set of VMware software. It is important to understand that each SDDC is running atop dedicated hardware and that billing for an SDDC is based upon the number of hosts dedicated to the SDDC and not the number of VMs running within the SDDC.

Since VMware Cloud On AWS is a managed service, full admin-level access to the SDDC is not permitted. This restriction is in place to prevent customers from modifying the infrastructure of the SDDC itself.  Instead, customers are given a role which allows them to fully manage workloads which they have deployed within the SDDC. Normally, this permissions model does not impact day-to-day use of the service, however, it's important to keep in mind if you are planning on integrating tools directly with infrastructure components such as vCenter. If the integration you are planning requires admin rights, then it may not function properly. We recommend you review the 3rd party service's documentation for the requirements around full admin-level access to the SDDC.

<figure>
  <img src="{{ '/book/illustrations/vmconaws/a-technical-overview/sddc.png' | relative_url }}">
  <figcaption>Software Defined Data Center (SDDC)</figcaption>
</figure>


Key points to remember regarding the SDDC:
* It is deployed on dedicated, bare-metal hosts.
* It is Deployed with standard components (ESXi, vCenter, NSX, vSAN).
* Billing is based on the number of hosts within the SDDC, not on the number of VMs.
* Users have the ability to manage their workloads but have limited access to vCenter,vSAN, and NSX.


#### The VMware Cloud Organization
This is the top-level "container" for all SDDCs. This topic was discussed in-depth in the chapter titled "Getting Started".


#### Amazon Web Services Account

A major benefit of the service is its ability to provide direct access to AWS services. As such, it is required that all customers maintain a dedicated AWS account which will be used to access and manage these services.  If you are unsure of how to create an AWS account, then please refer to the [AWS Documentation]({{ site.data.links.aws.create_acct }}/) for more information on the process.

A few important points on the AWS account:

* The account provides access to AWS services from a customer's VMware Cloud resources, and is required in order to deploy an SDDC.
* The account is owned by the customer, not by VMware.
* Billing for the account is handled directly by AWS, not by VMware


#### Integration with AWS Services

Each SDDC is provided direct access to AWS services via a connection to a customer-owned AWS account. This connection is established as part of the SDDC provisioning process, and is performed using one of two methods:

* By choosing an AWS account which has previously been connected to another SDDC, or
* By creating a new connection to an AWS account

The term "connected" simply means that the customer has granted permissions for the VMware Cloud On AWS service to enable routing between an SDDC and a [VPC]({{ site.data.links.aws.vpc_subnets }}) within the customer-owned AWS account. These permissions are granted via [IAM]({{ site.data.links.aws.iam }}) roles which are created within the connected account using a [CloudFormation]({{ site.data.links.aws.cloudformation }}) template. It is important to note that the person who is performing the account connection process must have sufficient permissions (eg. admin rights) within the AWS account to execute this CloudFormation template.

<figure>
  <img src="{{ '/book/illustrations/vmconaws/a-technical-overview/awsServiceIntegration.png' | relative_url }}">
  <figcaption>Integration with AWS Services</figcaption>
</figure>


Key points to remember:
* AWS services are managed through a customer-owned AWS account.
* Account linking enables VMware Cloud services to cross-link SDDCs into a customer-owned AWS account.
* Account linking is performed when the user executes a CloudFormation template within their AWS account.
* The CloudFormation template creates roles which enable VMware to manage SDDC cross-linking.
* Each SDDC is cross-linked to VPC/Subnet via a series of ENIs.
* The [Availability Zone]({{ site.data.links.aws.regions_az }}) (AZ) of the x-link Subnet will determine AZ of the SDDC.


Once a connection is established to the AWS account, it then becomes possible to configure a cross-link between an SDDC and a VPC within that account. The cross-link itself consists of a series of [Elastic Network Interfaces]({{ site.data.links.aws.eni }}) (ENI) which are attached to a Subnet within the VPC. It is these ENIs which provide the hosts of an SDDC with a network forwarding path to resources within the account. The topic of SDDC cross-linking will be explored in more detail later on, but for now it is important to keep the following considerations in mind when selecting a VPC/Subnet for the cross-linking:

* The VPC must exist within the same Region which is planned to house the SDDC.
* The Subnet must be sufficiently large to accommodate one ENI per host within the SDDC. Typically, a /26 is the minimum recommended size for the Subnet.
* Subnets are associated with an Availability Zone (AZ), therefore the choice of Subnet determines the Availability Zone into which the SDDC hardware is provisioned. The purpose of this is to avoid cross-AZ bandwidth charges between the SDDC and the Subnet used for cross-linking (see AWS [billing policies]({{ site.data.links.aws.data_transfer }}) for details).
* It is recommended to use a dedicated Subnet for cross-linking. The purpose of this is to ensure that IP addresses within the Subnet are not consumed by other services (e.g. other EC2 instances) thus preventing ENIs for new hosts from being added as the SDDC grows. Secondary to that, using a dedicated Subnet helps prevent the situation where an AWS admin accidentally deletes or otherwise modifies the ENIs used for cross-linking.
* It is possible to cross-link multiple SDDCs to the same AWS account. If you plan to do this, then it is vital to ensure that you do not create IP addressing conflicts by using overlapping IP address ranges between the SDDCs. This is particularly relevant if you plan to cross-link multiple SDDCs to the same VPC.



<h2 id="compute-and-storage">Compute and Storage</h2>

In order to prevent the cloudAdmin from modifying the infrastructure components of the SDDC, vCenter is configured to use Resource Pools and segmented vSAN Data Stores. The cloudAdmin role is then granted permissions only to the resources designated for its use. The specifics for this setup are described below.

##### vCenter Resource Pools

Resource management within vCenter is enforced through the use of Resource Pools. Using this model, infrastructure-level appliances exist within one Resource Pool while compute workloads exist within another. The cloudAdmin role does not have permissions to modify the resources within the management pool.

<figure>
  <img src="{{ '/book/illustrations/vmconaws/a-technical-overview/vcenterRP.png' | relative_url }}">
  <figcaption>Resource Pools</figcaption>
</figure>

##### vSAN Datastores

Access to storage is managed using a similar model as Resource Pools. Within an SDDC, the vSAN cluster has been modified to present two logical Datastores; one for the infrastructure appliances, and another for compute workloads. As with the Resource Pool model, the cloudAdmin role does not have access to the Datastore used by the infrastructure appliances.

<figure>
  <img src="{{ '/book/illustrations/vmconaws/a-technical-overview/vcenterDS.png' | relative_url }}">
  <figcaption>vSAN Datastores</figcaption>
</figure>


##### vSAN Storage Policies

Total usable storage within an SDDC is a function of a couple of variables. Firstly, the vSAN storage policy applied to VMs effects the amount of overhead required for data storage. Secondly, the ability of dedup & compressing to reduce the storage footprint plays a role.

Taking a look at the table below, we can see that each policy consists of a Failures to Tolerate setting and a Fault Tolerance Method.

FTT |  FTM  | Hosts Required | Required Capacity
----|-------|----------------|------------------
1   | RAID1 | 3              | 2X
1   | RAID5 | 4              | 1.33X
2   | RAID1 | 4              | 3X
2   | RAID6 | 6              | 1.5X
3   | RAID1 | 7              | 4X

<figcaption>vSAN FTT/FTM Configurations</figcaption> 

Each combination requires a certain minimum number of hosts and has an associated "cost" in terms of storage overhead required to implement. For example, we can see that the first policy in the table requires twice the storage space to implement the policy. This is because RAID1 mirroring is duplicated each storage object twice in order to implement the FTT value of 1.

With vSAN, it is required to have a default storage policy and it is this policy which is used by VMs that do not have a storage policy explicitly defined on them.
 The default storage policy for an SDDC uses an FTM of RAID1 with an FTT of 1.
 For SDDCs with 6 or more hosts, then an FTT of 2 will be used.

It should be noted that VMware will automatically add hosts to the SDDC when storage utilization crosses the 70% threshold, even when EDRS is disabled. This practice is a preventative measure designed to ensure that vSAN has a minimal amount of "slack" space available to it at all times.

Finally, the [VMC Sizer]({{ site.data.links.vmw.vmcaws_sizer }}) tool has been made available as a means of assisting customers with estimating the number of hosts required to meet their storage demands.


##### Elastic Distributed Resource Scheduler (EDRS)

EDRS is a feature which enables an SDDC to scale based on its resource utilization. With EDRS, when utilization remains consistently above any of the scale-out thresholds, then the SDDC will automatically add a host. Conversely, when utilization is consistently below any of the scale-in thresholds, then the SDDC will automatically remove a host.

EDRS is configured on a per-SDDC basis, and comes in two flavors: optimized for cost, or optimized for performance. The difference between the two variants has to do with how aggressively a scale-in or scale-out action occurs. When optimized for cost, the SDDC will be more conservative when scaling-out but more eager to scale-in. When optimized for performance, the opposite is true.


<h2 id="sddc-networking">SDDC Networking</h2>

This section covers the network architecture of the SDDC itself. Network integrations between the SDDC and other environments are discussed in the next section. 


#### An SDDC as Viewed by AWS
In order to understand the networking environment in which the SDDC resides, we must first consider the underlay environment which is provided by AWS. The following diagram illustrates the view of the SDDC from the perspective of AWS.

<figure>
  <img src="{{ '/book/illustrations/vmconaws/a-technical-overview/sddcUnderlay.png' | relative_url }}">
  <figcaption>Figure 1: An SDDC as Viewed by AWS</figcaption>
</figure>


Despite the fact that the hosts of the SDDC are bare-metal hardware, the AWS infrastructure treats them as if they were EC2 instances. This means that the hosts themselves are tied to an AWS account, and that their networking stack is based upon the VPC technology used within AWS. The AWS account which is used for the hosts of the SDDC is one which is owned by VMware, but is dedicated to the VMware Cloud Org which contains the SDDC.

Per the **Figure 1**, each SDDC resides within a dedicated VPC which is owned by this AWS account. As with EC2, the hosts of the SDDC use the Internet Gateway for their public connectivity and the Virtual Private Gateway for access to Direct Connect Private VIF.



#### SDDC Overlay Logical Network Design
Once the hosts of the SDDC have been provisioned, VMware builds the SDDC in such a way as to abstract the details away from the underlying AWS infrastructure.
The end result is an overlay network which is design as follows:

<figure>
  <img src="{{ '/book/illustrations/vmconaws/a-technical-overview/sddcNetworkArch.png' | relative_url }}">
  <figcaption>Figure 2: SDDC Logical Networking</figcaption>
</figure>

In **Figure 2** we see the overlay network of the SDDC has 2 levels of routing. At the top level is an NSX tier-0 router which acts as the north-south border device for the entire SDDC. Below that are the NSX tier-1 routers, known as the Management Gateway (MGW) and Compute Gateway (CGW), which act as the gateways for the management and compute networks respectively.

Internally, the SDDC is utilizing NSX as a means of abstracting its private networks away from the underlying VPC. This abstraction provides the SDDC with additional functionality not normally available to native AWS workloads.

As **Figure 2** indicates, the Management Network is used by the infrastructure components of the SDDC. Due to the permissions model of the service, the layout of this network may not be altered. The Compute Network, on the other hand,  is used by the compute workloads of the SDDC. Within this network, customers have the ability to add and remove network segments as needed. It should be noted that there is a limit of 1024 logical ports within an NSX logical network. This limits the number of VMs which may be attached to a given network segment. Effectively, this means that segments should not exceed a /22.



#### Network Security
**Figure 3** below illustrates the network security implementation within the SDDC. Here, there are 2 layers of firewalling: the NSX Gateway Firewall, and the NSX Distributed Firewall.

<figure>
  <img src="{{ '/book/illustrations/vmconaws/a-technical-overview/sddcNetworkSecurity.png' | relative_url }}">
  <figcaption>Figure 3: Network Security</figcaption>
</figure>

Gateway firewalling is designed to protect the north-south border of the SDDC, and is implemented in 2 places. For the the Management Network gateway, firewalling is implemented at the uplink interface of the MGW. Per the permissions model of the service, users are restricted on which services may be exposed through the management gateway firewall. For the Compute Network, gateway firewalling is enforced at the uplink interface of the tier-0 edge. Users have full permissions to dictate security policy of the gatewy firewalling for the Compute Network.

The gateway firewalls have a “default deny” policy, which means that access must be specifically permitted. This applies to both inbound and outbound traffic. This means that in order to initiate communications outbound from the SDDC, the firewall policy must be configured to explicitly permit the connectivity.

Just as the Gateway Firewall is designed to protect the north-south boundary of the SDDC, the Distributed Firewall is designed to filter east-west traffic within the SDDC itself. The Distributed Firewall may be thought of as a centrally-managed, transparent, in-line firewall which protects all workloads within the Compute Network. Its purpose is to enable the administrator to enforce network security at the absolute edge of the network.

In a traditional network, security is enforced by a centralized appliance. This means that, typically, the subnets of a network are designed to reflect application logic.

**Figure 3** follows this planning logic with separate subnets designed to isolate the 2 tiers of an application. With the Distributed Firewall, since security is enforced at the vNIC level, rules may be defined to control traffic flows east-west, without requiring a centralized appliance. This effectively decouples network security from the structure of the underlying network making it possible to completely flatten the network design without impacting network security. This decoupling of network security from network design provides the security administrator with immense flexibility when it comes to implementing security poilcy within the SDDC.



#### DNS and DHCP
DNS forwarding and caching services are provided to the SDDC via NSX. These services are implemeted as a pair of DNS servers; one which serves the Management Network and another which serves the Compute Network. By default, these servers will forward requests to public DNS servers, however, users may configure custom DNS servers if so desired. For the Management Network, a single DNS server may be provided while for the Compute Network, multiple DNS servers may be specified (1 per DNS zone). It should be noted that DNS requests for the SDDC will appear to originate from the DNS service IPs. If custom DNS servers are configured within the SDDC, and these servers are protected by firewalls, then it will be important to ensure that the DNS service IPs are permitted through the firewall.

NSX provides basic DHCP services to the Compute Network of the SDDC and these services are enabled on a per-segment basis at the time of its creation. DHCP within the SDDC is fairly vanilla; users are currently limited to providing a range for DHCP leases and a DNS suffix for the segment. As part of the DHCP lease, clients will be provided the DNS service IP for the Compute Network as their DNS server.



<h2 id="sddc-interconnectivity">SDDC Interconnectivity</h2>

Now that the high-level details of the SDDC network architecture are understood, the next step is to discuss how the SDDC connects to the outside world. However, prior to getting into that discussion we must first consider an extremely important subject: IP administration.


#### The Importance of Proper IP Administration
All SDDCs will be cross-linked to a VPC within the customer's AWS account but may also be connected to other networks (such as an on-premises environment). In order to ensure that the SDDC can communicate with other interconnect networks, it is vital that IP addressing be properly planned. IP ranges should be unique and non-overlapping between the SDDC and any networks to which it will be connected. As such, one of the most critical pieces of the design process is proper planning of IP address usage.

Though not required, it is a good practice to allocate IP address space in large, contiguous chunks. The following table provides an example IP Administration plan.

Supernet     | Subnet level-1 | Subnet2 level-2 | Description
-------------|----------------|-----------------|------------
10.1.0.0/19  |                |                 | on-premises networks
10.1.32.0/19 |                |                 | AWS native
10.1.32.0/19 | 10.1.32.0/22   |                 | AWS Services VPC
10.1.32.0/19 | 10.1.32.0/22   | 10.1.32.0/26    | AWS Services VPC SDDC x-link
10.1.64.0/19 |                |                 | SDDC1
10.1.64.0/19 | 10.1.64.0/20   |                 | SDDC1 Management
10.1.64.0/19 | 10.1.80.0/20   |                 | SDDC1 Compute
10.1.64.0/19 | 10.1.80.0/20   | 10.1.80.0/24    | SDDC1 Compute Servers

<figcaption>An IP Administration Plan</figcaption>



#### VPC Cross-Linking
SDDC's are given access to AWS services by cross-linking them to a VPC within a customer-owned AWS account. As indicated by **Figure 1** below, cross-linking is made possible by ENIs which have been attached to a dedicated subnet within that VPC.

<figure>
  <img src="{{ '/book/illustrations/vmconaws/a-technical-overview/vpcCrossLink.png' | relative_url }}">
  <figcaption>Figure 1: Cross-Link VPC</figcaption>
</figure>

It should be noted that the first cluster of the SDDC will be deployed within the same availability zone as the cross-link subnet. This is done in order to avoid cross-AZ bandwidth charges between the edge and the cross-link subnet itself. However, keep in mind that if the SDDC communicates with Subnets in other availability zones, then cross-AZ bandwidth charges will be incurred by the customer-owned AWS account.


Routing between the SDDC and the VPC is enabled by using static routes which are created on-demand as networks are added to the SDDC. These static routes are added to the main routing table of the customer VPC and use one of the cross-link ENI as the next-hop for the route. It is important to keep in mind that the next-hop ENI used for the static routes will always be that of the ESXi host which houses the active edge of the SDDC. This means that if the edge were to migrate to a different host (as happens during a failover event or whenever the SDDC is upgraded) then the next-hop of the static routes will be updated to reflect this change.



#### IPSec VPN
In the majority of setups, customers wish to maintain some sort of permanent means of direct connectivity between the SDDC and their on-premises environment. While options for permanent connectivity include IPSec VPN and AWS Direct Connect, for the purposes of this discussion, we’ll focus on IPSec VPN.

<figure>
  <img src="{{ '/book/illustrations/vmconaws/a-technical-overview/ipsecVPN.png' | relative_url }}">
  <figcaption>Figure 2: IPSec VPN</figcaption>
</figure>

IPSec VPN provides secure connectivity to the private IP address ranges of the SDDC, and is implemented with a tunnel to the edge router. There are 2 flavors of IPSec VPN available: policy-based VPN, and route-based VPN.

Policy-based VPN is typically the easiest solution to implement, but requires that the network administrator manually configure the tunnel to permit specific source and destination IP ranges through. From a routing perspective, policy-based VPN is akin to managing static routes on your network. While it is possible to configure redundant tunnels with policy-based VPN, there is no ability to automatically fail over between tunnels.

Route-based VPN is a bit more complex, involving the creation of virtual tunnel interfaces and BGP routing configurations, but is also much more flexible. With route-based VPN, you can create multiple, redundant tunnels and have BGP routing automatically fail over between them when needed. An additional benefit is that routing is dynamic, meaning that there is no need to manually adjust the IPSec configuration every time networks are added or removed from the SDDC.

One note on redundancy. 

In **Figure 2** above, we see 2 physical routers which are providing redundancy to the on-premises side of the connection, but both are terminating to the same edge within the SDDC. Although it isn’t obvious at first glance, the SDDC is providing redundancy as well albeit at a lower layer. In the case of the SDDC, the edge is a distributed router which is implemented across redundant appliances which reside on separate hosts of the SDDC. In the event of a failure of the primary appliance, the edge router function will activate on the secondary appliance. This redundancy mechanism is built directly into NSX and allows edge routers to failover transparently when needed.



#### Direct Connect
Under normal circumstances, customers will access their SDDC via the public internet; either directly to VM public IP addresses, or to private addresses via IPSec VPN. Often times, however, customers wish to avoid using their public internet provider for connectivity to the SDDC. For these cases, AWS offers [Direct Connect]({{ site.data.links.aws.dx }}), which provides direct connectivity into an AWS region via private leased lines. With Direct Connect, users will define virtual interfaces ([VIF]({{ site.data.links.aws.dx_vif }})) which allow them to connect to public or private resources within that Region. These VIFs come in 2 flavors: Public and Private.
 

Public VIF enables the Direct Connect to be used for accessing the AWS public network. When Public VIF is used, the Direct Connect will become the preferred path for reaching AWS public IP addresses. This means that if IPSec VPN is being used to access the SDDC, then it will ride over the Direct Connect (assuming the VPN peering is done via the edge public IP).


Private VIF, on the other hand, enables Direct Connect to be used for accessing the private IP address space of a VPC. When a Private VIF is associated to an SDDC, then it becomes possible to access the SDDC directly without the need for IPSec VPN (although you can use IPSec VPN over Private VIF is so desired).

Lets explore this in more detail.


##### Public VIF
Public VIF enables a Direct Connect to be used for accessing the public IP address space of  the AWS network. Let's look into the details of how this is implemented.

Normally, customers will have one or more public internet circuits over which they will receive either default routes, or specific BGP prefixes. These circuits are used to access the public IP address space which AWS advertises to its upstream internet providers. In this example, the on-premises router is receiving a default route to the internet.

<figure>
  <img src="{{ '/book/illustrations/vmconaws/a-technical-overview/dxPublicVIF.png' | relative_url }}">
  <figcaption>Figure 3: Public VIF</figcaption>
</figure>


When Direct Connect is enabled, and a Public VIF created, AWS will begin to announce all of their public IP prefixes, via BGP, over the Direct Connect. In this example, due to the specific routes being advertised by AWS, the customer network will prefer the Direct Connect as its path toward AWS public address space. This effectively means that the Direct Connect will be used when connecting to the public IP addresses allocated to the SDDC; for example, the public interface of the edge or the Elastic IP of vCenter.


One important consideration when using Public VIF is to keep in mind that the on-premises network must also be reachable via its own public IP address space. For larger customers with their own public IP ranges and BGP ASN, they may choose to advertise this address space to AWS over the Direct Connect. Doing so will ensure that routing between the customer on-premises environment and AWS is symmetrical, and rides exclusively over the Direct Connect. However, the average AWS customer either does not have their own BGP ASN and public IP ranges, or does not want to advertise them over the Direct Connect.
 

For these cases, customers may submit a request to AWS for a public IP. AWS will then allocate an IP from their own public address space which may be used by the customer for their end of the connection. It is important to note that in these cases customers must set up NAT such that all traffic originating from their end ( which uses the Public VIF) is NAT-ted to that public IP. A common mistake is to forget to configure NAT, and in these cases customers will end up routing traffic into the AWS public network which is sourced from their internal private IPs. In this scenario, AWS will drop the traffic, and the end result will be that AWS public address space will be unreachable from the customer environment.



##### Private VIF
The standard means of accessing the private address space of an SDDC is via IPSec VPN. This VPN creates a secure virtual tunnel directly between the customer on-premises and the SDDC, either over the public internet or atop Direct Connect Public VIF. Direct Connect Private VIF provides an alternative to IPSec VPN by enabling a direct routed path between the customer on-premises network and a VPC within the AWS environment.

<figure>
  <img src="{{ '/book/illustrations/vmconaws/a-technical-overview/dxPrivateVIF.png' | relative_url }}">
  <figcaption>Figure 4: Private VIF</figcaption>
</figure>

As mentioned previously, each SDDC resides within a dedicated VPC which is owned by a master VMware account. Because the SDDC resides within a VPC, it is possible to terminate Direct Connect Private VIF directly to that VPC. In order to use Direct Connect with an SDDC, **customers must specifically link the Private VIF to the VMware AWS account used by the SDDC**. This account information is documented within the Network & Security tab of the SDDC within the VMC console.

Once the VIF has been terminated, the SDDC begins advertising routes through the Private VIF via BGP. The customer on-premises router should also be configured to advertise routes (representing the customer private address space) to the SDDC. As a general rule, the best practice is to advertise specific routes into the Direct Connect from the on-premises network instead of advertising a default route.

As seen in **Figure 4** above, the edge routers of the SDDC are in-path for Direct Connect. This means that gateway firewalls are enforcing security and that the security policies of the SDDC must be configured to permit connectivity to and from the on-premises environment.
 
There is one important exception to this rule, however. Due to the fact that the ESXi hosts themselves reside at the base-layer of the infrastructure, two of their interfaces are directly connected to Subnets of the underlying VPC. Specifically, the management and vMotion interfaces. For these interfaces, the path through the Direct Connect will bypass the edge routers of the SDDC. This means that security between the on-premises network and the ESXi hosts must be enforced on the on-premises side of the Direct Connect. Again, this scenario only applies to Direct Connect Private VIF and does not apply to users of IPSec VPN.



<h2 id="workload-onboarding">Workload Onboarding</h2>

In this section we will discuss the high-level process for the two most popular methods of getting workloads into an SDDC. 


#### Greenfield Deployment
A greenfield deployment operates on the notion that the SDDC is a completely new environment; all workloads will be created from scratch and the environment will utilize previously unused IP address ranges. The high-level process is as follows:

1. Allocate IP address space for the SDDC - Determine the IP supernet which you will use for the SDDC as a whole. Carve out a portion of this range for the Management Network (the first /20 is a common practice). The remainder may be used piecemeal by the Compute Network. If not already done, then allocate an IP address range for use by the AWS [VPC]({{ site.data.links.aws.vpc_subnets }}) which will be used for cross-linking to this SDDC. 

2. Deploy the SDDC and establish secure connectivity - Once a subnet has been allocated for the Management Network of the SDDC, and the cross-link VPC created, then the SDDC may be deployed. Once the SDDC is online, establish secure connectivity to it via IPSec VPN or Direct Connect. If this is a stand-alone environment, then there may be no need to establish secure connectivity. Instead, vCenter may be accessed directly by its public IP address (see the next step).

3. Configure the security policies of the SDDC - The gateway firewalls of the SDDC are set up with a "default deny" policy, and apply restrictions both inbound and outbound. Access to both the Management and Compute networks must be explicitly permitted. Adjust the security policies of these firewalls to permit, at a minimum, access to vCenter. We should also permit vCenter to initiate communications outbound if we intend to allow it to perform downloads (see next step).

4. Procure content for workload deployment - In order to deploy workloads, we will need to get ISO or OVA images into vCenter. Content Libraries are an easy means of accomplishing this, and allow us to download files directly from the web or to sync with another vCenter server's Content Library.

5. Create network segments - Drawing from the address space we allocated to the SDDC, create at least 1 network segment on the Compute Network. This will be used to provide the new workloads with network connectivity.

6. Deploy workloads - Finally, deploy workloads from images in the Content Library and attach them to the network segment(s) created previously.



#### Data Center Evacuation with HCX
Data center evacuation is common scenario in which an existing data center must be shut down, and all workloads migrated into a new facility.
 In addition to deadlines for the evacuation, there are often constraints in place which dictate how the migration may be performed.
 Requirements such as, specifying that workloads retain their IP addresses or that migrations may only be performed during certain hours, are common examples which complicate data center evacuations.

In order to address data center evacuation scenarios, VMware has developed a tool named [HCX](https://hcx.vmware.com) which enables transparent workload migration between sites.
 HCX has been specifically designed to address complex migration scenarios, and includes features such as:


* Migration scheduling - which enables migrations to be scheduled off-hours.
* WAN optimization and data de-deduplication - which greatly reduces the time and network bandwidth required to perform migrations.
* [Layer-2](https://en.wikipedia.org/wiki/Data_link_layer) network extension - which enables workloads to migrate without requiring IP address changes.

An additional bonus of HCX is that it is free for use with VMware Cloud on AWS.

The high-level process for an HCX migration is as follows:

1. Activate HCX - Once an SDDC has been deployed, HCX may be activated on it from the "add-ons" tab of the SDDC in the [VMC console]({{ site.data.links.vmw.vmc }}). The activation process will deploy the cloud-side components within the SDDC and will provide a download link for the on-premises components. Once the on-premises components are installed and configured, then migrations may begin.

2. Extend networks to the SDDC - Network extension enables workloads to migrate to an SDDC, without changing their IP addresses, by creating a duplicate version of the network within the SDDC and creating a layer-2] tunnel between it and the on-premises network. If there is no need to retain workload IP addressing, then this step may be skipped.

3. Migrate workloads - Once HCX is operational, and network extensions are in place, then workloads may either be live-migrated or bulk (warm) migrated to the SDDC. These migrations may occur over the course of days or weeks if needed.

4. Configure the security policies of the SDDC - Once workloads have been migrated, the next step is to prepare for a final network cutover by configuring the security policies of the Compute Network gateway firewall. This is done to ensure uninterrupted access to the workloads post-cutover.

5. Perform final network cutover - A network cutover is the process of making the SDDC the authority for networks used by migrated workloads. This involves tearing down the network extension to the on-premises environment, making the networks routable within the SDDC, and ensuring that the networks are reachable remotely. HCX will automate the first 2 items, but it is up to the end user to perform any actions necessary to ensure that migrated networks are reachable remotely. Generally, this will involve shutting down the on-premises versions of the networks and adjusting IPSec or Direct Connect configurations to accept the announced routes from the SDDC.



<h2 id="disaster-recovery">Disaster Recovery</h2>

The term "disaster recovery" is somewhat generic, and may mean different things to different people. For the purposes of discussion, we will define it as the ability to recreate the workloads of a production data center in a backup site.


#### Disaster Recovery Services
Currently, VMware offers two services for configuring an SDDC as a DR site: Site Recovery and HCX.

[Site Recovery]({{ site.data.links.vmw.site_recovery }}) is a specialized tool which has been designed specifically for disaster recovery.
 It provides workload replication (via vSphere Replication) between sites and offers support for advanced recovery plans.
 Site Recovery is offered as a service within VMware Cloud, and cloud-side deployment is as simple as activating the service within an SDDC.

[HCX]({{ site.data.links.vmw.hcx }}) is a tool which has been designed specifically for workload migration between sites.
 It provides workload replication (via vSphere Replication) between sites and also provides WAN optimization for replication traffic and layer-2 network extension.
 While not designed specifically as a disaster recovery tool, HCX does provide a basic disaster recovery service.
 However, HCX does not currently support the advanced recovery plans as are available with Site Recovery.



#### Preparation and Initial Setup
Disaster recovery in VMware Cloud on AWS may be accomplished using either the HCX or the Site Recovery services.
 With these services, it becomes possible to utilize an SDDC as a recovery site for another production site (or another SDDC).
 When preparing to implement disaster recovery within [VMware Cloud]({{ site.data.links.vmw.vmc }}), the following high-level process will apply:

1. Select and activate the service - As with all cloud services, both HCX and Site Recovery must be activated within the SDDC before they may be used.
 Both HCX and Site Recovery require cloud-side components as well as components in the the on-premises environment. While the installation within the SDDC is automated, the end user is required to install and configure the on-premises portions of the service.

2. Adjust security policy of the SDDC - For both HCX and Site Recovery, the on-premises components must be able to communicate with the cloud-side components.
 In order for this to happen, it is important that the gateway firewall of the SDDC’s Management Network be configured to permit the connectivity.

3. Install critical services within the SDDC - It is a good practice to provide the SDDC local access to certain critical services such as DNS and Active Directory.
 For this, a dedicated network should be created for these services which is always-on and reachable from the primary site.
 These services should always be in-sync with their counterparts in the primary site. In the primary site, these services should not be protected by the disaster recovery service.

4. Develop a recovery plan - Once the DR site is online and disaster recovery services have been configured, the next step will be to develop a recovery plan.
 Here are a few considerations to keep in mind when developing this plan:
    * What level of failures do I need to account for? Application-level, VM-level, or site-level?
    * Do VMs need to keep their IP addresses in the recovery site, or should their IP addresses change?
    * How will I trigger and execute a recovery plan?
    * What critical services must be updated as part of the recovery plan?
    * What portions of the recovery plan will be automated vs manual?
    * How will users access the recovery site?



<h2 id="logging-and-monitoring">Logging and Monitoring</h2>


Logging within VMware Cloud is provided via the [Log Intelligence]({{ site.data.links.vmw.lint }}) service.
 This service is activated at the Org level within VMware Cloud, and is offered in free as well as paid tiers.

The following table highlights the key features of the free tier.

Feature                   | Notes
--------------------------|----------
Audit Log Collection      | Unlimited
Non-Audit Log Collection  | 1 GB/Day
Log Retention             | 7 Days
Visualization (Dashboard) |
Search and Save Query     |

The free tier offers users a means of searching visualizing audit logs (i.e. logs from the SDDC infrastructure) as well as a small amount of non-audit logs.
 When the service is initially activated, users will gain access to a 30-day free trial for the paid tier of the service.
 This paid tier offers features such as longer log retention, unlimited non-audit logging, long-term archival, alerting, log forwarding, and more.
 At the end of the 30-day trial, the service will drop down to the free tier unless users opt to continue with the paid tier.



<h2 id="preparing-to-on-board">Preparing to On-Board</h2>


#### Pre-Flight Checklist
Use the following checklist to help ensure that you are properly prepared to complete the on-boarding process. See the below sections for additional details on checklist items.

- [ ] Identify personnel who are necessary to complete the on-boarding process and deploy an SDDC.
- [ ] Ensure that the VMware Cloud On AWS account has been fully funded.
- [ ] Identify or create an AWS account and ensure that all technical personnel have access to the account.
- [ ] Identify an AWS account for use in linking to VMware Cloud services.
- [ ] Identify a VPC and Subnet within the AWS account to use for cross-linking to the SDDC.
- [ ] Plan and allocate IP ranges for the SDDC, and determine a DNS strategy.
- [ ] Plan connectivity to the SDDC.
- [ ] Plan the network security policy for the SDDC
- [ ] Determine a strategy for workload on-boarding or disaster recovery



#### Personnel Required for On-Boarding
A critical first step in the planning process is to identify personnel (both technical and non-technical) who will be involved in the initial on-boarding process as well as those personnel who will be involved in the actual deployment of an SDDC. The following is a list of common "roles" required to activate the service and deploy an SDDC. Note that a single person may encompass more than one role.

* Fund Owner - Required to provide funding for VMware Cloud services and initiate the activation process. The Fund Owner must have an account on my.vmware.com, and all required fields of the account profile must be filled in. Especially important is the email address of this user since this email address will be used as the recipient of the activation email.
* AWS admin - Required to ensure that at least 1 user is created with the permissions necessary to run the CloudFormation template used for account linking.
* Cloud admin - Performs all planning for the deployment of the SDDC. Performs the deployment of the SDDC. Performs the initial account linking to the AWS account.
* Network admin - Allocates IP ranges needed for the deployment of the SDDC. Plans and implements connectivity from the on-premises environment to the SDDC.
* Security admin - Reviews and approves security policy for the SDDC.

 
 
#### Account Funding
The VMware cloud services account must be properly funded prior to on-boarding. Accounts will have a primary contact, known as the Fund Owner, who is the person financially associated with the cloud services Organization. Not only must the Fund Owner have an active account on my.vmware.com, but all required fields of the account profile for this account must be fully completed. If the account profile of the Fund Owner is not completely populated as required, then on-boarding cannot be completed.

Once the Fund Owner has completed their my.vmware.com profile, the next step is to fund the account. Only accounts which have been fully funded and associated with the Fund Owner will be able to activate the service and deploy an SDDC. The VMware Account Manager or Customer Success Manager can assist with the account funding process.

 

#### AWS Account
One of the requirements of the VMware Cloud On AWS service is that all deployed SDDCs be linked to a customer's dedicated  AWS account. If there is a preexisting account then it may be used for the cross-linking. However, if there is no account in place then one must be created prior to on-boarding.

Once an AWS account has been identified, then the next step is to ensure that all technical personnel have been added to the account and that they have been configured with the permissions necessary to properly manage the account. At minimum, there must be one user within the AWS account who has sufficient permissions to execute the CloudFormation template which performs the cross-linking to the SDDC.

 
 
#### VPC and Subnet Selection
Within the AWS region targeted for the SDDC deployment, a VPC and Subnet are required in order to facilitate cross-linking to the SDDC. Here are some things to consider when selecting these resources:
* The choice of subnet will determine the Availability Zone (AZ) in which the SDDC will be deployed. The SDDC will be deployed within the same AZ as this subnet.
* As part of the SDDC deployment, a series of ENIs will be created for use by the hosts of the SDDC. It is recommended that a dedicated subnet be chosen to facilitate the account linking, and that the subnet be large enough to facilitate 1 IP address for every current (and future) host of the SDDC. Typically, a /26 is recommended.
* These ENIs exist within the customer account, and the customer has full access to apply security groups to them or to delete them outright. These actions can permanently undermine connectivity between the AWS environment and the SDDC.
* Traffic between the SDDC and the AWS environment will not be billable if the traffic stays within the same AZ; cross-AZ traffic will be billable. This is per the normal [billing policies](https://aws.amazon.com/govcloud-us/pricing/data-transfer/) for details) of AWS.



#### IP and DNS Planning
An SDDC does not exist in isolation; at minimum it will be integrated with resources within AWS, but it will very likely also integrate with an on-premises environment. In some ways you can think of each SDDC you create as if it were just another remote facility. In that sense you should think about IP address management just as you would with any other traditional data center.

As part of the SDDC deployment process you are required to specify an IP range which will be used for the Management Network of the SDDC. The choice of address space is extremely important since it cannot be changed without destroying the entire SDDC and rebuilding it from scratch. Here are some considerations when deciding upon the address space to use:
* Size - The range needs to be large enough to facilitate all hosts which will be deployed on day 1, but also must account for future growth. See the User Guide for more information on sizing for the management subnet.
* Uniqueness - You should ideally provision an IP range which is unique within your organization. This is particularly important if you will be connecting to your SDDC via a VPN or Direct Connect, or if you are cross-linking to a production VPC.
* Ability to summarize - Ideally this block should be a subnet of some larger space which is allocated to the SDDC as a whole. By subnetting a larger dedicated supernet you will gain the ability to simplify routing between your on-premises environment and the SDDC, and you will potentially simplify network security policies used to secure the SDDC.

Another important aspect to consider is DNS services within the SDDC. By default, the SDDC is configured to used public DNS severs, however, these settings may be changed. Here are a few key considerations for planning DNS services for the SDDC:

* The DNS servers must be reachable; either via public IPs or via the cross-linked VPC or the on-premise environment. DNS servers may also be deployed within the SDDC itself.
* The DNS servers must support recursive queries.
* The SDDC is pre-configured to internally resolve hosts within the vmc.local domain. All other domains require an external DNS server.
* Network segments within the Compute Network which have DHCP enabled will use the DNS servers configured on the SDDC.

 
 
#### Planning Connectivity to the SDDC
You may think of each SDDC as an independent island which is isolated from the world. As such, one of the first post-deployment tasks you should undertake is to establish external connectivity to the SDDC.  There are a few strategies for connecting to an SDDC, and prior to deploying an SDDC you will need to decide upon one of these strategies and coordinate any internal resources required to implement that strategy. 

Some examples of possible internal resources required per strategy are as follows:
* Direct Access via public vCenter public IP - May require review by a security administrator or may require a security administrator to permit access through on-premises firewalls.
* IPSec VPN - Will require a network or security administrator to configure the IPSec VPN and configure routing through the VPN.
* Direct Connect - Will require an AWS admin to provision Direct Connect [Private VIF](https://docs.aws.amazon.com/directconnect/latest/UserGuide/WorkingWithVirtualInterfaces.html). May require a network administrator to configure routing on the on-premises network.



#### Planning Network Security Policy
By default, the gateway firewalls of the SDDC are configured to deny all traffic. Firewall rules must be specifically created to permit access; this includes both traffic to and from the public internet as well as traffic between the cross-linked VPC and any VPNs or Direct Connects which have been configured. As such, and important part of the planning process is to determine a basic security policy for use within the SDDC. Here are some things to consider:
* Determine who within your organization is required to review and approve security policy decisions.
* Determine how the SDDC will be accessed remotely, from where, and what source/destination IP addresses and TCP/UDP ports are required to facilitate the connectivity.
* Determine what services will be accessed within the on-premises and AWS environments from workloads within the SDDC.
* Understand that the gateway firewalls filter traffic in both directions. This means that security policy must be explicitly defined for inbound requests as well as for outbound requests initiated from the SDDC.

