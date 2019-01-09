---
layout: default
---


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
