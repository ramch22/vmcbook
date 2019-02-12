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
