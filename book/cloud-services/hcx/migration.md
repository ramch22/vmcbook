---
layout: chapter
---

<section markdown="1" id="the-migration-process">
## The Migration Process
Once the HCX setup has been sufficiently tested, documented, and migration planning and backout plans have been developed, then the migration may commence. You will want to ensure that all required network extensions are in place prior to starting any migrations.

Migrations will take place in waves, per the wave planning developed as part of the migration plan. After each migration wave completes, you will want to perform validation of the given migration wave, per the post-migration validation plan. At the completion of the migration a final validation should be performed prior to marking the migration completed.
</section>




<section markdown="1" id="post-migration-network-cutover">
## Post-Migration Network Cutover
Once the migration of workloads has been completed, the final step of the overall migration effort will be to perform a network "cutover" of any extended networks which will be be made native to the SDDC. A network cutover will involve removing the network extension to the SDDC and converting that network from a "disconnected" to a "routed" type within the SDDC. As a prerequisite for a cutover event, the source side of an extended network **must** have been fully evacuated (i.e. contains no devices other than the default gateway). If the network contains resources which will not be migrated to the SDDC, then they must be moved to another network which will remain within the source site.

The process for a network cutover is roughly as follows:
1. Prepare the SDDC to act as the authority for the networks. This means reviewing the security policy of the SDDC to ensure that workloads will be reachable once the networks have been cut-over.
2. Review the routing between the source site and the SDDC. Understand what will be required to ensure that the migrated networks are known via the SDDC. For example, this may mean adjusting prefix-lists to ensure that BGP routes propagate over IPSec or Direct Connect.
3. Schedule a maintenance.
4. At the start of the maintenance, unstretch the networks. You may choose to convert the networks to routed or leave as disconnected as part of the unstretch.
5. Shut down the networks on the source site (i.e. shut down default gateway interfaces).
6. If SDDC networks were left as disconnected, convert them to routed.
7. Adjust routing such that the migrated networks are reachable via the SDDC from the source site.
8. Verify connectivity to migrated workloads.

</section>
