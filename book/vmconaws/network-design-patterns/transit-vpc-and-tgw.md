---
layout: chapter
---

<section markdown="1" id="introduction">
## Introduction
Although the SDDC is connected directly to a cross-link VPC, it is commonly required that it be able to securely connect to multiple additional VPCs as well. The most common means of achieving this are using the following solutions from AWS:
* [Transit VPC]({{ site.data.links.aws.transit_vpc.url}})
* [Transit Gateway]({{ site.data.links.aws.tgw.url}})

These solutions, and their integration with the SDDC, are discussed in the following sections.

</section>




<section markdown="1" id="transit-vpc">
## Transit VPC
A [Transit VPC]({{ site.data.links.aws.transit_vpc.url}}) is a special [VPCs]({{ site.data.links.aws.vpc_subnets.url}}) which enables a hub-and-spoke interconnetivity model for 2 or more branch networks within an AWS installation. It operates on the notion that the customer will create an IPSec VPN "overlay" network which will enable the Transit VPC to act as the hub in the design. This IPSec VPN overlay enables customers to overcome the normal limitations on VPCs which prohibit transitive routing (i.e. one VPC forwarding traffic between 2 other networks).

<figure>
  <img src="{{ '/book/illustrations/vmconaws/network-design-patterns/transit-vpc-and-tgw/transit-vpc.png' | relative_url }}">
  <figcaption>A Transit VPC</figcaption>
</figure>

The hub-and-spoke model enabled with a Transit VPC is advantageous in that it:
* It simplifies the interconnectivity between large numbers of VPCs by eliminating the need for a full-mesh network. A full-mesh network would otherwise require n(n-1)/2 interconnects (where n is the number of VPC or other branch networks).
* It enables a central entry point for Direct Connect or IPSec VPN to on-premises networks.
* It enables a central point of enforcement for security appliances.

SDDC integration with a Transit VPC is simple and uses route-based IPSec VPN from the tier-0 edge of the SDDC to the VPN endpoints in the Transit VPC. From the perspective of the Transit VPC, an SDDC is just another branch in the hub-and-spoke design. 


</section>




<section markdown="1" id="transit-gateway">
## Transit Gateway
[Transit Gateway]({{ site.data.links.aws.tgw.url}}) is a new service from AWS which is designed to offer a high-speed hub in a hub-and-spoke design. Transit Gateway has an advantage over Transit VPC in that it dispenses with the need for an IPSec VPN overlay when connecting to branch VPCs. This high-speed direct link simplifies the configuration and eleminates the overhead and throughput limitations of IPSec encryption. 

For non-VPC branch networks, IPSec VPN is still a requirement. Non-VPC branches would include:
* On-Premises VPN endpoints
* Specialized security devices which must exchange routes with the Transit Gateway
* SDDCs

<figure>
  <img src="{{ '/book/illustrations/vmconaws/network-design-patterns/transit-vpc-and-tgw/tgw.png' | relative_url }}">
  <figcaption>Transit Gateway</figcaption>
</figure>

Today, the SDDC is considered to be a non-VPC branch and requires IPSec VPN. This integration behaves in a similar manner as Transit VPC. However, there are plans on the roadmap to address this limitation and allow the SDDC to integrate as a VPC branch.

</section>
