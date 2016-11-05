/**
 * Created by kaseymccormick on 11/5/16.
 */

window.onload(
function handleDragStart(e) {
    this.style.opacity = '0.4';  // this / e.target is the source node.
}

var cols = document.querySelectorAll('#columns .column');
[].forEach.call(cols, function(col) {
    col.addEventListener('dragstart', handleDragStart, false);
});
)