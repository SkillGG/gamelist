let x = document.getElementById('top_10');
x.replaceWith(document.createElement('div'));
document.body.append(x);
let y = document.querySelector('div');
y.replaceWith(document.createElement('div'));
document.body.append(y);