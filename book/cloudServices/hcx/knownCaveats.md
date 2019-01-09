---
layout: default
---


#### Networking

##### HCX over Direct Connect Private VIF requires manual configuration
HCX over Direct Connect Private VIF requires manual configuration by VMware. In order for HCX traffic to ride over Direct Connect Private VIF, the cloud-side appliances must bind to a private IP. For this, customers must allocate an additional private IP range for HCX to use. A unique subnet should be used, that will be advertised by the SDDC over the private VIF in addition to the Management & Compute networks. This subnet cannot be taken from nor overlap the existing Management or Compute networks.
The size of this subnet will depend on how many vCenters HCX will deployed to on-prem, and how many L2C appliances will be deployed. One IP is required per interconnect or L2C appliance.  One Interconnect appliance is required per vCenter, and a minimum of 1 L2C per vDS with networks to be extended, and a maximum of 8 networks can be extended per L2C appliance.  It is also possible to deploy additional L2Cs for higher scale requirements (up to 1 per extended network). In most cases, a /29 will be sufficient, however if there are many networks and/or vDS or vCenters to extend networks on, a larger subnet should be provided.

The process for configuring HCX for Private VIF will be as follows:
1. Customer to activate HCX
2. Customer to allocate private IP range for cloud-side HCX appliances
3. Customer to contact VMware via live-chat and provide the private IP range
4. VMware to perform the configuration and contact the customer when finished
5. Customer to continue with on-premises installation

1. Customer to connect the Private VIF to the SDDC* (Note this step can be done before or after HCX is activated)
2. Customer to activate HCX on the SDDC
3. Customer to allocate private IP range for cloud-side HCX appliances
4. Customer to contact VMware via live-chat and provide the private IP range and confirm the SDDC they want to configure with HCX.
5. VMware to perform the configuration and contact the customer when finished
6. Customer to continue with on-premises installation.

There is one additional change that the customer must make, and this is with the site-pairing. Normally, the site-pairing will be done to the public IP of the cloud-side HCX Manager, over the Internet. However, this is not typically desirable in the case of Private VIF. In this case, the customer will want to establish the pairing with the private IP of the HCX manager such that the traffic will ride over the Direct Connect. This IP may be found directly within vCenter by looking at the HCX Manager which has been deployed within the SDDC, under the Management Resource Pool. Then the customer will need to connect to the on-prem HCX Manager by ensuring that SSH is enabled through the web interface, then ssh into it as the admin user, and run su - to access the root account. Create an entry within /etc/hosts of the on-prem HCX Manager using an editor such as vi. This entry should reflect the FQDN of the cloud-side HCX Manager (e.g. hcx-sddc.xx-xx-xx-xx.vmwarevmc.com), for example:

```

10.10.10.123	hcx.sddc-x-x-x-x.vmwarevmc.com

```


##### IP assignment for additional WAN Interconnect/Extension appliances requires VMware assistance.
When using HCX over the public internet, the cloud-side appliances will use public EIPs provided by AWS. There are 2 of these allocated by default for the WAN Interconnect/Extension appliances. If additional appliances are required by the customer, as described above, then they must contact VMware via live-chat and request additional EIPs be allocated to their SDDC for HCX. Once these have been allocated then the customer may continue with the deployment of the additional appliances.




#### vMotion

##### Virtual Machine Restrictions for vMotion
The following are summarized from the HCX user guide. Please refer to that document for details.
* VMs must be running vm hardware version vmx-09 or higher.
* underlying architecture, regardless of OS, must be x86 on Intel CPUs
* VM disk size cannot exceed 2 TB
* cannot have shared VMDK files
* cannot have any attached virtual media or ISOs
* cannot have change block tracking enabled

Note: Only 1 vMotion operation at a time can be running, and it is not recommended to perform migrations using vMotion while bulk migration replication is also in progress.


