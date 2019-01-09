---
layout: default
---

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
