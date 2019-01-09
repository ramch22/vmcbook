---
layout: default
---


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
