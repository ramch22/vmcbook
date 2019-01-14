---
layout: default
---



### Route-Based VPN Sample Device Configurations
The following sample configurations are designed to provide examples of known working configurations. However, they will require modification to your specific setup in order to actually work. These configurations are based on the following setup in the SDDC:

Setting | Value
--------|-------
Local IP Address | edge public IP 52.39.110.92
IKE Type | configs provided for both IKEv1 and IKEv2
Tunnel Encryption | AES 256
Tunnel Digest Algorithm | SHA2
IKE Encryption | AES 256
IKE Digest Algorithm | SHA2
Perfect Forward Secrecy | enabled
Preshared Key | myverysecretkey
Diffie Hellman | Group 14
BGP Local IP/Prefix Length | 169.254.255.1/30
BGP Remote IP | 169.254.255.2
BGP Remote ASN | 64512
SDDC ASN Setting | 64513

<figcaption>SDDC VPN Settings</figcaption> 

Testing was performed to an EC2 instance in AWS. EC2 instances use NAT, so we must be sure to open up UDP 500/4500 (for NAT-t) inbound in the security group for the device.


#### Route-Based VPN: Cisco CSR (IOS XR) IKEv1

<pre class="mycode"><code>
! specify the pre-share key for the remote sddc edge
crypto keyring sddc
  ! the local private ip address
  local-address 192.168.250.43
  ! pre-shared key with sddc edge
  pre-shared-key address 52.39.110.92 key myverysecretkey
exit

! phase1 crypto - AES 256 SHA2-256
crypto isakmp policy 1
  encryption aes 256
  hash sha256
  authentication pre-share
  group 14
  ! this is typically a default setting
  lifetime 86400
exit

! create a profile for the remote sddc edge
crypto isakmp profile isakmp-sddc
  keyring sddc
  ! ip of sddc edge
  match identity address 52.39.110.92
  ! the local private ip address
  local-address 192.168.250.43
exit

! phase2 crypto - AES 256 SHA2-256. always use tunnel mode
crypto ipsec transform-set ipsec-sddc esp-aes 256 esp-sha256-hmac 
  mode tunnel
exit

! phase2 ipsec profile
crypto ipsec profile ipsec-profile-sddc
  set transform-set ipsec-sddc
  set pfs group14
  ! this is typically a default setting
  set security-association lifetime seconds 3600
exit

crypto ipsec df-bit clear
crypto isakmp keepalive 60 2 on-demand
crypto ipsec security-association replay window-size 128
crypto ipsec fragmentation before-encryption

! a fake network we will use for testing. this is definitely optional
interface Loopback0
 ip address 192.168.251.1 255.255.255.0
exit

! the VTI interface for route-based vpn
interface Tunnel0
  ! can use link-local address range here. use a range which is not currently in use on this router or the sddc edge
  ip address 169.254.255.2 255.255.255.252
  ip virtual-reassembly
  ! use the local private ip
  tunnel source 192.168.250.43
  ! ip of the sddc edge
  tunnel destination 52.39.110.92
  tunnel mode ipsec ipv4
  ! this enables ipsec encryption for the VTI
  tunnel protection ipsec profile ipsec-profile-sddc
  ip tcp adjust-mss 1379
  no shutdown
exit

! enable bgp with local asn
router bgp 64512
  ! the neighbor should be the VTI address of the sddc edge. use the asn specified in the vmc console
  neighbor 169.254.255.1 remote-as 64513
  neighbor 169.254.255.1 activate
  neighbor 169.254.255.1 timers 60 180 180
  address-family ipv4 unicast
    ! as a test, we will advertise the fake network we created on Loopback 0
    network 192.168.251.0 mask 255.255.255.0
    neighbor 169.254.255.1 activate
    neighbor 169.254.255.1 soft-reconfiguration inbound

  exit
exit
</code></pre>

#### Route-Based VPN: Cisco CSR (IOS XR) IKEv2

<pre class="mycode"><code>
! ikev2 crypto - AWS-256-CBC SHA-256
crypto ikev2 proposal ikev2-prop-sddc 
 encryption aes-cbc-256
 integrity sha256
 group 14
exit

! define an ikev2 policy
crypto ikev2 policy ikev2-policy-sddc 
 match fvrf any
 proposal ikev2-prop-sddc
exit

! define keyring for pre-shared key
crypto ikev2 keyring ikev2-keyring-sddc
 peer sddc
  ! ip of sddc edge
  address 52.39.110.92
  pre-shared-key myverysecretkey
  exit
exit

! ikev2 profile
crypto ikev2 profile ikev2-profile-sddc
 ! ip of sddc edge
 match identity remote address 52.39.110.92 255.255.255.255 
 ! local private ip of this router
 identity local address 192.168.250.43
 authentication remote pre-share
 authentication local pre-share
 keyring local ikev2-keyring-sddc
exit

crypto ikev2 dpd 60 2 on-demand
crypto ipsec security-association replay window-size 128
crypto ipsec df-bit clear

! ipsec proposal - AES-256 SHA-256
crypto ipsec transform-set ipsec-sddc esp-aes 256 esp-sha256-hmac 
 mode tunnel
exit

! ipsec profile using previously configured parameters
crypto ipsec profile ipsec-profile-sddc
 set transform-set ipsec-sddc 
 set pfs group14
 set ikev2-profile ikev2-profile-sddc
exit

! a fake network we will use for testing. this is definitely optional
interface Loopback0
 ip address 192.168.251.1 255.255.255.0
exit

! the VTI interface for route-based vpn
interface Tunnel0
  ! can use link-local address range here. use a range which is not currently in use on this router or the sddc edge
  ip address 169.254.255.2 255.255.255.252
  ip virtual-reassembly
  ! use the local private ip
  tunnel source 192.168.250.43
  ! ip of the sddc edge
  tunnel destination 52.39.110.92
  tunnel mode ipsec ipv4
  ! this enables ipsec encryption for the VTI
  tunnel protection ipsec profile ipsec-profile-sddc
  ip tcp adjust-mss 1379
  no shutdown
exit

! enable bgp with local asn
router bgp 64512
  ! the neighbor should be the VTI address of the sddc edge. use the asn specified in the vmc console
  neighbor 169.254.255.1 remote-as 64513
  neighbor 169.254.255.1 activate
  neighbor 169.254.255.1 timers 60 180 180
  address-family ipv4 unicast
    ! as a test, we will advertise the fake network we created on Loopback 0
    network 192.168.251.0 mask 255.255.255.0
    neighbor 169.254.255.1 activate
    neighbor 169.254.255.1 soft-reconfiguration inbound
  exit
exit
</code></pre>
