---
layout: chapter
---

<section markdown="1" id="introduction">
## Introduction

<section markdown="1" id="concepts">
### Concepts
[VMware Cloud on AWS]({{ site.data.links.vmw.vmcaws }}) is a managed cloud offering which provides dedicated VMware vSphere-based Software Defined Data Centers (SDDC) which are hosted within [AWS]({{ site.data.links.aws.aws }}) facilities. Prior to getting started with the service, it is critical to understand a few points.
* The service utilizes facilities and hardware which are owned and managed by AWS.
* The service provides dedicated, private cloud environments in the form of an SDDC.
* The hardware used for each SDDC is dedicated to that SDDC.
* SDDCs are deployed within a VMware-owned AWS account and VMware manages billing for these resources.
* SDDCs have high-speed access to AWS services hosted within a customer-owned AWS account.
* Native AWS services are billed to the customer-owned AWS account and are not handled by VMware.

Additionally, it is important to understand the *minimum* requirements for deploying an SDDC.
* You must have created a VMware Cloud Organization and provided funding for cloud services.
* You must have your own AWS account.
* You must know which AWS region you wish to host your SDDC.
* You must have a VPC and Subnet in that region to use for SDDC cross-linking (for SDDC access to AWS services).
* You must have a management IP subnet to use for the SDDC.

The following sections will provide additional details to all of the points above. 
</section>

<section markdown="1" id="vmc-org">
### The VMware Cloud Organization (Org)
The Org is the top-level "container" for all SDDCs. This topic is discussed in-depth in the chapter titled [Getting Started]({{ "/book/getting-started.html#the-vmware-cloud-organization" | relative_url }}).

</section>

<section markdown="1" id="aws-account">
### Amazon Web Services Account
A major benefit of the service is its ability to provide direct access to AWS services. As such, it is required that all customers maintain a dedicated AWS account which will be used to access and manage these services.  If you are unsure of how to create an AWS account, then please refer to the [AWS Documentation]({{ site.data.links.aws.create_acct }}) for more information on the process.

A few important points on the AWS account:

* The account is necessary in order to provide an SDDC with access to AWS services.
* It is required in order to deploy an SDDC.
* The account is owned by the customer, not by VMware.
* Billing for the account is handled directly by AWS, not by VMware

</section>

<section markdown="1" id="aws-regions">
### AWS Regional Availability
VMware Cloud on AWS is not available in all AWS regions. Please refer to the [roadmap]({{ site.data.links.vmw.vmcaws_roadmap }}) for a list of available regions.
</section>

<section markdown="1" id="sddc">
### Software Defined Data Center (SDDC)

The Software Defined Data Center (SDDC) is a collection of bare-metal hosts which are installed with a standard set of VMware software. It is important to understand that each SDDC is running atop dedicated hardware and that billing for an SDDC is based upon the number of hosts dedicated to the SDDC; not the number of VMs running within the SDDC.

Since VMware Cloud On AWS is a managed service, full admin-level access to the SDDC is not permitted. This restriction is in place to prevent customers from modifying the infrastructure of the SDDC itself.  Instead, customers are given a role which allows them to fully manage workloads which they have deployed within the SDDC. Normally, this permissions model does not impact day-to-day use of the service, however, it's important to keep in mind if you are planning on integrating tools directly with infrastructure components such as vCenter. If the integration you are planning requires admin rights, then it may not function properly. It is recommended to review the documentation for your specific application in order to understand its permission and access requirements.

<figure>
  <img src="{{ '/book/illustrations/vmconaws/a-technical-overview/sddc.png' | relative_url }}">
  <figcaption>Software Defined Data Center (SDDC)</figcaption>
</figure>


Key points to remember regarding the SDDC:
* It is deployed on dedicated, bare-metal hosts.
* It is Deployed with standard components (ESXi, vCenter, NSX, vSAN).
* Billing is based on the number of hosts within the SDDC, not on the number of VMs.
* Users have the ability to manage their workloads but have limited access to vCenter,vSAN, and NSX.

</section>

<section markdown="1" id="aws-service-integration">
### Integration with AWS Services

Each SDDC is provided direct access to AWS services via a connection to a customer-owned AWS account. This connection is established as part of the SDDC provisioning process and is performed using one of two methods:

* By choosing an AWS account which has previously been connected to another SDDC, or
* By creating a new connection to an AWS account

The term "connected" simply means that the customer has granted permissions for the VMware Cloud On AWS service to enable routing between an SDDC and a [VPC]({{ site.data.links.aws.vpc_subnets }}) within the customer-owned AWS account. These permissions are granted via [IAM]({{ site.data.links.aws.iam }}) roles which are created within the connected account using a [CloudFormation]({{ site.data.links.aws.cloudformation }}) template. It is important to note that the person who is performing the account connection process must have sufficient permissions (e.g. admin rights) within the AWS account in order to execute this CloudFormation template.

Key points to remember:
* AWS services are managed through a customer-owned AWS account.
* Account linking enables VMware Cloud services to cross-link SDDCs into a customer-owned AWS account.
* Account linking is performed when the user executes a CloudFormation template within their AWS account.
* The CloudFormation template creates roles which enable VMware to manage SDDC cross-linking.

Once a connection is established to the AWS account, it then becomes possible to configure a cross-link between an SDDC and a VPC within that account. The cross-link itself consists of a series of Cross-Account [Elastic Network Interfaces]({{ site.data.links.aws.eni }}) (ENI) which are attached to a Subnet within the VPC. It is these ENIs which provide the hosts of an SDDC with a network forwarding path to resources within the VPC. 

<figure>
  <img src="{{ '/book/illustrations/vmconaws/a-technical-overview/aws-service-integration.png' | relative_url }}">
  <figcaption>Integration with AWS Services</figcaption>
</figure>

The topic of SDDC cross-linking will be explored in more detail in [later chapters]({{ "/book/vmconaws/sddc-network-and-security/" | relative_url }}), but for now it is sufficient to keep the following in mind when selecting a VPC/Subnet for cross-linking:

* The VPC must exist within the same Region which is planned to house the SDDC.
* The Subnet must be sufficiently large to accommodate one ENI per host within the SDDC. Typically, a /26 is the minimum recommended size for the Subnet.
* Subnets are associated with an [Availability Zone]({{ site.data.links.aws.regions_az }}) (AZ), therefore the choice of Subnet determines the Availability Zone into which the base cluster of the SDDC is provisioned. The purpose of this is to avoid cross-AZ bandwidth charges between the SDDC and the Subnet used for cross-linking (see AWS [billing policies]({{ site.data.links.aws.data_transfer }}) for details).
* It is recommended to use a dedicated Subnet for cross-linking. The purpose of this is to ensure that IP addresses within the Subnet are not consumed by other services (e.g. other EC2 instances) thus preventing ENIs for new hosts from being added as the SDDC grows. Secondary to that, using a dedicated Subnet helps prevent the situation where an AWS admin accidentally deletes or otherwise modifies the ENIs used for cross-linking.
* It is possible to cross-link multiple SDDCs to the same AWS account. If you plan to do this, then it is vital to ensure that you do not create IP addressing conflicts by using overlapping IP address ranges between the SDDCs. This is particularly relevant if you plan to cross-link multiple SDDCs to the same VPC.

</section>

</section>




<section markdown="1" id="compute-and-storage">
## Compute and Storage

In order to prevent the users from modifying the infrastructure components of the SDDC, vCenter is configured to use Resource Pools and segmented vSAN Data Stores. The cloudAdmin role is granted permissions only to the resources designated for its use. The specifics for this setup are described below.

<section markdown="1" id="vc-resource-pools">
### vCenter Resource Pools

Resource management within vCenter is enforced through the use of Resource Pools. Using this model, infrastructure-level appliances exist within one Resource Pool while compute workloads exist within another. The cloudAdmin role does not have permissions to modify the resources within the management pool.

<figure>
  <img src="{{ '/book/illustrations/vmconaws/a-technical-overview/vcenter-rp.png' | relative_url }}">
  <figcaption>Resource Pools</figcaption>
</figure>

</section>

<section markdown="1" id="vsan-datastores">
### vSAN Datastores

Access to storage is managed using a similar model as Resource Pools. Within an SDDC, the vSAN cluster has been modified to present two logical Datastores; one for the infrastructure appliances, and another for compute workloads. As with the Resource Pool model, the cloudAdmin role does not have access to the Datastore used by the infrastructure appliances.

<figure>
  <img src="{{ '/book/illustrations/vmconaws/a-technical-overview/vcenter-ds.png' | relative_url }}">
  <figcaption>vSAN Datastores</figcaption>
</figure>

</section>

<section markdown="1" id="vsan-storage-policies">
### vSAN Storage Policies

Total usable storage within an SDDC is a function of a couple of variables. Firstly, the vSAN storage policy applied to VMs effects the amount of overhead required for data storage. Secondly, the ability of dedup & compressing to reduce the storage footprint plays a role.

Taking a look at the table below, we can see that each policy consists of a Failures to Tolerate setting and a Fault Tolerance Method.

<figure markdown="1">

FTT |  FTM  | Hosts Required | Required Capacity
----|-------|----------------|------------------
1   | RAID1 | 3              | 2X
1   | RAID5 | 4              | 1.33X
2   | RAID1 | 4              | 3X
2   | RAID6 | 6              | 1.5X
3   | RAID1 | 7              | 4X

  <figcaption>vSAN FTT/FTM Configurations</figcaption> 
</figure>

Each combination requires a certain minimum number of hosts and has an associated "cost" in terms of storage overhead required to implement. For example, we can see that the first policy in the table requires twice the storage space to implement the policy. This is because RAID1 mirroring is duplicated each storage object twice in order to implement the FTT value of 1.

With vSAN, it is required to have a default storage policy and it is this policy which is used by VMs that do not have a storage policy explicitly defined on them.
 The default storage policy for an SDDC uses an FTM of RAID1 with an FTT of 1.
 For SDDCs with 6 or more hosts, then an FTT of 2 will be used.

It should be noted that VMware will automatically add hosts to the SDDC when storage utilization crosses the 75% threshold, even when EDRS is disabled. This practice is a preventative measure designed to ensure that vSAN has a minimal amount of "slack" space available to it at all times.

Finally, the [VMC Sizer]({{ site.data.links.vmw.vmcaws_sizer }}) tool has been made available as a means of assisting customers with estimating the number of hosts required to meet their storage demands.

</section>


<section markdown="1" id="edrs">
### Elastic Distributed Resource Scheduler (EDRS)

EDRS is a feature which enables an SDDC to scale based on its resource utilization. With EDRS, when utilization remains consistently above any of the scale-out thresholds, then the SDDC will automatically add a host. Conversely, when utilization is consistently below any of the scale-in thresholds, then the SDDC will automatically remove a host.

EDRS supports two modes of operation: optimized for cost, or optimized for performance. The difference between the two variants has to do with how aggressively a scale-in or scale-out action occurs. When optimized for cost, the SDDC will be more conservative when scaling-out but more eager to scale-in. When optimized for performance, the opposite is true.

</section>

</section>




<section markdown="1" id="logging-and-monitoring">
## Logging and Monitoring

Logging within VMware Cloud is provided via the [Log Intelligence]({{ site.data.links.vmw.lint }}) service.
 This service is activated at the Org level within VMware Cloud and is offered in free as well as paid tiers.

The following table highlights the key features of the free tier.

<figure markdown="1">

Feature                   | Notes
--------------------------|----------
Audit Log Collection      | Unlimited
Non-Audit Log Collection  | 1 GB/Day
Log Retention             | 7 Days
Visualization (Dashboard) |
Search and Save Query     | 

<figcaption>LINT Free Tier</figcaption>
</figure>

The free tier offers users a means of searching visualizing audit logs (i.e. logs from the SDDC infrastructure) as well as a small amount of non-audit logs.
 When the service is initially activated, users will gain access to a 30-day free trial for the paid tier of the service.
 This paid tier offers features such as longer log retention, unlimited non-audit logging, long-term archival, alerting, log forwarding, and more.
 At the end of the 30-day trial, the service will drop down to the free tier unless users opt to continue with the paid tier.

</section>



<section markdown="1" id="vmotion-to-the-sddc">
## vMotion to the SDDC
In order to vMotion workloads from an on-premises network directly into the SDDC, it is required to "link" the on-premises vCenter with the vCenter within that SDDC. This is accomplished using a vCenter feature known as Hybrid Linked Mode (HLM). In addition to enabling vMotion, HLM will also provide a single UI which displays resources from both the on-premises environement and the SDDC. It also enables the syncronization of VM tags between sites. However, be aware that HLM does require that the on-premises vCenter meet certain minimum versioning requirements.

vMotion using HLM, while possible, also imposes certain restrictions such as requiring certain vDS versions in the on-premises vCenter and requiring a high-speed Direct Connect link for vMotion traffic. In the vast majority of cases, HCX provides a much better user experience for vMotion between sites and is the most commonly used solution.
</section>




<section markdown="1" id="ad-integration">
## Active Directory Integration
It is common for users to require Active Directory integration with the SDDC. This use case is supported in two ways:
* Using HLM, backed by an on-premises PSC service, which provides single sign-on for users.
* Adding an authentication source directly to vCenter within the SDDC. The authentication source may be either an on-premises service or hosted as a workload within the SDDC.

</section>




<section markdown="1" id="sddc-networking">
## SDDC Networking

<section markdown="1" id="sddc-network-architecture">
### Network Architecture
VMware utilizes [NSX-t]({{site.data.links.vmw.nsxt}}) to build a logical overlay network on top of the hardware hosts of the SDDC. There are 2 tiers of routing within the SDDC. At the top tier is the tier-0 edge router, which acts as the north-south gateway for the entire SDDC. Below that are the tier-1 routers (the MGW and CGW), which act as the north-south gateways for their respective networks. 

There are 2 layers of firewalling in the SDDC. The first layers is provided by the gateway firewalls, which are designed to protect the north-south border of the SDDC. The gateway firewalls have a "default deny" policy and are implemented at the MGW (for the management network) and at the tier-0 edge (for the compute network). The second layer of firewalling is provided by the distributed firewall. The distributed firewall is enforced at the vNIC level of every VM within the compute network and is designed to enable filtering both north-south and east-west. The distributed firewall is part of the NSX Advanced feature set and has a "default permit" policy. This policy effectively disables the distributed firewall unless the SDDC administrator specifically creates "deny" rules.

The routing and network security models of the SDDC are illustrated below.

<figure>
  <img src="{{ '/book/illustrations/vmconaws/a-technical-overview/sddc-networking.png' | relative_url }}">
  <figcaption>SDDC Network Architecture</figcaption>
</figure>

Additional details on the network and security model of the SDDC are covered in [later chapters]({{ "/book/vmconaws/sddc-network-and-security/" | relative_url }}) of this guide.
</section>

<section markdown="1" id="dns-and-dhcp">
### DNS and DHCP
DNS forwarding and caching services are provided to the SDDC via NSX. These services are implemented as a pair of DNS servers; one which serves the Management Network and another which serves the Compute Network. By default, these servers will forward requests to public DNS servers, however, users may configure custom DNS servers if so desired. For the Management Network, a single DNS server may be provided while for the Compute Network, multiple DNS servers may be specified (1 per DNS zone). It should be noted that DNS requests for the SDDC will appear to originate from the DNS service IPs. If custom DNS servers are configured within the SDDC, and these servers are protected by firewalls, then it will be important to ensure that the DNS service IPs are permitted through those firewalls.

NSX provides basic DHCP services to the Compute Network of the SDDC and these services are enabled on a per-segment basis at the time the segment is created. As part of the DHCP lease, clients will be provided the DNS service IP for the Compute Network as their DNS server.
</section>

<section markdown="1" id="ipsec-vpn">
### IPSec VPN
In the majority of setups, customers wish to maintain some sort of permanent means of direct connectivity between the SDDC and their on-premises environment. IPSec VPN is the most common means of accomplishing this. IPSec VPN provides secure connectivity to the private IP address ranges of the SDDC, and is implemented with a tunnel to the edge router. 

IPSec VPN is detailed in [later chapters]({{ "/book/vmconaws/sddc-network-and-security/" | relative_url }}) of this guide.
</section>

<section markdown="1" id="direct-connect">
### Direct Connect
For customers who want a high-speed private connection into their SDDC, VMware Cloud on AWS supports AWS [Direct Connect]({{ site.data.links.aws.dx }}). As with all AWS services, Direct Connect will be provisioned within the customer-owned AWS account. It is important to note that SDDCs may utilize **existing** Direct Connect services. There is no need to provision a dedicated Direct Connect for the SDDC. Utilizing a Direct Connect is the simple matter of provisioning a new [Private VIF]({{ site.data.links.aws.dx_vif }}) and then allocated it to the VMware-owned AWS account which is associated to the parent Org of the SDDC. This account is visible from the Direct Connect interface of the SDDC within the [VMC console]({{ site.data.links.vmw.vmc }}).

Direct Connect integration is detailed in [later chapters]({{ "/book/vmconaws/sddc-network-and-security/" | relative_url }}) of this guide.
</section>

<section markdown="1" id="ip-admin">
### The Importance of Proper IP Administration
All SDDCs will be cross-linked to a VPC within the customer-owned AWS account but may also be connected to other networks (such as an on-premises environment). In order to ensure that the SDDC can communicate with other interconnect networks, it is vital that IP addressing be properly planned. IP ranges should be unique and non-overlapping between the SDDC and any networks to which it will be connected. As such, one of the most critical pieces of the design process is proper planning of IP address usage.

Though not required, it is a good practice to allocate IP address space in large, contiguous chunks. The following table provides an example IP Administration plan.

<figure markdown="1">

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
</figure>
</section>

</section>




<section markdown="1" id="workload-onboarding">
## Workload On-Boarding

In this section we will discuss the high-level process for the two most popular methods of getting workloads into an SDDC. 

<section markdown="1" id="greenfield-deployment">
### Greenfield Deployment
A greenfield deployment operates on the notion that the SDDC is a completely new environment; all workloads will be created from scratch and the environment will utilize previously unused IP address ranges. The high-level process is as follows:

1. Allocate IP address space for the SDDC - Determine the IP supernet which you will use for the SDDC as a whole. Carve out a portion of this range for the Management Network (the first /20 is a common practice). The remainder may be used piecemeal by the Compute Network. 

2. Deploy the SDDC - Assuming all of the prerequisites have been met then the SDDC may be deployed. 

3. Establish secure connectivity - Once the SDDC is online, establish secure connectivity to it via IPSec VPN or Direct Connect. If this is a stand-alone environment then there may be no need to establish secure connectivity. In this case, vCenter may be accessed directly by its public IP address (see the next step).

4. Configure the security policies of the SDDC - The gateway firewalls of the SDDC are set up with a "default deny" policy and apply restrictions both inbound and outbound. Access to both the Management and Compute networks must be explicitly permitted. Adjust the security policies of these firewalls to permit, at a minimum, access to vCenter. We should also permit vCenter to initiate communications outbound if we intend to allow it to perform downloads (see next step).

5. Procure content for workload deployment - In order to deploy workloads, we will need to get ISO or OVA images into vCenter. Content Libraries are an easy means of accomplishing this and allow us to download files directly from the web or to sync with another vCenter server's Content Library.

6. Create network segments - Drawing from the address space we allocated to the SDDC, create at least 1 network segment on the Compute Network. This will be used to provide the new workloads with network connectivity.

7. Deploy workloads - Finally, deploy workloads from images in the Content Library and attach them to the network segment(s) created previously.

</section>

<section markdown="1" id="dc-evac-with-hcx">
### Data Center Evacuation with HCX
Data center evacuation is common scenario in which an existing data center must be shut down and all workloads migrated into a new facility. In addition to deadlines for the evacuation, there are often constraints in place which dictate how the migration may be performed. Requirements such as specifying that workloads retain their IP addresses or that migrations may only be performed during certain hours are common examples which complicate data center evacuations.

In order to address data center evacuation scenarios, VMware has developed a service named [HCX](https://hcx.vmware.com) which enables transparent workload migration between sites. HCX has been specifically designed to address complex migration scenarios and includes features such as:


* Migration scheduling - enables migrations to be scheduled off-hours.
* WAN optimization and data de-duplication - greatly reduces the time and network bandwidth required to perform migrations.
* [Layer-2](https://en.wikipedia.org/wiki/Data_link_layer) network extension - enables workloads to migrate without requiring IP address changes.

This service is discussed in detail within the [HCX]({{ "/book/cloud-services/hcx/" | relative_url}}) section of this guide.

</section>

</section>


<section markdown="1" id="disaster-recovery">
## Disaster Recovery

The term "disaster recovery" is somewhat generic, and may mean different things to different people. For the purposes of discussion, we will define it as the ability to recreate the workloads of a production data center in a backup site.

<section markdown="1" id="dr-services">
### Disaster Recovery Services
Currently, VMware offers two services for configuring an SDDC as a DR site:

* [Site Recovery]({{ site.data.links.vmw.site_recovery }}) is a specialized tool which has been designed specifically for disaster recovery. It provides workload replication (via vSphere Replication) between sites and offers support for advanced recovery plans. Site Recovery is offered as a service within VMware Cloud, and the cloud-side deployment is as simple as activating the service within an SDDC.

* [HCX]({{ site.data.links.vmw.hcx }}) is a tool which has been designed specifically for workload migration between sites. It provides workload replication (via vSphere Replication) between sites and also provides WAN optimization for replication traffic as well as layer-2 network extension. While not designed specifically as a disaster recovery tool, HCX does provide a basic disaster recovery service. However, HCX does not currently support the advanced recovery plans that are available with Site Recovery.

</section>

<section markdown="1" id="dr-prep-and-setup">
### Preparation and Initial Setup
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

</section>

</section>
