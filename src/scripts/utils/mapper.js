// https://github.com/tommycor/mapperJS/blob/master/mapper-min.js
function mapper(val,oMin,oMax,nMin,nMax){return(((val-oMin)*(nMax-nMin))/(oMax-oMin))+(nMin);}

module.exports = mapper;