---
layout: default
---

<header>
  <div class="titles">
    <h1>{{ site.data.book.urls["/"].title }}</h1>
    <h2>{{ site.data.book.urls["/"].subtitle }}</h2>
  </div>
  <div class="authors">
  {% for author in site.data.book.authors %}<p>{{ author }}</p>{% endfor %}
  </div>
</header>
        
<section markdown="1">
## Foreword
This book is designed as a technical resource for anyone planning on implementing services on [VMware Cloud]({{ site.data.links.vmw.cloud }}) and is a work-in-progress. The content for this book is maintained in the following git repository: [https://github.com/dspinhirne/vmcbook](https://github.com/dspinhirne/vmcbook) 

Links to reference material, including the source drawings for this book, are available in the Resources section of the Appendix.
</section>

