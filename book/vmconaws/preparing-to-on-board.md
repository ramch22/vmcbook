---
layout: chapter
---

<section markdown="1" id="usage">
## Usage
The following sections provide sample project plans for deploying various aspects of VMware Cloud on AWS. You should utilize these project plans to help ensure that you are properly prepared to complete the on-boarding process. While not all plans may be relevant to your specific needs, the plans for Pre On-Boarding, On-Boarding, and Security should be reviewed by everyone.

Plans are exportable to CSV format which may be imported into a spreadsheet application.
</section>




<section markdown="1" id="pre-on-boarding">
## Pre On-Boarding
The Pre On-Boarding phase of the project focuses on education and preparation. Please take the time to review the recommended reading materials and videos.

<section markdown="1" id="pre-on-boarding-plan">
### Project Plan
<figure markdown="1" class="full-width">

Owner | Due Date | Status | Task | Comments
------|----------|--------|------|---------
      |          |        | Review on-boarding presentations. | https://www.youtube.com/playlist?list=PLJNlZUnysgHHc72wp34SA2-4AjUtgwA91
      |          |        | Review user guide. | https://docs.vmware.com/en/VMware-Cloud-on-AWS/index.html
      |          |        | Review hands-on guide. | https://dspinhirne.github.io/vmcbook/
      |          |        | Identify personnel required for on-boarding. | 
      |          |        | Fund User/Fund Owner must complete user profile in my.vmware.com account (all items within your profile with red *). | 
      |          |        | Identify or create a customer-owned AWS account. | 
      |          |        | Identify AWS region for SDDC deployment. | 
      |          |        | Identify or create VPC within above region. | This is for SDDC cross-linking.
      |          |        | Identify or create a dedicated subnet in the desired availability zone within above VPC. | This is for SDDC Cross-Account ENIs. Dedicated /26 minimum.
      |          |        | Identify SDDC Management IP address range. | /23 scales to 27 hosts, /20 scales to 251 hosts.
      |          |        | Identify SDDC Compute network IP address range(s). | This is for network segments in the compute network. minimum /30, maxiumum /22 per segment.
      |          |        | Identify strategy for integrating custom DNS servers with the SDDC. | e.g. create within SDDC or integrate with on-prem.
      |          |        | Identify strategy for connectivity to the SDDC (i.e. IPSec VPN or Direct Connect) | 

<button onclick="exportCSV('pre-on-boarding-plan')" style="float:right;">Export</button>
</figure>
</section>

<section markdown="1" id="personnel">
### Personnel Required for On-Boarding
A critical first step in the planning process is to identify personnel (both technical and non-technical) who will be involved in the initial on-boarding process as well as those personnel who will be involved in the actual deployment of an SDDC. The following is a list of common "roles" required to activate the service and deploy an SDDC. Note that a single person may encompass more than one role.

* Fund Owner - Required to provide funding for VMware Cloud services and initiate the activation process. The Fund Owner must have an account on my.vmware.com, and all required fields of the account profile must be filled in. Especially important is the email address of this user since this email address will be used as the recipient of the activation email.
* AWS admin - Required to ensure that at least 1 user is created with the permissions necessary to run the CloudFormation template used for account linking.
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
One of the requirements of the VMware Cloud On AWS service is that all deployed SDDCs be linked to a customer's dedicated  AWS account. If there is a preexisting account then it may be used for the cross-linking. However, if there is no account in place then one must be created prior to on-boarding.

Once an AWS account has been identified, then the next step is to ensure that all technical personnel have been added to the account and that they have been configured with the permissions necessary to properly manage the account. At minimum, there must be one user within the AWS account who has sufficient permissions to execute the CloudFormation template which performs the cross-linking to the SDDC.

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

</section>




<section markdown="1" id="on-boarding">
## On-Boarding
On-Boarding focuses on service activation and SDDC deployment. 

<section markdown="1" id="on-boarding-plan">
### Project Plan
<figure markdown="1" class="full-width">

Owner | Due Date | Status | Task | Comments
------|----------|--------|------|---------
      |          |        | Create cloud services Organization (Org). | 
      |          |        | Create Term Subscription. | i.e. 1-year or 3-year reservation.
      |          |        | Instantiate SDDC with information gathered during Pre-Onboarding stage. | 
      |          |        | Create Compute network segment(s) within the SDDC. | 
  
<button onclick="exportCSV('on-boarding-plan')" style="float:right;">Export</button>
</figure>
</section>

</section>



<section markdown="1" id="security">
## Security
Security tasks will be performed during different phases of the deployment. Use your best judgement on when deciding at which phase to perform each task.


<section markdown="1" id="security-plan">
### Project Plan
<figure markdown="1" class="full-width">

Owner | Due Date | Status | Task | Comments
------|----------|--------|------|---------
      |          |        | Plan security policy for SDDC Management network (Gateway Firewall). | 
      |          |        | Plan security policy for SDDC Compute Network (Gateway Firewall). | 
      |          |        | Plan security policy for SDDC Compute Network (Distributed Firewall). | 
      |          |        | Identify or create IAM user to run CloudFormation Template. | 
      |          |        | Review CloundFormation Temaplate required for account linking.  | 
      |          |        | Review IAM roles created by CloudFormation Template. | 

<button onclick="exportCSV('security-plan')" style="float:right;">Export</button>
</figure>
</section>

<section markdown="1" id="planning-network-security">
### Planning Network Security Policy
By default, the gateway firewalls of the SDDC are configured to deny all traffic. Firewall rules must be specifically created to permit access; this includes both traffic to and from the public internet as well as traffic between the cross-linked VPC and any VPNs or Direct Connects which have been configured. As such, and important part of the planning process is to determine a basic security policy for use within the SDDC. 

Here are some things to consider:
* Determine who within your organization is required to review and approve security policy decisions.
* Determine how the SDDC will be accessed remotely, from where, and what source/destination IP addresses and TCP/UDP ports are required to facilitate the connectivity.
* Determine what services will be accessed within the on-premises and AWS environments from workloads within the SDDC.
* Understand that the gateway firewalls filter traffic in both directions. This means that security policy must be explicitly defined for inbound requests as well as for outbound requests initiated from the SDDC.

</section>

</section>




<section markdown="1" id="ipsec-vpn">
## IPSec VPN
Planning for IPSec VPN is only required if you plan on implementing it.

<section markdown="1" id="ipsec-vpn-plan">
### Project Plan
<figure markdown="1" class="full-width">

Owner | Due Date | Status | Task | Comments
------|----------|--------|------|---------
      |          |        | Identify VPN type to create (policy-based or route-based). | 
      |          |        | Identify VPN endpoint(s) to connect to SDDC edge. | 
      |          |        | Identify networks within SDDC to include within VPN. | for policy-based vpn only
      |          |        | Identify remote networks to include within VPN policy. | for policy-based vpn only
      |          |        | Identify BGP peering address space for the VTI(s). | for route-based vpn only
      |          |        | Identify BGP ASNs to be used for SDDC. | for route-based vpn only
      |          |        | Identify on-prem routes to be advertised to the SDDC. | for route-based vpn only
      |          |        | Create or adjust prefix-lists or other filters for BGP. | for route-based vpn only

<button onclick="exportCSV('ipsec-vpn-plan')" style="float:right;">Export</button>
</figure>
</section>

</section>




<section markdown="1" id="dx">
## Direct Connect
Planning for Direct Connect is only required if you plan on implementing it.

<section markdown="1" id="dx-plan">
### Project Plan
<figure markdown="1" class="full-width">

Owner | Due Date | Status | Task | Comments
------|----------|--------|------|---------
      |          |        | Identify Direct Connect circuit(s) to be connecte to the SDDC. | 
      |          |        | Identify BGP peering address space for the Direct Connect Private VIF(s). | 
      |          |        | Identify BGP ASNs to be used for Direct Connect Private VIF(s). | 
      |          |        | Identify BGP ASNs to be used for Direct Connect Private VIF(s). | 
      |          |        | Identify on-prem routes to be advertised to the SDDC. | 
      |          |        | Create or adjust prefix-lists or other filters for BGP. | 

<button onclick="exportCSV('dx-plan')" style="float:right;">Export</button>
</figure>
</section>

</section>




<section markdown="1" id="vidm">
## vIDM
Planning for vIDM is only required if you plan on implementing 2-factor authentication to the VMWare Cloud console itself.

<section markdown="1" id="vidm-plan">
### Project Plan
<figure markdown="1" class="full-width">

Owner | Due Date | Status | Task | Comments
------|----------|--------|------|---------
      |          |        | Review VMware Identity Manager documentation. | https://docs.vmware.com/en/VMware-Identity-Manager/services/com.vmware.vidm-cloud-deployment/GUID-75670D52-DAB5-404A-9C92-3C35C5DA6438.html
      |          |        | Identify service account that will be used for binding. | 
      |          |        | Identify users and groups to be granted access. | 
      |          |        | Identify IT Admin who will deploy on-prem component and initial configuration tasks. | https://docs.vmware.com/en/VMware-Identity-Manager/services/com.vmware.vidm-cloud-deployment/GUID-3BE4CD76-9AD4-4B7C-BFD9-33B05D0AA244.html
      |          |        | Identify integration type, Active Directory or 3rd Party IdP. | 
      |          |        | Create Windows instance for VMware Identity Manager installation. | https://docs.vmware.com/en/VMware-Identity-Manager/services/identitymanager-connector-win/GUID-06085CBA-AF2C-41B6-B2E3-DA65212BAABF.html
      |          |        | Identify IP address for on-prem connector. | 
      |          |        | Create DNS records (A and PTR). | https://docs.vmware.com/en/VMware-Identity-Manager/services/com.vmware.vidm-cloud-deployment/GUID-D4AFABF4-5115-4AB1-BEFC-EA5767A34A5C.html#GUID-D4AFABF4-5115-4AB1-BEFC-EA5767A34A5C
      |          |        | Identify SSL method (self-signed, internal-signed, 3rd party-signed). | 
      |          |        | Identify corporate proxy requirements. | 
      |          |        | Verify outbound firewall allows 443 from on-prem appliance. | https://docs.vmware.com/en/VMware-Identity-Manager/services/com.vmware.vidm-cloud-deployment/GUID-90BB7E45-4608-4935-9266-D2D5FABD28CE.html
      |          |        | Verify port requirements. | https://docs.vmware.com/en/VMware-Identity-Manager/services/com.vmware.vidm-cloud-deployment/GUID-90BB7E45-4608-4935-9266-D2D5FABD28CE.html
      |          |        | Identify Security Admin who will configure integration to Identity Source | 
      |          |        | Create backend enablement ticket. | 
      |          |        | Create VMware Identity Manager tenant. | 
      |          |        | Configure VMware Identity Manager tenant. | 
      |          |        | Verify VMware Identity Manager functionality. | 
      |          |        | Create backend mapping ticket. | 
      |          |        | Verify successful access to VMware Cloud Services Portal using corporate credentials. | 

<button onclick="exportCSV('vidm-plan')" style="float:right;">Export</button>
</figure>
</section>

</section>
