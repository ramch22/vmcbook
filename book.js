function createTOC(){
  var toc = document.getElementById("chapter-toc");
  if (toc){
    enableBtns();
    var ol = toc.getElementsByTagName("OL")[0];
    var hs = document.getElementsByClassName("section-header");
    var i;
    for (i = 0; i < hs.length; i++) {
      var a = document.createElement("A");
      a.textContent = hs[i].textContent;
      a.href = "#" + hs[i].id;
      var li = document.createElement("LI");
      li.appendChild(a);
      ol.appendChild(li);
    }
  }
}

function enableBtns(){
  var p = document.getElementById("print-button");
  var c = document.getElementById("contents-button");
  p.style.display = "inline-block";
  c.style.display = "inline-block";
}

window.onload = function() {
  createTOC();
};
