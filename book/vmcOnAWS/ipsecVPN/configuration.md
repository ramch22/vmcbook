---
layout: default
---

IPSec VPN is configured from within the [VMC console](https://vmc.vmware.com) by navigating to the Network & Security tab of the SDDC. The public VPN IP of the tier-0 edge is visible on the Overview page. The VPN item on the left-hand navigation will provide options for configuring both Policy and Route Based VPN.

<figure>
  <img src="./illustrations/vmcConsoleVPN.png">
  <figcaption>Step 1</figcaption>
</figure>


#### Policy-Based VPN
To create a policy-based VPN, click on the Policy Based menu item on the left-hand navigation pane and then click the Add VPN button.

<figure>
  <img src="./illustrations/vmcConsolePolicyVPN.png">
  <figcaption>Step 1</figcaption>
</figure>

The fields are as follows:
* Name - Give the VPN a name which is meaningful to you.
* Local IP Address - You may choose to bind the VPN to either the public or private IP of the edge gateway. For policy-based VPN, you should choose the public IP.
* Remote Public IP - Provide the public IP of the remote VPN peer.
* Remote Networks - Provide a comma-delimited list of networks which should be reachable by the SDDC via the VPN (e.g. 10.0.0.0/8).
* Local Networks - Choose which networks within the SDDC should be reachable from the remote network via the VPN.
* Advanced - These are the crypto settings for the VPN.
  - IKE Type - the IKE version to use
  - Tunnel Encryption and Tunnel Digest Algorithm - these are the IKE phase 2 or IPSec Proposal settings for IKEv1 and IKEv2 respectively.
  - IKE Encryption and IKE Digest Algorithm - these are the IKE phase 1 or IKE crypto settings for IKEv1 and IKEv2 respectively.
  - Perfect Forward Secrecy - Enable or disable PFS. It is recommended to enable.
  - Preshared Key - the secret key for the VPN.
  - Diffie Hellman - the [DH](https://en.wikipedia.org/wiki/Diffie-Hellman_key_exchange) group to use.


#### Route-Based VPN
To create a route-based VPN, click on the Route Based menu item on the left-hand navigation pane and then click the Add VPN button.

<figure>
  <img src="./illustrations/vmcConsoleRouteVPN.png">
  <figcaption>Step 1</figcaption>
</figure>

The first step you should complete is to set the SDDCs BGP [ASN](https://en.wikipedia.org/wiki/Autonomous_system_(Internet)). You should typically use an ASN from the designated private range (64512 - 65534).

Most of the fields are identical to the ones defined for policy-based VPN, however, there are a few differences:
* BGP Local IP/Prefix Length - The IP address to use for the SDDC side of the VTI (e.g. 169.254.255.1/30)
* BGP Remote IP - The IP address of the remote end of the VTI (e.g. 169.254.255.2)
* BGP Remote ASN - The ASN of the remote VPN peer.
* Advanced BGP Parameters - A secret key for the BGP session.



#### Important Tips
Once you have configured and saved the VPN settings a link will appear which allows you to download the configuration for the VPN. Although this configuration is not vendor specific, the information is extremely helpful for configuring the remote VPN peer since it provides additional details not shown in the UI. Once you have downloaded the configuration, the next step will be to configure the remote end of the VPN. 

The following are things to consider when configuring VPN:
* Most implementations of policy-based VPN will set up one Security Association per Remote/Local network pair, and 1 tunnel will be used for each. Your policies must match networks on both ends *exactly* in order for a given tunnel to come up. If one or more tunnels do not come up then the VPN will show as partially connected.
* Crypto settings must match on both ends or the tunnel will fail to come up.
* The most common problem with VPN is mismatching configurations. Triple check your settings if your VPN fails to come up. You can get an idea of where the mismatch is based on which phase of the VPN failed.
* The second most common problem with VPN is firewall or NAT. If your VPN device is behind a no-NAT firewall then make sure that UDP 500 and IP protocol 50 are permitted inbound/outbound. If your device is behind a NAT firewall then make sure that UDP 500/4500 are permitted inbound/outbound (for NAT-t).


