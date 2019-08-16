---
layout: chapter
---

<section markdown="1" id="overview">
## Overview
The following sections discuss the on-boarding process for VMware Cloud on AWS. While the exact requirements for considering a given SDDC as "production-ready" vary greatly between organizations, this guide will attempt to capture the most common. 


Plans are exportable to CSV format which may be imported into a spreadsheet application.
</section>




<section markdown="1" id="pre-on-boarding">
## Pre On-Boarding
The Pre On-Boarding phase of a project focuses on education and preparation. Note that steps which are marked as "required" must be completed before proceeding to the on-boarding phase.

<section markdown="1" id="pre-on-boarding-plan">
### Project Plan
The items in this plan are expanded upon in the sections below.

<figure markdown="1" class="full-width">

Task | Required | Comments
-----|----------|---------
Review on-boarding presentations. | no | https://www.youtube.com/playlist?list=PLJNlZUnysgHHc72wp34SA2-4AjUtgwA91
Review user guide. | no | https://docs.vmware.com/en/VMware-Cloud-on-AWS/index.html
Review hands-on guide. | no | https://dspinhirne.github.io/vmcbook/
Identify personnel required for on-boarding. | yes | 
Fund User/Owner has completed user profile in my.vmware.com account. | yes | All required fields in profile must be populated or activation will fail.
Identify or create a customer-owned AWS account. | yes | This is required as a means of providing the SDDC with access to AWS services.
Review CloundFormation Template used for account linking.  | no | This may be required depending on the security policies of your organization. Details of this template may be found in the official user guide.
Identify AWS region for SDDC deployment. | yes | 
Identify or create VPC within above region which is to be used for SDDC cross-linking. | yes |
Identify or create a dedicated subnet in the desired availability zone within above VPC. | yes | This is for SDDC Cross-Account ENIs. Dedicated /26 minimum.
Identify SDDC Management IP subnet. | yes | /23 scales to 27 hosts, /20 scales to 251 hosts. This subnet is exlusively for management and may not be carved up or otherwise used by compute workloads.
Identify SDDC Compute network IP address range(s). | no | This is for network segments in the compute network. minimum /30, maxiumum /22 per segment. This is not required to deploy the SDDC, but is required in order to deploy workloads.
Identify strategy for integrating custom DNS servers with the SDDC. | no | SDDC uses public DNS by default. This is step is needed if your workloads need name resolution for IP address space which is private to your organization.
Identify strategy for connectivity to the SDDC (i.e. IPSec VPN or Direct Connect) | no | This is not required in order to deploy the SDDC, is required in order to use the SDDC.
Plan network security policy for SDDC Management and Compute networks. | no | This is not required in order to deploy the SDDC, is required in order to use the SDDC.

<button onclick="exportCSV('pre-on-boarding-plan')" style="float:right;">Export</button>
</figure>
</section>

<section markdown="1" id="personnel">
### Personnel Required for On-Boarding
A critical first step in the planning process is to identify personnel (both technical and non-technical) who will be involved in the initial on-boarding process as well as those personnel who will be involved in the actual deployment of an SDDC. The following is a list of common "roles" required to activate the service and deploy an SDDC. Note that a single person may encompass more than one role.

* Fund Owner - Required to provide funding for VMware Cloud services and initiate the activation process. The Fund Owner must have an account on my.vmware.com, and all required fields of the account profile must be filled in. Especially important is the email address of this user since this email address will be used as the recipient of the activation email.
* AWS admin - Required to ensure that at least 1 user is created with the permissions necessary to run the CloudFormation template used for account linking. Account linking is performed when you deploy the first SDDC.
* Cloud admin - Performs all planning for the deployment of the SDDC. Performs the deployment of the SDDC. Performs the initial account linking to the AWS account.
* Network admin - Allocates IP ranges needed for the deployment of the SDDC. Plans and implements connectivity from the on-premises environment to the SDDC.
* Security admin - Reviews and approves security policy for the SDDC.

</section>
 
<section markdown="1" id="acct-funding">
### Account Funding
The VMware cloud services account must be properly funded prior to on-boarding. Accounts will have a primary contact, known as the Fund Owner, who is the person financially associated with the cloud services Organization. Not only must the Fund Owner have an active account on my.vmware.com, but all required fields of the account profile for this account must be fully completed. If the account profile of the Fund Owner is not completely populated as required, then on-boarding cannot be completed.

Once the Fund Owner has completed their my.vmware.com profile, the next step is to fund the account. Only accounts which have been fully funded and associated with the Fund Owner will be able to activate the service and deploy an SDDC. The VMware Account Manager or Customer Success Manager can assist with the account funding process.

</section>

<section markdown="1" id="aws-acct">
### Customer-Owned AWS Account
One of the requirements of the VMware Cloud On AWS service is that all deployed SDDCs be linked to a customer's AWS account. If there is a preexisting account then it may be used for this linking; however, if there is no account in place then one must be created prior to on-boarding.

Once an AWS account has been identified, then the next step is to ensure that all technical personnel have been added to the account and that they have been configured with the permissions necessary to properly manage the account. At minimum, there must be one user within the AWS account who has sufficient permissions to execute the CloudFormation template which performs account linking to the VMC ORG. The details of account linking are discussed in the chapter A Technical Overview.

</section>

<section markdown="1" id="region-vpc-subnet-selection">
### Region, VPC, and Subnet Selection
Each SDDC will be deployed within a specific AWS region. Within this region, a VPC and Subnet are required in order to facilitate cross-linking to the SDDC. Here are some things to consider when selecting these resources:
* The choice of subnet will determine the Availability Zone (AZ) in which the SDDC will be deployed. The base cluster of the SDDC will be deployed within the same AZ as this subnet.
* As part of the SDDC deployment, a series of Cross-Account ENIs will be created for use by the hosts of the SDDC. It is recommended that a dedicated subnet be chosen to facilitate the account linking and that the subnet be large enough to facilitate 1 IP address for every current (and future) host of the SDDC. Typically, a dedicated /26 is recommended.
* The Cross-Account ENIs exist within the customer-owned AWS account, and the customer has full access to apply security groups to them or to delete them outright. These actions can permanently undermine connectivity between the AWS environment and the SDDC.
* Traffic between the SDDC and the AWS environment will not be billable if the traffic stays within the same AZ; cross-AZ traffic will be billable to the customer-owned AWS account. This is per the normal [billing policies](https://aws.amazon.com/govcloud-us/pricing/data-transfer/) for details) of AWS.

</section>

<section markdown="1" id="ip-and-dns-planning">
### IP and DNS Planning
An SDDC does not exist in isolation; at minimum it will be integrated with resources within AWS, but it will very likely also integrate with an on-premises environment. In some ways you can think of each SDDC you create as if it were just another remote facility. In that sense you should think about IP address management just as you would with any other traditional data center.

As part of the SDDC deployment process you are required to specify an IP range which will be used for the Management Network of the SDDC. The choice of address space is extremely important since it cannot be changed without destroying the entire SDDC and rebuilding it from scratch. Here are some considerations when deciding upon the address space to use:
* Size - The range needs to be large enough to facilitate all hosts which will be deployed on day 1, but also must account for future growth. See the User Guide for more information on sizing for the management subnet.
* Uniqueness - You should ideally provision an IP range which is unique within your organization. This is particularly important if you will be connecting to your SDDC via a VPN or Direct Connect, or if you are cross-linking to a production VPC.
* Ability to summarize - Ideally this block should be a subnet of some larger space which is allocated to the SDDC as a whole. By subnetting a larger dedicated supernet you will gain the ability to simplify routing between your on-premises environment and the SDDC, and you will potentially simplify network security policies used to secure the SDDC.

Another important aspect to consider are DNS services within the SDDC. By default, the SDDC is configured to used public DNS severs. These settings may be changed, however. Here are a few key considerations for planning DNS services for the SDDC:

* The DNS servers must be reachable; either via public IPs or via the cross-linked VPC or IPSec/DirectConnect to the on-premise environment. DNS servers may also be deployed within the SDDC itself.
* The DNS servers must support recursive queries.
* The SDDC is pre-configured to internally resolve hosts within the vmc.local domain. All other domains require an external DNS server.
* Network segments within the Compute Network which have DHCP enabled will use the DNS servers configured on the SDDC.

</section>
 
<section markdown="1" id="planning-connectivity">
### Planning Connectivity to the SDDC
You may think of each SDDC as an independent island which is isolated from the world. As such, one of the first post-deployment tasks you should undertake is to establish external connectivity to the SDDC.  There are a few strategies for connecting to an SDDC, and prior to deploying an SDDC you will need to decide upon one of these strategies and coordinate any internal resources required to implement that strategy. 

Some examples of possible internal resources required per strategy are as follows:
* Direct Access via public vCenter public IP - May require review by a security administrator or may require a security administrator to permit access through on-premises firewalls.
* IPSec VPN - Will require a network or security administrator to configure the IPSec VPN and configure routing through the VPN.
* Direct Connect - Will require an AWS admin to provision Direct Connect [Private VIF](https://docs.aws.amazon.com/directconnect/latest/UserGuide/WorkingWithVirtualInterfaces.html). May require a network administrator to configure routing on the on-premises network.

</section>

<section markdown="1" id="security">
### Network Security
By default, the gateway firewalls of the SDDC are configured to deny all traffic. Firewall rules must be specifically created to permit access. This includes both traffic to and from the public internet as well as traffic between the cross-linked VPC and any VPNs or Direct Connects which have been configured. Due to the locked-down nature of the SDDC, an important part of the planning process is to determine a basic security policy for use within the SDDC. 

Here are some things to consider:
* Determine who within your organization is required to review and approve security policy decisions.
* Determine how the SDDC will be accessed remotely, from where, and what source/destination IP addresses and TCP/UDP ports are required to facilitate the connectivity.
* Determine what services will be accessed within the on-premises and AWS environments from workloads within the SDDC.
* Understand that the gateway firewalls filter traffic in both directions. This means that security policy must be explicitly defined for inbound requests as well as for outbound requests initiated from the SDDC.

</section>

</section>




<section markdown="1" id="on-boarding">
## On-Boarding
On-Boarding focuses on service activation and the initial SDDC deployment. Note that steps which are marked as "required" must be completed before the SDDC may be used.

<figure markdown="1" class="full-width" id="on-boarding-plan">

Task | Required | Comments
-----|----------|---------
Activate VMware cloud services Organization (Org). | yes | 
Create Term Subscription. | no | The hosts of the SDDC are billed at an on-demand rate unless this is completed.
Deploy the SDDC with information gathered during pre on-boarding stage. | yes | Requires customer AWS account for linking, target AWS region for SDDC, cross-link VPC and subnet, and SDDC management IP range.
  
<button onclick="exportCSV('on-boarding-plan')" style="float:right;">Export</button>
<figcaption>Project Plan</figcaption>
</figure>

</section>




<section markdown="1" id="post-on-boarding">
## Post On-Boarding
Once an SDDC has been deployed, the next step is to focus on all of the tasks which are required in order to use the SDDC. The required/optional status of the tasks here greatly depend on the business cases being addressed by VMware Cloud on AWS.

<section markdown="1" id="post-on-boarding-plan">
### Project Plan
<figure markdown="1" class="full-width">

Task | Required | Comments
-----|----------|---------
Create Compute network segment(s) within the SDDC. | yes | Needed in order to deploy workloads. These may be created by HCX if you are migrating workloads.
Implement secure connectivity to the SDDC. | yes | Generally this will either be IPSec VPN or Direct Connect. See project plans for these below.
Implement network security plan. | yes | You must permit traffic through the firewalls of the SDDC in order to use the SDDC.
Plan HCX deployment | no | This is for migration use cases only. See chapter on HCX planning.
  
<button onclick="exportCSV('post-on-boarding-plan')" style="float:right;">Export</button>
</figure>
</section>

<section markdown="1" id="ipsec-vpn">
### IPSec VPN
Tasks for IPSec VPN are only required if you plan on implementing it.

<figure markdown="1" class="full-width">

Task | Required | Comments
-----|----------|---------
Identify VPN type to create | yes | Options are policy-based or route-based. Follow respective project plan below.
Identify VPN endpoint(s) to connect to SDDC edge. | yes | The public IP(s) of your end of the VPN.

<button onclick="exportCSV('ipsec-vpn')" style="float:right;">Export</button>
<figcaption>General Plan</figcaption>
</figure>


<figure markdown="1" class="full-width" id="policy-ipsec-vpn-plan">

Task | Required | Comments
-----|----------|---------
Identify networks within SDDC to include within VPN. | yes | 
Identify remote networks to include within VPN policy. | yes | These are the networks which you wish to be reachable by the SDDC. 
Identify SDDC networks to include within VPN policy. | yes | These are the SDDC networks which you wish to be reachable from the remote network.
Create the policy-based VPN. | yes | 

<button onclick="exportCSV('policy-ipsec-vpn-plan')" style="float:right;">Export</button>
<figcaption>Policy-Based VPN</figcaption>
</figure>


<figure markdown="1" class="full-width" id="route-ipsec-vpn-plan">

Task | Required | Comments
-----|----------|---------
Identify BGP peering address space for the VTI(s). | yes | The address range for the point-to-point virtual link. Typically IPv4 link-local space is used for this. Consult the user guide to ensure that you do not ulitize link-local space which is used internally within the SDDC.
Identify BGP ASNs to be used for SDDC. | yes | BGP private ASN range 64512 - 655334. Ensure that this does not conflict with existing peers on your end of the VPN.
Identify on-prem routes to be advertised to the SDDC. | yes | Be aware that if you advertise default route to the SDDC that you will force all internet traffic through the VPN.
Create or adjust prefix-lists or other filters for BGP. | no | Although route filters are highly recommended with any BGP setup, this step depends on your existing setup.
Create the route-based VPN. | yes | 

<button onclick="exportCSV('route-ipsec-vpn-plan')" style="float:right;">Export</button>
<figcaption>Route-Based VPN</figcaption>
</figure>

</section>

<section markdown="1" id="dx">
### Direct Connect
Tasks for Direct Connect are only required if you plan on implementing it.

<figure markdown="1" class="full-width">

Task | Required | Comments
-----|----------|---------
Identify Direct Connect circuit(s) to be connect to the SDDC. | yes | These will exist in the customer AWS account.
Identify BGP peering address space for the Direct Connect Private VIF(s). | yes | The address range for the private VIF. Do not auto-assign these. Typically IPv4 link-local space is used for this. Consult the user guide to ensure that you do not ulitize link-local space which is used internally within the SDDC.
Identify BGP ASNs to be used for Direct Connect Private VIF(s). |  yes | BGP private ASN range 64512 - 655334. Ensure that this does not conflict with existing peers on your end of the VPN.
Identify on-prem routes to be advertised to the SDDC. | yes | Be aware that if you advertise default route to the SDDC that you will force all internet traffic through the direct connect.
Create or adjust prefix-lists or other filters for BGP. | no | Although route filters are highly recommended with any BGP setup, this step depends on your existing setup.
Create a private VIF on the direct connect for the SDDC. | yes | You must delegate this VIF to the VMware AWS account which is found under the direct connect dashboard of your SDDC.
Accept the direct connect within the SDDC | yes | Performed from the direct connect dashboard of your SDDC. May take several minutes to complete.

<button onclick="exportCSV('dx')" style="float:right;">Export</button>
</figure>

</section>


</section>
