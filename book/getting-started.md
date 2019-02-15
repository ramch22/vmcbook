---
layout: chapter
---

<section markdown="1" id="activation">
## Activation

Activation of VMware Cloud services requires 2 things:
1. At least one person with a valid [My VMware]({{ site.data.links.vmw.my.url }}) account. The profile for this account **must** have all required fields populated. See [this](https://kb.vmware.com/s/article/2086266) kb for instructions on updating the profile.
2. A source of funding for the services (either credit card or through a [My VMware]({{ site.data.links.vmw.my.url }}) account.

For [VMware Cloud on AWS]({{ site.data.links.vmw.vmcaws.url }}), activation may either be performed in a [self-serve]({{ site.data.links.vmw.vmcaws_get_started.url }}) manner or through an Account Manager. The activation will be associated to a My VMware profile and the owner of this profile will be considered to be the **"Fund Owner"** for VMware Cloud services. Once you have been approved for services an activation email will be sent to the email address configured under the  Fund Owner's My VMware profile. Clicking this link will activate your VMware Cloud account.

</section>


<section markdown="1" id="the-vmware-cloud-organization">
## The VMware Cloud Organization

The [VMware Cloud]({{ site.data.links.vmw.vmc.url }}) Organization (Org) may be thought of as a top-level construct which owns 1 or more cloud services. There will be 1 or more users associated with an org, the first of which being the Fund Owner who activated the Org.

Typically, the first task of the Fund Owner will be to add additional users to the Org. This may be performed from the Identity & Access Management section of the [cloud console]({{ site.data.links.vmw.cloud_console.url }}).

<figure>
  <img src="{{ '/book/illustrations/getting-started/iam.png' | relative_url }}">
  <figcaption>Identity & Access Management</figcaption>
</figure>


Users within VMware Cloud are associated with 1 or more Orgs and, within each Org, a user will have 1 of 2 roles :
* Org User - Have the ability to manage cloud services to which they have been granted access. Permissions may be set per cloud service.
* Org Owner - Have the additional ability to manage users within the org.

The Fund Owner will be given the role of Org Owner within the newly created Org.

<figure>
  <img src="{{ '/book/illustrations/getting-started/vmcOrg.png' | relative_url }}">
  <figcaption>VMware Cloud Organization (Org)</figcaption>
</figure>

Key points to remember about an Org :
* An Org is a top-level construct which owns other cloud services.
* Users are associated with an Org and have one of two roles: Org Owner and Org User.
* Users are only relevant within the VMware Cloud console.
* The Fund Owner will fund/activate the Org and will be given the role of Org Owner. The Fund Owner will add the other users


Please refer to the [User Guide]({{ site.data.links.vmw.vmcaws_docs.url }}) for more information on creating and managing the cloud services Org.

</section>


<section markdown="1" id="the-customer-success-team">
## The Customer Success Team

The purpose of the VMware Customer Success (CS) team is to act as a customer advocate, and is a resource which is available throughout the entire lifetime of the customer's relationship with VMware. The VMware Cloud CS team is divided into two functions:
1. Customer Success management team
2. Customer Success technical team

These functions are described below.

##### Customer Success Management Team
Fielded by a Customer Success Manager (CSM), this team proactively manages the customer experience with VMware Cloud. Generally, each customer will be assigned a dedicated CSM who will be responsible for the following:
* Develops strong business relationships with key customer stakeholders.
* Develops and maintains success plans for the customer and tracks customer satisfaction with VMware Cloud.
* Facilitate customer interaction with the CS technical team and VMware Product Management and engineering teams.


##### Customer Success Technical Team
The technical team is broken up into two roles:
1. Cloud Services Engineering (CSE)
2. Cloud Services Architects (CSA)

The CSE acts as the primary point of contact for technical issues with VMware Cloud service deployments. For critical issues, CSEs are available immediately via chat support. For non-critical issues, the CSM may schedule a session with a CSE on the behalf of the customer.

The function of the CSA is to help refine customer business cases, provide design consulting and architectural review services, and to provide technical workshops to customers. The CSA is intended to act as a technical resource for anything beyond technical support issues. Like the CSE, a CSM may schedule sessions with a CSA on behalf of the customer.

Once key attribute of the technical team is that they provide technical **guidance** to customers and do not have the ability to provide hands-on-keyboard type activities. The CS Technical team is meant to act as a resource for customers who want to "do it themselves, but with guidance". For hands-on-keyboard services, the VMware Professional Services team is a more suitable resource and offer design/deploy services which are geared toward customers who need a scoped engagement with defined deliverables.

</section>


<section markdown="1" id="support-model">
## Support Model

Support in VMware Cloud is broken up into two functions:
1. Front-end support
2. Back-end support

Front-end support is delivered in the form of the CS technical team and is directly available via live-chat or through a formal session scheduled by a CSM. For critical support issues, live-chat is the fastest means of accessing the font-end support teams. In the event that live-chat is unavailable, then front-end support is available by telephone.

Back-end support is delivered in the form of one or more VMware Site Reliablility Engineering (SRE) teams. The SRE teams are responsible for managing and maintaining all cloud services, and perform monitoring of all critical infrastructure under their control. The SRE teams are also responsible for performing updates/upgrades to certain components of the various cloud services. For example, for VMware Cloud on AWS this team is responsible for upgrading the infrastructure components of every production Software Defined Data Center (SDDC) which has been deployed within VMware Cloud.

Since VMware Cloud is an As-A-Service offering, the support model is designed to be 24x7x365. The target response times, however, depend on the severity of the issue. The following table outlines these target response times:

<figure markdown="1">

Severity     | Target Response Time
-------------|---------------------
1            | 30 minutes or less
2            | 4 business hours
3            | 8 business hours
4            | 12 business hours

  <figcaption>Targeted Support Response Times</figcaption>
</figure>

</section>
