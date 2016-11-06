/**
 * Created by kaseymccormick on 11/5/16.
 */

window.onload = function() {

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("Text",ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data=ev.dataTransfer.getData("Text");
    ev.target.appendChild(document.getElementById(data).cloneNode(true));
}
};