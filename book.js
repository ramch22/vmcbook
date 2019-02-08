function createTOC(){
  var main = document.getElementById("main-content");
  var sections = main.querySelectorAll("main > section");
  if (sections.length > 1){
    var toc = document.createElement("SECTION");
    toc.classList.add("toc");
    main.insertBefore(toc, sections[0]);
    var tocTitle = document.createElement("H2");
    tocTitle.textContent = "Table of Contents";
    toc.appendChild(tocTitle);
    var ol = document.createElement("OL");
    toc.appendChild(ol);
    // create a toc entry for each section using the first h2 as the title
    var i;
    for (i = 0; i < sections.length; i++) {
      var h2 = sections[i].querySelector("h2");
      if (h2){
        var h2a = document.createElement("A");
        h2a.textContent = h2.textContent;
        h2a.href = "#" + sections[i].id;
        h2.textContent = (i+1).toString() + ") " + h2.textContent; // prepend number to h2
        var li = document.createElement("LI");
        li.appendChild(h2a);
        ol.appendChild(li);
      }
      
      // create toc entries for subsections of each secion, using first h3 of each as title
      var subsections = sections[i].querySelectorAll("section");
      if (subsections.length != 0){
        var ol2 = document.createElement("OL");
        var i2;
        for (i2 = 0; i2 < subsections.length; i2++) {
          var h3 = subsections[i2].querySelector("h3");
          if (h3){
            var h3a = document.createElement("A");
            h3a.textContent = h3.textContent;
            h3a.href = "#" + subsections[i2].id;
            h3.textContent = (i+1).toString() + "." + (i2+1).toString() + ") " + h3.textContent; // prepend number to h3
            var li2 = document.createElement("LI");
            li2.appendChild(h3a);
            ol2.appendChild(li2);
          }
        }
        li.appendChild(ol2);
      }
    }
  }
} 


window.onload = function() {
  createTOC();
};
