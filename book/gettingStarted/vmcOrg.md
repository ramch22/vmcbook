---
layout: default
---

The [VMware Cloud]({{ site.data.links.vmw.vmc }}) Organization (Org) may be thought of as a top-level construct which owns 1 or more cloud services. There will be 1 or more users associated with an org, the first of which being the Fund Owner who activated the Org.

Typically, the first task of the Fund Owner will be to add additional users to the Org. This may be performed from the Identity & Access Management section of the [cloud console]({{ site.data.links.vmw.cloud_console }}).

<figure>
  <img src="./illustrations/iam.png">
  <figcaption>Identity & Access Management</figcaption>
</figure>


Users within VMware Cloud are associated with 1 or more Orgs and, within each Org, a user will have 1 of 2 roles :
* Org User - Have the ability to manage cloud services to which they have been granted access. Permissions may be set per cloud service.
* Org Owner - Have the additional ability to manage users within the org.

The Fund Owner will be given the role of Org Owner within the newly created Org.

<figure>
  <img src="./illustrations/vmcOrg.png">
  <figcaption>VMware Cloud Organization (Org)</figcaption>
</figure>

Key points to remember about an Org :
* An Org is a top-level construct which owns other cloud services.
* Users are associated with an Org and have one of two roles: Org Owner and Org User.
* Users are only relevant within the VMware Cloud console.
* The Fund Owner will fund/activate the Org and will be given the role of Org Owner. The Fund Owner will add the other users


Please refer to the [User Guide]({{ site.data.links.vmw.vmcaws_docs }}) for more information on creating and managing the cloud services Org.
