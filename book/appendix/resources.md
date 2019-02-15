---
layout: chapter
---

<section markdown="1" id="drawings-and-other-files">
## Drawings and Other Files

<figure markdown="1" class="full-width">
<table>
<thead><tr><th>Resource</th><th>Description</th></tr></thead>
<tbody>
{% for link in site.data.links.other %}
<tr><td><a href="{{ link[1].url }}">{{ link[1].title }}</a></td><td>{{ link[1].desc }}</td></tr>
{% endfor %}
</tbody>
</table>
</figure>
</section>




<section markdown="1" id="vmware-cloud-resources">
## VMware Cloud
<figure markdown="1" class="full-width">
<table>
<thead><tr><th>Resource</th><th>Description</th></tr></thead>
<tbody>
{% for link in site.data.links.vmw %}
<tr><td><a href="{{ link[1].url }}">{{ link[1].title }}</a></td><td>{{ link[1].desc }}</td></tr>
{% endfor %}
</tbody>
</table>
</figure>
</section>




<section markdown="1" id="aws-resources">
## AWS

<figure markdown="1" class="full-width">
<table>
<thead><tr><th>Resource</th><th>Description</th></tr></thead>
<tbody>
{% for link in site.data.links.aws %}
<tr><td><a href="{{ link[1].url }}">{{ link[1].title }}</a></td><td>{{ link[1].desc }}</td></tr>
{% endfor %}
</tbody>
</table>
</figure>
</section>
