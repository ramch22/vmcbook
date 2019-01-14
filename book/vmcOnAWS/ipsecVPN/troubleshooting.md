---
layout: default
---

The vast majority of issues with the initail setup of IPSec VPN are due to misconfigurations on the remote end. The following are sample error messages captured from the VMC console which are intended to help the reader identify errors due to misconfiguration of their end of the VPN. These error messages are visible by clicking on the "i" pop-up of the Status section of a saved VPN.

<figure>
  <img src="./illustrations/vmcConsoleStatus.png">
  <figcaption>VPN Status</figcaption>
</figure>

There are 3 parts to consider:
1. The overall Status
2. The Channel Status - relevant to IKE phase 1 or initial exchange
3. Tunnel Status - each tunnel will have an independent status. Route-based VPN will only have a single tunnel (0.0.0.0/0).

**Important Tip** - If you make changes to the VPN, it is sometimes helpful to disable and re-enable it from the dropdown menu of the vpn. This seems to force the configuration changes to sync in a more timely manner.


Status | Channel Status | Tunnel Status | Possible Problem
-------|----------------|---------------|------------------
Down   | Negotiating    | Down (Error Message: IPSec negotiation not started) | Remote peer not configured, pre-share key mismatch, or firewall blocking IPSec
Down   | Down (Error Message: No proposal chosen) | Down (Error Message: IKE SA down) | IKE version mismatch or phase1 crypto mismatch
In Progress | Up | Down (Error Message: No proposal chosen) | phase2 crypto mismatch

<figcaption>Common Errors</figcaption>

For route-based VPN there is also a BGP component required. The status messages for BGP in the VMC console are not very helpful, but if the status is yellow then it means that there is a problem with establishing a BGP session with the peer. Here are a few things to check:
* verify the Local ASN setting in the SDDC matches the remote peer's BGP neighbor configuration.
* verify that the remote ASN setting in the SDDC is correct.
* verify that the remote peer's BGP neighbor is using the SDDCs VTI address.

Again, if you make changes to the BGP configuration then it is best to disable and re-enable the VPN to force the BGP session to attempt to establish. 

If BGP is up but nothing is being routed across the VTI, then check that you are receiving/advertising BGP prefixes on the remote device. If not, then it could be that a prefix-list or other filter is in place.
